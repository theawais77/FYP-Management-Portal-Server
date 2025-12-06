import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../schema/student.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { FYPDocument } from '../schema/document.schema';
import { FYPDocumentSchema } from '../schema/document.schema';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';
import { StudentDashboardController } from '../controllers/student/student-dashboard.controller';
import { StudentDashboardService } from '../services/student/student-dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: FYPDocument.name, schema: FYPDocumentSchema },
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
    ]),
  ],
  controllers: [StudentDashboardController],
  providers: [StudentDashboardService],
  exports: [StudentDashboardService],
})
export class StudentDashboardModule {}
