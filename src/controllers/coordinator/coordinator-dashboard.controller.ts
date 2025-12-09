import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorDashboardService } from '../../services/coordinator/coordinator-dashboard.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard/coordinator')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorDashboardController {
  constructor(
    private readonly coordinatorDashboardService: CoordinatorDashboardService,
  ) {}

  @Get()
  async getDashboard(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorDashboardService.getDashboard(coordinatorId);
  }
}
