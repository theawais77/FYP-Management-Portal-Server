import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentController } from 'src/controllers/coordinator/department.controller';
import { Department, DepartmentSchema } from 'src/schema/department.schema';
import { Student, StudentSchema } from 'src/schema/student.schema';
import { Supervisor, SupervisorSchema } from 'src/schema/supervisor.schema';
import { DepartmentService } from 'src/services/department/department.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
