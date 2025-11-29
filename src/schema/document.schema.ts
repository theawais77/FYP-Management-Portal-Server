import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FYPDocumentDocument = FYPDocument & Document;

export enum DocumentType {
  PROPOSAL = 'proposal',
  PRESENTATION = 'presentation',
  REPORT = 'report',
  OTHER = 'other',
}

@Schema({ timestamps: true, collection: 'fyp_documents' })
export class FYPDocument {
  @Prop({ type: String, ref: 'Project', required: true })
  project: string;

  @Prop({ type: String, ref: 'Group', required: true })
  group: string;

  @Prop({ 
    type: String, 
    enum: DocumentType, 
    default: DocumentType.OTHER 
  })
  documentType: DocumentType;

  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, trim: true })
  filePath: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ type: String, ref: 'Student', required: true })
  uploadedBy: string;

  @Prop({ trim: true })
  description?: string;
}

export const FYPDocumentSchema = SchemaFactory.createForClass(FYPDocument);

FYPDocumentSchema.index({ project: 1 });
FYPDocumentSchema.index({ group: 1 });
FYPDocumentSchema.index({ documentType: 1 });

FYPDocumentSchema.set('toJSON', { virtuals: true });
FYPDocumentSchema.set('toObject', { virtuals: true });
