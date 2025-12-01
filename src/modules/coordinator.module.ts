import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from '../schema/group.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { Department, DepartmentSchema } from '../schema/department.schema';
import { CoordinatorGroupController } from '../controllers/coordinator/coordinator-group.controller';
import { CoordinatorSupervisorController } from '../controllers/coordinator/coordinator-project.controller';
import { CoordinatorProjectMonitorController } from '../controllers/coordinator/coordinator-monitor.controller';
import { CoordinatorProposalMonitorController } from '../controllers/coordinator/coordinator-proposal.controller';
import { CoordinatorService } from '../services/coordinator/coordinator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [
    CoordinatorGroupController,
    CoordinatorSupervisorController,
    CoordinatorProjectMonitorController,
    CoordinatorProposalMonitorController,
  ],
  providers: [CoordinatorService],
  exports: [CoordinatorService],
})
export class CoordinatorModule {}
