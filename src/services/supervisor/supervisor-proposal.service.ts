import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proposal, ProposalDocument, ProposalStatus } from 'src/schema/proposal.schema';
import { ApproveProposalDto, RejectProposalDto, CommentProposalDto } from 'src/dto/supervisor.dto';

@Injectable()
export class SupervisorProposalService {
  constructor(
    @InjectModel(Proposal.name)
    private proposalModel: Model<ProposalDocument>,
  ) {}

  // Get all proposals for supervisor's groups
  async getProposals(supervisorId: string) {
    const proposals = await this.proposalModel
      .find({ status: { $in: [ProposalStatus.SUBMITTED, ProposalStatus.APPROVED, ProposalStatus.REJECTED] } })
      .populate({
        path: 'project',
        match: { supervisor: supervisorId },
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber' },
              { path: 'members', select: 'firstName lastName email rollNumber' },
            ],
          },
          { path: 'selectedIdea' },
        ],
      })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    // Filter out proposals where project doesn't match
    return proposals.filter((p) => p.project);
  }

  // Get single proposal
  async getProposal(id: string, supervisorId: string) {
    const proposal = await this.proposalModel
      .findById(id)
      .populate({
        path: 'project',
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber' },
              { path: 'members', select: 'firstName lastName email rollNumber' },
            ],
          },
          { path: 'supervisor', select: 'firstName lastName email' },
          { path: 'selectedIdea' },
        ],
      })
      .populate('uploadedBy', 'firstName lastName email');

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.project as any;
    if (project.supervisor._id.toString() !== supervisorId) {
      throw new ForbiddenException('You can only view proposals from your assigned groups');
    }

    return proposal;
  }

  // Approve proposal
  async approveProposal(id: string, dto: ApproveProposalDto, supervisorId: string) {
    const proposal = await this.proposalModel.findById(id).populate('project');

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only approve proposals from your assigned groups');
    }

    if (proposal.status !== ProposalStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted proposals can be approved');
    }

    await this.proposalModel.findByIdAndUpdate(id, {
      status: ProposalStatus.APPROVED,
      supervisorFeedback: dto.comments,
      reviewedAt: new Date(),
      reviewedBy: supervisorId,
    });

    const updatedProposal = await this.proposalModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Proposal approved successfully',
      proposal: updatedProposal,
    };
  }

  // Reject proposal
  async rejectProposal(id: string, dto: RejectProposalDto, supervisorId: string) {
    const proposal = await this.proposalModel.findById(id).populate('project');

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only reject proposals from your assigned groups');
    }

    if (proposal.status !== ProposalStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted proposals can be rejected');
    }

    await this.proposalModel.findByIdAndUpdate(id, {
      status: ProposalStatus.REJECTED,
      rejectionReason: dto.reason,
      reviewedAt: new Date(),
      reviewedBy: supervisorId,
    });

    const updatedProposal = await this.proposalModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Proposal rejected',
      proposal: updatedProposal,
    };
  }

  // Add comment to proposal
  async addComment(id: string, dto: CommentProposalDto, supervisorId: string) {
    const proposal = await this.proposalModel.findById(id).populate('project');

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only comment on proposals from your assigned groups');
    }

    await this.proposalModel.findByIdAndUpdate(id, {
      supervisorComments: dto.comment,
    });

    const updatedProposal = await this.proposalModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Comment added successfully',
      proposal: updatedProposal,
    };
  }
}
