import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/schema/user.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) { }

  async testDB() {
    const newUserrrrr = await this.userModel.create({
      name: "Qaiser Manzoor",
      email: "fsdlabsss@austd.com"

    });
    return newUserrrrr;
  }
  async getAllUsers() {
    return this.userModel.find().exec();
  }
}
