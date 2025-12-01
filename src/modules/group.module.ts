import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from '../schema/group.schema';
import { Student, StudentSchema } from '../schema/student.schema';
import { GroupController } from '../controllers/student/group.controller';
import { GroupService } from '../services/group/group.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
