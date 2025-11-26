import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FacultyController, FacultyManagementController } from '../controllers/faculty.controller';
import { FacultyService } from 'src/services/faculty/faculty.service';
import { Department, DepartmentSchema } from '../schema/department.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
    ]),
  ],
  controllers: [FacultyController, FacultyManagementController],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}