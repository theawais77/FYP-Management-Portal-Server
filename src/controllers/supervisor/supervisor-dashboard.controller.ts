import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorDashboardService } from '../../services/supervisor/supervisor-dashboard.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('dashboard/supervisor')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorDashboardController {
  constructor(
    private readonly supervisorDashboardService: SupervisorDashboardService,
  ) {}

  @Get()
  async getDashboard(@Request() req: any) {
    const supervisorId = req.user.userId;
    return this.supervisorDashboardService.getDashboard(supervisorId);
  }
}
