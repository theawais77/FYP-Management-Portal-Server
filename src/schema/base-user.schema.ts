import { Prop } from '@nestjs/mongoose';
import { UserRole } from '../common/constants/constants';

export abstract class BaseUser {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ 
    required: true, 
    enum: Object.values(UserRole)
  })
  role: UserRole;

  @Prop({ trim: true })
  phoneNumber?: string;
}