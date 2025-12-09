import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseUser } from './base-user.schema';
import { UserRole } from '../common/constants/constants';

export type CoordinatorDocument = Coordinator & Document;

@Schema({ timestamps: true, collection: 'fyp_coordinators' })
export class Coordinator extends BaseUser {
  @Prop({ 
    default: UserRole.COORDINATOR,
    enum: [UserRole.COORDINATOR],
    immutable: true
  })
  declare role: UserRole.COORDINATOR;

  @Prop({ required: true, trim: true, unique: true })
  coordinatorId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  department: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true })
  officeAddress?: string;

  @Prop({ trim: true })
  designation?: string;
}

export const CoordinatorSchema = SchemaFactory.createForClass(Coordinator);

CoordinatorSchema.index({ department: 1 });

CoordinatorSchema.virtual('fullName').get(function(this: CoordinatorDocument) {
  return `${this.firstName} ${this.lastName}`;
});

CoordinatorSchema.set('toJSON', { virtuals: true });
CoordinatorSchema.set('toObject', { virtuals: true });