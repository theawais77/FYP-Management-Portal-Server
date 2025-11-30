import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectIdea, ProjectIdeaDocument } from 'src/schema/project-idea.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { CreateProjectIdeaDto, UpdateProjectIdeaDto } from 'src/dto/supervisor.dto';

@Injectable()
export class SupervisorProjectIdeaService {
  constructor(
    @InjectModel(ProjectIdea.name)
    private projectIdeaModel: Model<ProjectIdeaDocument>,
    @InjectModel(Supervisor.name)
    private supervisorModel: Model<SupervisorDocument>,
  ) {}

  async create(dto: CreateProjectIdeaDto, supervisorId: string) {
    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const idea = await this.projectIdeaModel.create({
      ...dto,
      supervisor: supervisorId,
      department: supervisor.department,
    });

    return {
      message: 'Project idea created successfully',
      idea,
    };
  }

  async findAll(supervisorId: string) {
    const ideas = await this.projectIdeaModel
      .find({ supervisor: supervisorId })
      .sort({ createdAt: -1 });

    return ideas;
  }

  async findOne(id: string, supervisorId: string) {
    const idea = await this.projectIdeaModel.findById(id);

    if (!idea) {
      throw new NotFoundException('Project idea not found');
    }

    if (idea.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only view your own project ideas');
    }

    return idea;
  }

  async update(id: string, dto: UpdateProjectIdeaDto, supervisorId: string) {
    const idea = await this.projectIdeaModel.findById(id);

    if (!idea) {
      throw new NotFoundException('Project idea not found');
    }

    if (idea.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only update your own project ideas');
    }

    await this.projectIdeaModel.findByIdAndUpdate(id, dto);

    const updatedIdea = await this.projectIdeaModel.findById(id);

    return {
      message: 'Project idea updated successfully',
      idea: updatedIdea,
    };
  }

  async remove(id: string, supervisorId: string) {
    const idea = await this.projectIdeaModel.findById(id);

    if (!idea) {
      throw new NotFoundException('Project idea not found');
    }

    if (idea.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only delete your own project ideas');
    }

    if (!idea.isAvailable) {
      throw new BadRequestException('Cannot delete an idea that is already selected by a group');
    }

    await idea.deleteOne();

    return {
      message: 'Project idea deleted successfully',
    };
  }
}
