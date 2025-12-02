import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PresentationScheduleDocument = PresentationSchedule & Document;

@Schema({ timestamps: true, collection: 'fyp_presentation_schedules' })
export class PresentationSchedule {
  @Prop({ type: String, ref: 'Group', required: true, unique: true })
  group: string;

  @Prop({ type: String, ref: 'EvaluationPanel', required: true })
  panel: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  timeSlot: string; // e.g., "09:00-09:30", "09:30-10:00"

  @Prop({ required: true, trim: true })
  room: string; // e.g., "Room 301", "Lab A"

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ type: String, ref: 'Coordinator', required: true })
  createdBy: string; // Coordinator who created the schedule

  @Prop({ trim: true })
  notes?: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const PresentationScheduleSchema = SchemaFactory.createForClass(PresentationSchedule);

// Indexes for efficient querying and conflict detection
PresentationScheduleSchema.index({ group: 1 }, { unique: true });
PresentationScheduleSchema.index({ panel: 1, date: 1, timeSlot: 1 });
PresentationScheduleSchema.index({ date: 1, timeSlot: 1, room: 1 }, { unique: true });
PresentationScheduleSchema.index({ department: 1 });
