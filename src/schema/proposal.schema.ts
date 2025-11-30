import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProposalDocument = Proposal & Document;

export enum ProposalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, collection: 'fyp_proposals' })
export class Proposal {
  @Prop({ type: String, ref: 'Project', required: true })
  project: string;

  @Prop({ type: String, ref: 'Group', required: true })
  group: string;

  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, trim: true })
  filePath: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ 
    type: String, 
    enum: ProposalStatus, 
    default: ProposalStatus.DRAFT 
  })
  status: ProposalStatus;

  @Prop({ type: String, ref: 'Student', required: true })
  uploadedBy: string;

  @Prop()
  submittedAt?: Date;

  @Prop({ trim: true })
  supervisorFeedback?: string;

  @Prop({ trim: true })
  supervisorComments?: string;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: String, ref: 'Supervisor' })
  reviewedBy?: string;
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);

ProposalSchema.index({ project: 1 });
ProposalSchema.index({ group: 1 });
ProposalSchema.index({ status: 1 });

ProposalSchema.set('toJSON', { virtuals: true });
ProposalSchema.set('toObject', { virtuals: true });
