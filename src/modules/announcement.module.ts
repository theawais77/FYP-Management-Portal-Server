import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Announcement, AnnouncementSchema } from '../schema/announcement.schema';
import { Coordinator, CoordinatorSchema } from '../schema/coordinator.schema';
import { Department, DepartmentSchema } from '../schema/department.schema';
import { Student, StudentSchema } from '../schema/student.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { AnnouncementController } from '../controllers/coordinator/announcement.controller';
import { StudentAnnouncementController } from '../controllers/student/announcement.controller';
import { SupervisorAnnouncementController } from '../controllers/supervisor/announcement.controller';
import { AnnouncementService } from '../services/announcement/announcement.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
    ]),
  ],
  controllers: [
    AnnouncementController, 
    StudentAnnouncementController, 
    SupervisorAnnouncementController
  ],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
