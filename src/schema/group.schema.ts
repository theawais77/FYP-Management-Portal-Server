import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true, collection: 'fyp_groups' })
export class Group {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, ref: 'Student', required: true })
  leader: string;

  @Prop({ type: [{ type: String, ref: 'Student' }], default: [] })
  members: string[];

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ type: String, ref: 'Supervisor' })
  assignedSupervisor?: string;

  @Prop({ type: String, ref: 'Project' })
  project?: string;

  @Prop({ default: false })
  isRegisteredForFYP: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

GroupSchema.index({ leader: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ department: 1 });

GroupSchema.set('toJSON', { virtuals: true });
GroupSchema.set('toObject', { virtuals: true });
