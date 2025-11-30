import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from 'src/schema/project.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { ApproveIdeaDto, RejectIdeaDto } from 'src/dto/supervisor.dto';

@Injectable()
export class SupervisorIdeaApprovalService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  // Get all custom ideas pending approval
  async getCustomIdeas(supervisorId: string) {
    const projects = await this.projectModel
      .find({
        supervisor: supervisorId,
        customIdeaTitle: { $exists: true, $ne: null },
        ideaStatus: ProjectStatus.PENDING,
      })
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber' },
          { path: 'members', select: 'firstName lastName email rollNumber' },
        ],
      })
      .sort({ createdAt: -1 });

    return projects;
  }

  // Approve custom idea
  async approveCustomIdea(projectId: string, dto: ApproveIdeaDto, supervisorId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only approve ideas for your assigned groups');
    }

    if (!project.customIdeaTitle) {
      throw new BadRequestException('This is not a custom idea request');
    }

    if (project.ideaStatus !== ProjectStatus.PENDING) {
      throw new BadRequestException('This idea has already been reviewed');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      ideaStatus: ProjectStatus.APPROVED,
      supervisorFeedback: dto.comments,
      ideaApprovedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(projectId)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'Custom idea approved successfully',
      project: updatedProject,
    };
  }

  // Reject custom idea
  async rejectCustomIdea(projectId: string, dto: RejectIdeaDto, supervisorId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only reject ideas for your assigned groups');
    }

    if (!project.customIdeaTitle) {
      throw new BadRequestException('This is not a custom idea request');
    }

    if (project.ideaStatus !== ProjectStatus.PENDING) {
      throw new BadRequestException('This idea has already been reviewed');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      ideaStatus: ProjectStatus.REJECTED,
      rejectionReason: dto.reason,
      ideaRejectedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(projectId)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'Custom idea rejected',
      project: updatedProject,
    };
  }

  // Get all selected ideas (from supervisor's list) pending approval
  async getSelectedIdeas(supervisorId: string) {
    const projects = await this.projectModel
      .find({
        supervisor: supervisorId,
        selectedIdea: { $exists: true, $ne: null },
        ideaStatus: ProjectStatus.PENDING,
      })
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber' },
          { path: 'members', select: 'firstName lastName email rollNumber' },
        ],
      })
      .populate('selectedIdea')
      .sort({ createdAt: -1 });

    return projects;
  }

  // Approve selected idea
  async approveSelectedIdea(projectId: string, dto: ApproveIdeaDto, supervisorId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only approve ideas for your assigned groups');
    }

    if (!project.selectedIdea) {
      throw new BadRequestException('This project has no selected idea');
    }

    if (project.ideaStatus !== ProjectStatus.PENDING) {
      throw new BadRequestException('This idea has already been reviewed');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      ideaStatus: ProjectStatus.APPROVED,
      supervisorFeedback: dto.comments,
      ideaApprovedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(projectId)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      })
      .populate('selectedIdea');

    return {
      message: 'Selected idea approved successfully',
      project: updatedProject,
    };
  }

  // Reject selected idea
  async rejectSelectedIdea(projectId: string, dto: RejectIdeaDto, supervisorId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only reject ideas for your assigned groups');
    }

    if (!project.selectedIdea) {
      throw new BadRequestException('This project has no selected idea');
    }

    if (project.ideaStatus !== ProjectStatus.PENDING) {
      throw new BadRequestException('This idea has already been reviewed');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      ideaStatus: ProjectStatus.REJECTED,
      rejectionReason: dto.reason,
      ideaRejectedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(projectId)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      })
      .populate('selectedIdea');

    return {
      message: 'Selected idea rejected',
      project: updatedProject,
    };
  }
}
