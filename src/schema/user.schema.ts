
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


@Schema({ collection: 'fyp_users' })

export class User {
    @Prop()
    name: string;
    @Prop({ unique: true })
    email: string;
}
export const UserSchema = SchemaFactory.createForClass(User);