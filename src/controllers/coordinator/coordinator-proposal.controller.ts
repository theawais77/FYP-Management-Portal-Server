import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coordinator - Proposals Monitoring')
@Controller('proposals')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorProposalMonitorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all proposals in coordinator department' })
  async getAllProposals(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getAllProposals(coordinatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal details by ID' })
  async getProposalById(@Param('id') id: string) {
    return this.coordinatorService.getProposalById(id);
  }
}
