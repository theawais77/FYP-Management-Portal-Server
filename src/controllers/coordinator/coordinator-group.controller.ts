import {
  Controller,
  Get,
  Put,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coordinator - Groups Management')
@Controller('coordinator/groups')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorGroupController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'View all groups in coordinator department' })
  async getAllGroups(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getAllGroups(coordinatorId);
  }

  @Get('without-supervisor')
  @ApiOperation({ summary: 'Get groups without assigned supervisor in coordinator department' })
  async getGroupsWithoutSupervisor(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getGroupsWithoutSupervisor(coordinatorId);
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
