import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectIdeaDocument = ProjectIdea & Document;

@Schema({ timestamps: true, collection: 'fyp_project_ideas' })
export class ProjectIdea {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  technologies?: string[];

  @Prop({ type: String, ref: 'Supervisor', required: true })
  supervisor: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const ProjectIdeaSchema = SchemaFactory.createForClass(ProjectIdea);

ProjectIdeaSchema.index({ supervisor: 1 });
ProjectIdeaSchema.index({ department: 1 });
ProjectIdeaSchema.index({ isAvailable: 1 });

ProjectIdeaSchema.set('toJSON', { virtuals: true });
ProjectIdeaSchema.set('toObject', { virtuals: true });
