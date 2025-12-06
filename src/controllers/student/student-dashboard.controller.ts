import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { StudentDashboardService } from '../../services/student/student-dashboard.service';

@ApiTags('Student - Dashboard')
@Controller('dashboard/student')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class StudentDashboardController {
  constructor(private readonly dashboardService: StudentDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get comprehensive student dashboard data' })
  async getDashboard(@CurrentUser('userId') studentId: string) {
    return this.dashboardService.getDashboard(studentId);
  }
}
