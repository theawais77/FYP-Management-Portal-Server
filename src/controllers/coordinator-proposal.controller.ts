import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';

@ApiTags('Coordinator - Proposals')
@Controller('proposals')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorProposalMonitorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all proposals' })
  @ApiQuery({ name: 'department', required: false, type: String })
  async getAllProposals(@Query('department') department?: string) {
    return this.coordinatorService.getAllProposals(department);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal details by ID' })
  async getProposalById(@Param('id') id: string) {
    return this.coordinatorService.getProposalById(id);
  }
}
