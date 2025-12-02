import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelSchema } from '../schema/evaluation-panel.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { PresentationScheduleController } from '../controllers/coordinator/presentation-schedule.controller';
import { PresentationScheduleService } from '../services/coordinator/presentation-schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
      { name: EvaluationPanel.name, schema: EvaluationPanelSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [PresentationScheduleController],
  providers: [PresentationScheduleService],
  exports: [PresentationScheduleService],
})
export class PresentationScheduleModule {}
