import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectIdea, ProjectIdeaSchema } from '../schema/project-idea.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { FYPDocument, FYPDocumentSchema } from '../schema/document.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';

import { SupervisorProjectIdeaController } from '../controllers/supervisor/supervisor-project-idea.controller';
import { SupervisorIdeaApprovalController } from '../controllers/supervisor/supervisor-idea-approval.controller';
import { SupervisorProposalController } from '../controllers/supervisor/supervisor-proposal.controller';
import { SupervisorDocumentController } from '../controllers/supervisor/supervisor-document.controller';
import { SupervisorEvaluationController } from '../controllers/supervisor/supervisor-evaluation.controller';

import { SupervisorProjectIdeaService } from '../services/supervisor/supervisor-project-idea.service';
import { SupervisorIdeaApprovalService } from '../services/supervisor/supervisor-idea-approval.service';
import { SupervisorProposalService } from '../services/supervisor/supervisor-proposal.service';
import { SupervisorDocumentService } from '../services/supervisor/supervisor-document.service';
import { SupervisorEvaluationService } from '../services/supervisor/supervisor-evaluation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectIdea.name, schema: ProjectIdeaSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: FYPDocument.name, schema: FYPDocumentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
    ]),
  ],
  controllers: [
    SupervisorProjectIdeaController,
    SupervisorIdeaApprovalController,
    SupervisorProposalController,
    SupervisorDocumentController,
    SupervisorEvaluationController,
  ],
  providers: [
    SupervisorProjectIdeaService,
    SupervisorIdeaApprovalService,
    SupervisorProposalService,
    SupervisorDocumentService,
    SupervisorEvaluationService,
  ],
  exports: [
    SupervisorProjectIdeaService,
    SupervisorIdeaApprovalService,
    SupervisorProposalService,
    SupervisorDocumentService,
    SupervisorEvaluationService,
  ],
})
export class SupervisorModule {}
