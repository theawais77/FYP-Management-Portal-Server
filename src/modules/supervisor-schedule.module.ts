import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelSchema } from '../schema/evaluation-panel.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { SupervisorScheduleController } from '../controllers/supervisor/supervisor-schedule.controller';
import { SupervisorScheduleService } from '../services/supervisor/supervisor-schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
      { name: EvaluationPanel.name, schema: EvaluationPanelSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [SupervisorScheduleController],
  providers: [SupervisorScheduleService],
  exports: [SupervisorScheduleService],
})
export class SupervisorScheduleModule {}
