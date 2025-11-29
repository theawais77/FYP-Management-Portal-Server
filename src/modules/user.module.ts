import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user.controller';
import { Student, StudentSchema } from '../schema/student.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { UserService } from 'src/services/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}