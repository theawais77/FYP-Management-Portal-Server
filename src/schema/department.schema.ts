import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true, collection: 'fyp_departments' })
export class Department {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true, unique: true })
  code: string; // e.g., "CS", "SE", "EE"

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [{ type: String, ref: 'Supervisor' }], default: [] })
  facultyList: string[]; // Array of supervisor IDs

  @Prop({ default: 0 })
  totalFaculty: number;

  @Prop({ default: 0 })
  totalStudents: number;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.set('toJSON', { virtuals: true });
DepartmentSchema.set('toObject', { virtuals: true });