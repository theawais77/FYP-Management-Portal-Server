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

@ApiTags('Coordinator - Projects Monitoring')
@Controller('projects')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorProjectMonitorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all projects in coordinator department' })
  async getAllProjects(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getAllProjects(coordinatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID' })
  async getProjectById(@Param('id') id: string) {
    return this.coordinatorService.getProjectById(id);
  }
}
