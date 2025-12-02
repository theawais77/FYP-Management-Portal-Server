import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from 'src/schema/project.schema';
import { EvaluateGithubDto, FinalMarksDto, FinalFeedbackDto } from 'src/dto/supervisor.dto';

@Injectable()
export class SupervisorEvaluationService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async getProjectGithub(id: string, supervisorId: string) {
    const project = await this.projectModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber' },
          { path: 'members', select: 'firstName lastName email rollNumber' },
        ],
      });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check supervisor ID before populating (supervisor is stored as string reference)
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only view projects from your assigned groups');
    }

    // Now populate supervisor details for the response
    await project.populate('supervisor', 'firstName lastName email');

    return {
      projectId: project._id,
      group: project.group,
      githubRepositoryUrl: project.githubRepositoryUrl,
      githubMarks: project.githubMarks,
      githubFeedback: project.githubFeedback,
      githubEvaluatedAt: project.githubEvaluatedAt,
    };
  }

  async evaluateGithub(id: string, dto: EvaluateGithubDto, supervisorId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only evaluate projects from your assigned groups');
    }

    if (project.ideaStatus !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Project idea must be approved before evaluation');
    }

    await this.projectModel.findByIdAndUpdate(id, {
      githubRepositoryUrl: dto.repositoryUrl,
      githubMarks: dto.marks,
      githubFeedback: dto.feedback,
      githubEvaluatedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'GitHub repository evaluated successfully',
      project: updatedProject,
    };
  }

  async getFinalEvaluations(supervisorId: string) {
    const projects = await this.projectModel
      .find({
        supervisor: supervisorId,
        ideaStatus: ProjectStatus.APPROVED,
      })
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber' },
          { path: 'members', select: 'firstName lastName email rollNumber' },
        ],
      })
      .populate('selectedIdea')
      .sort({ createdAt: -1 });

    return projects;
  }

  async addFinalMarks(id: string, dto: FinalMarksDto, supervisorId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only evaluate projects from your assigned groups');
    }

    if (project.ideaStatus !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Project idea must be approved before evaluation');
    }

    await this.projectModel.findByIdAndUpdate(id, {
      totalMarks: dto.totalMarks,
      proposalMarks: dto.proposalMarks,
      implementationMarks: dto.implementationMarks,
      documentationMarks: dto.documentationMarks,
      presentationMarks: dto.presentationMarks,
      finalGithubMarks: dto.githubMarks,
    });

    const updatedProject = await this.projectModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'Final marks added successfully',
      project: updatedProject,
    };
  }

  async addFinalFeedback(id: string, dto: FinalFeedbackDto, supervisorId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only provide feedback on projects from your assigned groups');
    }

    if (project.ideaStatus !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Project idea must be approved before evaluation');
    }

    await this.projectModel.findByIdAndUpdate(id, {
      finalFeedback: dto.feedback,
    });

    const updatedProject = await this.projectModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'Final feedback added successfully',
      project: updatedProject,
    };
  }

  async completeEvaluation(id: string, supervisorId: string) {
    const project = await this.projectModel.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only complete evaluation for your assigned groups');
    }

    if (project.ideaStatus !== ProjectStatus.APPROVED) {
      throw new BadRequestException('Project idea must be approved before completing evaluation');
    }

    if (!project.totalMarks) {
      throw new BadRequestException('Please add final marks before completing evaluation');
    }

    await this.projectModel.findByIdAndUpdate(id, {
      isEvaluationComplete: true,
      evaluationCompletedAt: new Date(),
    });

    const updatedProject = await this.projectModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName email' },
          { path: 'members', select: 'firstName lastName email' },
        ],
      });

    return {
      message: 'Evaluation completed successfully',
      project: updatedProject,
    };
  }
}