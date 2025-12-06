import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisorDashboardController } from '../controllers/supervisor/supervisor-dashboard.controller';
import { SupervisorDashboardService } from '../services/supervisor/supervisor-dashboard.service';
import { Group, GroupSchema } from '../schema/group.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { FYPDocument, FYPDocumentSchema } from '../schema/document.schema';
import { ProjectIdea, ProjectIdeaSchema } from '../schema/project-idea.schema';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: FYPDocument.name, schema: FYPDocumentSchema },
      { name: ProjectIdea.name, schema: ProjectIdeaSchema },
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
    ]),
  ],
  controllers: [SupervisorDashboardController],
  providers: [SupervisorDashboardService],
  exports: [SupervisorDashboardService],
})
export class SupervisorDashboardModule {}
