import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proposal, ProposalDocument, ProposalStatus } from 'src/schema/proposal.schema';
import { FYPDocument, FYPDocumentDocument } from 'src/schema/document.schema';
import { Project, ProjectDocument, ProjectStatus } from 'src/schema/project.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { UploadDocumentDto } from 'src/dto/student.dto';

@Injectable()
export class ProposalService {
  constructor(
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(FYPDocument.name) private documentModel: Model<FYPDocumentDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async uploadProposal(
    studentId: string,
    file: Express.Multer.File,
  ) {
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    const project = await this.projectModel.findOne({ group: group._id });

    if (!project) {
      throw new NotFoundException('No project found for your group');
    }

    // Check if project idea is approved
    if (project.ideaStatus !== ProjectStatus.APPROVED) {
      throw new BadRequestException('You can only upload proposals after your project idea is approved by the supervisor');
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check if file is a ZIP
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      throw new BadRequestException('Only ZIP files are allowed');
    }

    // Check if proposal already exists
    const existingProposal = await this.proposalModel.findOne({
      project: project._id,
      status: { $in: [ProposalStatus.DRAFT, ProposalStatus.SUBMITTED] },
    });

    if (existingProposal) {
      // Update existing proposal
      await this.proposalModel.findByIdAndUpdate(existingProposal._id, {
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        uploadedBy: studentId,
        status: ProposalStatus.DRAFT,
      });

      const updatedProposal = await this.proposalModel.findById(existingProposal._id);

      return {
        message: 'Proposal updated successfully',
        proposal: updatedProposal,
      };
    }

    // Create new proposal
    const proposal = await this.proposalModel.create({
      project: project._id,
      group: group._id,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      uploadedBy: studentId,
      status: ProposalStatus.DRAFT,
    });

    return {
      message: 'Proposal uploaded successfully',
      proposal,
    };
  }

  async submitProposal(proposalId: string, studentId: string) {
    const proposal = await this.proposalModel.findById(proposalId).populate('group');

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const group = proposal.group as any;

    // Verify student is part of the group
    if (
      group.leader.toString() !== studentId &&
      !group.members.includes(studentId)
    ) {
      throw new ForbiddenException('You are not part of this proposal group');
    }

    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new BadRequestException('Only draft proposals can be submitted');
    }

    await this.proposalModel.findByIdAndUpdate(proposalId, {
      status: ProposalStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    const updatedProposal = await this.proposalModel.findById(proposalId);

    return {
      message: 'Proposal submitted successfully',
      proposal: updatedProposal,
    };
  }

  async uploadDocument(
    studentId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    const project = await this.projectModel.findOne({ group: group._id });

    if (!project) {
      throw new NotFoundException('No project found for your group');
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check if file is a ZIP
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      throw new BadRequestException('Only ZIP files are allowed');
    }

    const document = await this.documentModel.create({
      project: project._id,
      group: group._id,
      documentType: dto.documentType,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      uploadedBy: studentId,
      description: dto.description,
    });

    return {
      message: 'Document uploaded successfully',
      document,
    };
  }

  async getMyDocuments(studentId: string) {
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    const documents = await this.documentModel
      .find({ group: group._id })
      .populate('uploadedBy', 'firstName lastName rollNumber')
      .sort({ createdAt: -1 });

    const proposal = await this.proposalModel
      .findOne({ group: group._id })
      .populate('uploadedBy', 'firstName lastName rollNumber')
      .sort({ createdAt: -1 });

    return {
      proposal: proposal || null,
      documents,
    };
  }
}
