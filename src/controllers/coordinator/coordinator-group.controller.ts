import {
  Controller,
  Get,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';

@ApiTags('Coordinator - Groups Management')
@Controller('coordinator/groups')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorGroupController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all groups' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getAllGroups(@Query('departmentId') departmentId?: string) {
    return this.coordinatorService.getAllGroups(departmentId);
  }

  @Get('without-supervisor')
  @ApiOperation({ summary: 'Get groups without assigned supervisor' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getGroupsWithoutSupervisor(@Query('departmentId') departmentId?: string) {
    return this.coordinatorService.getGroupsWithoutSupervisor(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details by ID' })
  async getGroupById(@Param('id') id: string) {
    return this.coordinatorService.getGroupById(id);
  }

  @Put(':groupId/assign-supervisor/:supervisorId')
  @ApiOperation({ summary: 'Assign supervisor to group (first time)' })
  async assignSupervisor(
    @Param('groupId') groupId: string,
    @Param('supervisorId') supervisorId: string,
  ) {
    return this.coordinatorService.assignSupervisorToGroup(groupId, supervisorId);
  }

  @Put(':groupId/change-supervisor/:supervisorId')
  @ApiOperation({ summary: 'Change supervisor for group' })
  async changeSupervisor(
    @Param('groupId') groupId: string,
    @Param('supervisorId') supervisorId: string,
  ) {
    return this.coordinatorService.changeSupervisor(groupId, supervisorId);
  }
}
