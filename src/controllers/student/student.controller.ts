import {
  Controller,
  Post,
  Get,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { StudentService } from 'src/services/student/student.service';
import { RegisterFYPDto } from 'src/dto/student.dto';

@ApiTags('Student - FYP Registration')
@Controller('students')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register-fyp')
  @ApiOperation({ summary: 'Register for FYP' })
  async registerForFYP(
    @CurrentUser('userId') studentId: string,
    @Body() dto: RegisterFYPDto,
  ) {
    return this.studentService.registerForFYP(studentId, dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get student profile with group info' })
  async getMyProfile(@CurrentUser('userId') studentId: string) {
    return this.studentService.getMyProfile(studentId);
  }
}
