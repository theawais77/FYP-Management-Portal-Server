import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorProposalService } from '../../services/supervisor/supervisor-proposal.service';
import { ApproveProposalDto, RejectProposalDto, CommentProposalDto } from '../../dto/supervisor.dto';

@ApiTags('Supervisor - Proposals')
@Controller('supervisor/proposals')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorProposalController {
  constructor(private readonly service: SupervisorProposalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all proposals from assigned groups' })
  async getProposals(@CurrentUser('userId') supervisorId: string) {
    return this.service.getProposals(supervisorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  async getProposal(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.getProposal(id, supervisorId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve proposal' })
  async approveProposal(
    @Param('id') id: string,
    @Body() dto: ApproveProposalDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.approveProposal(id, dto, supervisorId);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject proposal' })
  async rejectProposal(
    @Param('id') id: string,
    @Body() dto: RejectProposalDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.rejectProposal(id, dto, supervisorId);
  }

  @Put(':id/comment')
  @ApiOperation({ summary: 'Add comment to proposal' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: CommentProposalDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.addComment(id, dto, supervisorId);
  }
}
