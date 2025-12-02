import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EvaluationPanelDocument = EvaluationPanel & Document;

@Schema({ timestamps: true, collection: 'fyp_evaluation_panels' })
export class EvaluationPanel {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ type: [{ type: String, ref: 'Supervisor' }], required: true })
  members: string[]; // Array of supervisor/faculty IDs

  @Prop({ type: String, ref: 'Coordinator', required: true })
  createdBy: string; // Coordinator who created the panel

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EvaluationPanelSchema = SchemaFactory.createForClass(EvaluationPanel);

EvaluationPanelSchema.index({ department: 1 });
EvaluationPanelSchema.index({ createdBy: 1 });
