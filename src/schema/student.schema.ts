import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseUser } from './base-user.schema';
import { UserRole } from '../common/constants/constants';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true, collection: 'fyp_students' })
export class Student extends BaseUser {
  @Prop({ 
    default: UserRole.STUDENT,
    enum: [UserRole.STUDENT],
    immutable: true
  })
  declare role: UserRole.STUDENT;

  @Prop({ 
    required: true,
    unique: true, 
    trim: true
  })
  rollNumber: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ required: true, trim: true })
  semester: string;

  @Prop({ required: true, trim: true })
  program: string;

  @Prop({ type: String, ref: 'Supervisor' })
  assignedSupervisor?: string;

  @Prop({ type: String, ref: 'Project' })
  currentProject?: string;

  @Prop({ min: 0, max: 4 })
  cgpa?: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ email: 1 });
StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ assignedSupervisor: 1 });
StudentSchema.index({ department: 1, semester: 1 });

StudentSchema.virtual('fullName').get(function(this: StudentDocument) {
  return `${this.firstName} ${this.lastName}`;
});

StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });