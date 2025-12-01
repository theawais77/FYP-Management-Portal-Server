import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { StudentRegisterDto, LoginDto } from 'src/dto/auth.dto';
import { StudentAuthService } from 'src/services/auth/student-auth.service';


@ApiTags('Student - Auth')
@Controller('auth/student')
export class StudentAuthController {
  constructor(private studentAuthService: StudentAuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Student self-registration' })
  async register(@Body() dto: StudentRegisterDto) {
    return this.studentAuthService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Student login' })
  async login(@Body() dto: LoginDto) {
    return this.studentAuthService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student profile' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.studentAuthService.getProfile(userId);
  }
}