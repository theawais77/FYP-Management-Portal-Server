import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorScheduleService } from '../../services/supervisor/supervisor-schedule.service';

@ApiTags('Supervisor - Presentation Schedules')
@Controller('supervisor/schedules')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorScheduleController {
  constructor(private readonly scheduleService: SupervisorScheduleService) {}

  @Get('my-panels')
  @ApiOperation({ summary: 'Get all evaluation panels I am a member of' })
  async getMyPanels(@CurrentUser('userId') supervisorId: string) {
    return this.scheduleService.getMyPanels(supervisorId);
  }

  @Get('panel-schedules')
  @ApiOperation({ summary: 'Get all presentation schedules for my panels' })
  async getMyPanelSchedules(@CurrentUser('userId') supervisorId: string) {
    return this.scheduleService.getMyPanelSchedules(supervisorId);
  }

  @Get('assigned-groups')
  @ApiOperation({ summary: 'Get presentation schedules for my assigned groups' })
  async getAssignedGroupsSchedules(@CurrentUser('userId') supervisorId: string) {
    return this.scheduleService.getAssignedGroupsSchedules(supervisorId);
  }
}
