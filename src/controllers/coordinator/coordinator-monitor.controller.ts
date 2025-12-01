import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';

@ApiTags('Coordinator - Projects Monitoring')
@Controller('projects')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorProjectMonitorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all projects' })
  @ApiQuery({ name: 'department', required: false, type: String })
  async getAllProjects(@Query('department') department?: string) {
    return this.coordinatorService.getAllProjects(department);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID' })
  async getProjectById(@Param('id') id: string) {
    return this.coordinatorService.getProjectById(id);
  }
}
