import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from 'src/schema/project.schema';
import { ProjectIdea, ProjectIdeaDocument } from 'src/schema/project-idea.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { SelectIdeaDto, RequestCustomIdeaDto } from 'src/dto/student.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectIdea.name) private projectIdeaModel: Model<ProjectIdeaDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async getSupervisorIdeas(studentId: string) {
    // Find student's group and get assigned supervisor
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('No supervisor assigned to your group yet');
    }

    const ideas = await this.projectIdeaModel
      .find({ supervisor: group.assignedSupervisor, isAvailable: true })
      .populate('supervisor', 'firstName lastName email designation')
      .sort({ createdAt: -1 });

    return {
      message: 'Supervisor ideas retrieved successfully',
      ideas,
      supervisor: group.assignedSupervisor,
    };
  }

  async selectIdea(dto: SelectIdeaDto, studentId: string) {
    // Find student's group
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    }).populate('leader', 'department');

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('No supervisor assigned to your group yet');
    }

    const idea = await this.projectIdeaModel.findById(dto.ideaId);

    if (!idea) {
      throw new NotFoundException('Project idea not found');
    }

    if (!idea.isAvailable) {
      throw new BadRequestException('This project idea is no longer available');
    }

    if (idea.supervisor.toString() !== group.assignedSupervisor.toString()) {
      throw new BadRequestException('This idea does not belong to your assigned supervisor');
    }

    // Find or create project for this group
    let project = await this.projectModel.findOne({ group: group._id });

    if (!project) {
      // Create new project if it doesn't exist
      project = await this.projectModel.create({
        group: group._id,
        supervisor: group.assignedSupervisor,
        selectedIdea: dto.ideaId,
        ideaStatus: ProjectStatus.PENDING,
        department: (group.leader as any).department,
      });
    } else {
      // Update existing project
      await this.projectModel.findByIdAndUpdate(project._id, {
        selectedIdea: dto.ideaId,
        $unset: { customIdeaTitle: '', customIdeaDescription: '' },
        ideaStatus: ProjectStatus.PENDING,
      });
    }

    const updatedProject = await this.projectModel
      .findOne({ group: group._id })
      .populate('selectedIdea')
      .populate('supervisor', 'firstName lastName email');

    return {
      message: 'Project idea selected successfully. Waiting for supervisor approval.',
      project: updatedProject,
    };
  }

  async requestCustomIdea(dto: RequestCustomIdeaDto, studentId: string) {
    // Find student's group
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    }).populate('leader', 'department');

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('No supervisor assigned to your group yet');
    }

    // Find or create project for this group
    let project = await this.projectModel.findOne({ group: group._id });

    if (!project) {
      // Create new project if it doesn't exist
      project = await this.projectModel.create({
        group: group._id,
        supervisor: group.assignedSupervisor,
        customIdeaTitle: dto.title,
        customIdeaDescription: dto.description,
        ideaStatus: ProjectStatus.PENDING,
        department: (group.leader as any).department,
      });
    } else {
      // Update existing project
      await this.projectModel.findByIdAndUpdate(project._id, {
        customIdeaTitle: dto.title,
        customIdeaDescription: dto.description,
        $unset: { selectedIdea: '' },
        ideaStatus: ProjectStatus.PENDING,
      });
    }

    const updatedProject = await this.projectModel
      .findOne({ group: group._id })
      .populate('supervisor', 'firstName lastName email');

    return {
      message: 'Custom idea request submitted successfully. Waiting for supervisor approval.',
      project: updatedProject,
    };
  }

  async getMyProject(studentId: string) {
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    const project = await this.projectModel
      .findOne({ group: group._id })
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
      })
      .populate('supervisor', 'firstName lastName email designation')
      .populate('selectedIdea');

    if (!project) {
      throw new NotFoundException('No project found for your group');
    }

    return project;
  }
}
