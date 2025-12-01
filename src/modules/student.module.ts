import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../schema/student.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { Department, DepartmentSchema } from '../schema/department.schema';
import { StudentController } from '../controllers/student/student.controller';
import { StudentService } from '../services/student/student.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
