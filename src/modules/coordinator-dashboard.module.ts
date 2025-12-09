import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoordinatorDashboardController } from '../controllers/coordinator/coordinator-dashboard.controller';
import { CoordinatorDashboardService } from '../services/coordinator/coordinator-dashboard.service';
import { Student, StudentSchema } from '../schema/student.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { FYPDocument, FYPDocumentSchema } from '../schema/document.schema';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelSchema } from '../schema/evaluation-panel.schema';
import { Announcement, AnnouncementSchema } from '../schema/announcement.schema';
import { Coordinator, CoordinatorSchema } from '../schema/coordinator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: FYPDocument.name, schema: FYPDocumentSchema },
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
      { name: EvaluationPanel.name, schema: EvaluationPanelSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
    ]),
  ],
  controllers: [CoordinatorDashboardController],
  providers: [CoordinatorDashboardService],
  exports: [CoordinatorDashboardService],
})
export class CoordinatorDashboardModule {}
