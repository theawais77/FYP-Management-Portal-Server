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

  async getSupervisorIdeas(supervisorId: string, studentId: string) {
    // Verify student's group has this supervisor assigned
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('No supervisor assigned to your group yet');
    }

    if (group.assignedSupervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only view ideas from your assigned supervisor');
    }

    const ideas = await this.projectIdeaModel
      .find({ supervisor: supervisorId, isAvailable: true })
      .populate('supervisor', 'firstName lastName email designation')
      .sort({ createdAt: -1 });

    return ideas;
  }

  async selectIdea(projectId: string, dto: SelectIdeaDto, studentId: string) {
    const project = await this.projectModel.findById(projectId).populate('group');

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const group = project.group as any;

    // Verify student is part of the project's group
    if (
      group.leader.toString() !== studentId &&
      !group.members.includes(studentId)
    ) {
      throw new ForbiddenException('You are not part of this project group');
    }

    const idea = await this.projectIdeaModel.findById(dto.ideaId);

    if (!idea) {
      throw new NotFoundException('Project idea not found');
    }

    if (!idea.isAvailable) {
      throw new BadRequestException('This project idea is no longer available');
    }

    if (idea.supervisor.toString() !== project.supervisor.toString()) {
      throw new BadRequestException('This idea does not belong to your assigned supervisor');
    }

    project.selectedIdea = dto.ideaId;
    project.customIdeaTitle = undefined;
    project.customIdeaDescription = undefined;
    project.ideaStatus = ProjectStatus.PENDING;
    await project.save();

    return {
      message: 'Project idea selected successfully. Waiting for supervisor approval.',
      project: await (await project
          .populate('selectedIdea'))
        .populate('supervisor', 'firstName lastName email'),
    };
  }

  async requestCustomIdea(dto: RequestCustomIdeaDto, studentId: string) {
    // Find student's group
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('No supervisor assigned to your group yet');
    }

    // Find project for this group
    const project = await this.projectModel.findOne({ group: group._id });

    if (!project) {
      throw new NotFoundException('No project found for your group');
    }

    project.customIdeaTitle = dto.title;
    project.customIdeaDescription = dto.description;
    project.selectedIdea = undefined;
    project.ideaStatus = ProjectStatus.PENDING;
    await project.save();

    return {
      message: 'Custom idea request submitted successfully. Waiting for supervisor approval.',
      project: await project.populate('supervisor', 'firstName lastName email'),
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
      .populate('group')
      .populate('supervisor', 'firstName lastName email designation')
      .populate('selectedIdea');

    if (!project) {
      throw new NotFoundException('No project found for your group');
    }

    return project;
  }
}
