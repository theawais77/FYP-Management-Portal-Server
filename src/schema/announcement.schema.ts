import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true, collection: 'fyp_announcements' })
export class Announcement {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ type: String, ref: 'Coordinator', required: true })
  createdBy: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ department: 1, createdAt: -1 });

AnnouncementSchema.set('toJSON', { virtuals: true });
AnnouncementSchema.set('toObject', { virtuals: true });
