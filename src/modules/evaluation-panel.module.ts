import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationPanel, EvaluationPanelSchema } from '../schema/evaluation-panel.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Coordinator, CoordinatorSchema } from '../schema/coordinator.schema';
import { EvaluationPanelController } from '../controllers/coordinator/evaluation-panel.controller';
import { EvaluationPanelService } from '../services/coordinator/evaluation-panel.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EvaluationPanel.name, schema: EvaluationPanelSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
    ]),
  ],
  controllers: [EvaluationPanelController],
  providers: [EvaluationPanelService],
  exports: [EvaluationPanelService],
})
export class EvaluationPanelModule {}
