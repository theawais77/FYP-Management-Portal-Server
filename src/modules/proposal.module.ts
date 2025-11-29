import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Proposal, ProposalSchema } from '../schema/proposal.schema';
import { FYPDocument, FYPDocumentSchema } from '../schema/document.schema';
import { Project, ProjectSchema } from '../schema/project.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal/proposal.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Proposal.name, schema: ProposalSchema },
      { name: FYPDocument.name, schema: FYPDocumentSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [ProposalController],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
