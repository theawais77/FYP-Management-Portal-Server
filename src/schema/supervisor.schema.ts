import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseUser } from './base-user.schema';
import { UserRole } from '../common/constants/constants';

export type SupervisorDocument = Supervisor & Document;

@Schema({ timestamps: true, collection: 'fyp_supervisors' })
export class Supervisor extends BaseUser {
  @Prop({
    default: UserRole.SUPERVISOR,
    enum: [UserRole.SUPERVISOR],
    immutable: true,
  })
  declare role: UserRole.SUPERVISOR;

  @Prop({ required: true, trim: true, unique: true })
  employeeId: string;

  @Prop({ required: true, trim: true })
  designation: string;

  @Prop({ trim: true })
  specialization?: string;

  @Prop({ type: [String], default: [] })
  researchInterests?: string[];

  @Prop({ type: [String], ref: 'Student', default: [] })
  assignedStudents: string[];

  @Prop({ required: true, default: 5, min: 0 })
  maxStudents: number;

  @Prop({ default: 0, min: 0 })
  currentStudentCount: number;

  @Prop({ default: true })
  isAvailableForSupervision: boolean;

  @Prop()
  officeLocation?: string;

  @Prop()
  officeHours?: string;
}

export const SupervisorSchema = SchemaFactory.createForClass(Supervisor);

SupervisorSchema.index({ email: 1 });
SupervisorSchema.index({ employeeId: 1 });
SupervisorSchema.index({ isAvailableForSupervision: 1 });
SupervisorSchema.index({ specialization: 1 });

SupervisorSchema.virtual('fullName').get(function (this: SupervisorDocument) {
  return `${this.firstName} ${this.lastName}`;
});

SupervisorSchema.virtual('availableSlots').get(function (this: SupervisorDocument) {
  return this.maxStudents - this.currentStudentCount;
});

SupervisorSchema.set('toJSON', { virtuals: true });
SupervisorSchema.set('toObject', { virtuals: true });