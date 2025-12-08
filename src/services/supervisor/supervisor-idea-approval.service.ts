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

  // Get all assigned groups with complete details
  async getAllAssignedGroups(supervisorId: string) {
    // First get all groups assigned to this supervisor
    const groups = await this.groupModel
      .find({ assignedSupervisor: supervisorId })
      .populate({
        path: 'leader',
        select: 'firstName lastName email rollNumber',
      })
      .populate({
        path: 'members',
        select: 'firstName lastName email rollNumber',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get all projects for these groups
    const groupIds = groups.map((group: any) => group._id);
    const projects = await this.projectModel
      .find({ group: { $in: groupIds } })
      .populate({
        path: 'selectedIdea',
        select: 'title description',
      })
      .lean();

    // Create a map of group ID to project
    const projectMap = new Map();
    projects.forEach((project: any) => {
      projectMap.set(project.group.toString(), project);
    });

    // Format the response with complete details
    const formattedGroups = groups.map((group: any) => {
      const project = projectMap.get(group._id.toString());
      
      return {
        id: group._id,
        name: group.name,
        department: group.department,
        leader: {
          id: group.leader._id,
          name: `${group.leader.firstName} ${group.leader.lastName}`,
          email: group.leader.email,
          rollNumber: group.leader.rollNumber,
        },
        members: group.members.map((member: any) => ({
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          rollNumber: member.rollNumber,
        })),
        projectTitle: project?.customIdeaTitle || project?.selectedIdea?.title || 'No Project Yet',
        status: project?.ideaStatus || 'not_started',
        createdAt: group.createdAt,
        projectIdea: project ? {
          id: project._id,
          title: project.customIdeaTitle || project.selectedIdea?.title || '',
          description: project.customIdeaDescription || project.selectedIdea?.description || '',
          customIdeaTitle: project.customIdeaTitle,
          customIdeaDescription: project.customIdeaDescription,
          isCustomIdea: !!project.customIdeaTitle,
          ideaStatus: project.ideaStatus,
          supervisorComment: project.supervisorFeedback || project.rejectionReason,
          githubUrl: project.githubRepositoryUrl,
          githubMarks: project.githubMarks,
          totalMarks: project.totalMarks,
          approvedAt: project.ideaApprovedAt,
          rejectedAt: project.ideaRejectedAt,
        } : null,
      };
    });

    return formattedGroups;
  }

  // Get single assigned group by ID with complete details
  async getAssignedGroupById(groupId: string, supervisorId: string) {
    const group = await this.groupModel
      .findOne({ _id: groupId, assignedSupervisor: supervisorId })
      .populate({
        path: 'leader',
        select: 'firstName lastName email rollNumber',
      })
      .populate({
        path: 'members',
        select: 'firstName lastName email rollNumber',
      })
      .lean();

    if (!group) {
      throw new NotFoundException('Group not found or you are not assigned to this group');
    }

    // Get the project for this group
    const project = await this.projectModel
      .findOne({ group: groupId })
      .populate({
        path: 'selectedIdea',
        select: 'title description',
      })
      .lean();

    // Format complete group details
    const formattedGroup = {
      id: group._id,
      name: group.name,
      department: group.department,
      leader: {
        id: (group as any).leader._id,
        name: `${(group as any).leader.firstName} ${(group as any).leader.lastName}`,
        email: (group as any).leader.email,
        rollNumber: (group as any).leader.rollNumber,
      },
      members: (group as any).members.map((member: any) => ({
        id: member._id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        rollNumber: member.rollNumber,
      })),
      projectTitle: project?.customIdeaTitle || (project as any)?.selectedIdea?.title || 'No Project Yet',
      status: project?.ideaStatus || 'not_started',
      createdAt: (group as any).createdAt,
      projectIdea: project ? {
        id: (project as any)._id,
        title: project.customIdeaTitle || (project as any).selectedIdea?.title || '',
        description: project.customIdeaDescription || (project as any).selectedIdea?.description || '',
        customIdeaTitle: project.customIdeaTitle,
        customIdeaDescription: project.customIdeaDescription,
        isCustomIdea: !!project.customIdeaTitle,
        ideaStatus: project.ideaStatus,
        supervisorComment: project.supervisorFeedback || project.rejectionReason,
        selectedIdeaDetails: (project as any).selectedIdea ? {
          id: (project as any).selectedIdea._id,
          title: (project as any).selectedIdea.title,
          description: (project as any).selectedIdea.description,
        } : null,
        githubUrl: project.githubRepositoryUrl,
        githubMarks: project.githubMarks,
        githubFeedback: project.githubFeedback,
        githubEvaluatedAt: project.githubEvaluatedAt,
        totalMarks: project.totalMarks,
        proposalMarks: project.proposalMarks,
        implementationMarks: project.implementationMarks,
        documentationMarks: project.documentationMarks,
        presentationMarks: project.presentationMarks,
        finalGithubMarks: project.finalGithubMarks,
        approvedAt: project.ideaApprovedAt,
        rejectedAt: project.ideaRejectedAt,
      } : null,
    };

    return formattedGroup;
  }

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
