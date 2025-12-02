import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationPanel, EvaluationPanelSchema } from '../schema/evaluation-panel.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { EvaluationPanelController } from '../controllers/coordinator/evaluation-panel.controller';
import { EvaluationPanelService } from '../services/coordinator/evaluation-panel.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EvaluationPanel.name, schema: EvaluationPanelSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
    ]),
  ],
  controllers: [EvaluationPanelController],
  providers: [EvaluationPanelService],
  exports: [EvaluationPanelService],
})
export class EvaluationPanelModule {}
