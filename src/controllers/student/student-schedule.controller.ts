import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { StudentScheduleService } from '../../services/student/student-schedule.service';

@ApiTags('Student - Presentation Schedule')
@Controller('students/schedule')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class StudentScheduleController {
  constructor(private readonly scheduleService: StudentScheduleService) {}

  @Get('my-schedule')
  @ApiOperation({ summary: 'Get my presentation schedule' })
  async getMySchedule(@CurrentUser('userId') studentId: string) {
    return this.scheduleService.getMySchedule(studentId);
  }

  @Get('my-panel')
  @ApiOperation({ summary: 'Get my evaluation panel details' })
  async getMyPanel(@CurrentUser('userId') studentId: string) {
    return this.scheduleService.getMyPanel(studentId);
  }
}
