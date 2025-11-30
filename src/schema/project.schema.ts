import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true, collection: 'fyp_projects' })
export class Project {
  @Prop({ type: String, ref: 'Group', required: true })
  group: string;

  @Prop({ type: String, ref: 'Supervisor', required: true })
  supervisor: string;

  @Prop({ type: String, ref: 'ProjectIdea' })
  selectedIdea?: string;

  @Prop({ trim: true })
  customIdeaTitle?: string;

  @Prop({ trim: true })
  customIdeaDescription?: string;

  @Prop({ 
    type: String, 
    enum: ProjectStatus, 
    default: ProjectStatus.PENDING 
  })
  ideaStatus: ProjectStatus;

  @Prop({ trim: true })
  supervisorFeedback?: string;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: Date })
  ideaApprovedAt?: Date;

  @Prop({ type: Date })
  ideaRejectedAt?: Date;

  // GitHub Evaluation
  @Prop({ trim: true })
  githubRepositoryUrl?: string;

  @Prop({ type: Number, min: 0, max: 20 })
  githubMarks?: number;

  @Prop({ trim: true })
  githubFeedback?: string;

  @Prop({ type: Date })
  githubEvaluatedAt?: Date;

  // Final Evaluation
  @Prop({ type: Number, min: 0, max: 100 })
  totalMarks?: number;

  @Prop({ type: Number, min: 0, max: 20 })
  proposalMarks?: number;

  @Prop({ type: Number, min: 0, max: 30 })
  implementationMarks?: number;

  @Prop({ type: Number, min: 0, max: 20 })
  documentationMarks?: number;

  @Prop({ type: Number, min: 0, max: 15 })
  presentationMarks?: number;

  @Prop({ type: Number, min: 0, max: 15 })
  finalGithubMarks?: number;

  @Prop({ trim: true })
  finalFeedback?: string;

  @Prop({ default: false })
  isEvaluationComplete: boolean;

  @Prop({ type: Date })
  evaluationCompletedAt?: Date;

  @Prop({ required: true, trim: true })
  department: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ group: 1 });
ProjectSchema.index({ supervisor: 1 });
ProjectSchema.index({ ideaStatus: 1 });

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
