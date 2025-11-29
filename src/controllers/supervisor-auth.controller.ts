import { Controller, Post, Body, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSupervisorDto, LoginDto, SetSupervisorPasswordDto, UpdateSupervisorProfileDto } from 'src/dto/auth.dto';
import { SupervisorAuthService } from 'src/services/auth/supervisor.auth.service';

@ApiTags('Supervisor - Auth')
@Controller('auth/supervisor')
export class SupervisorAuthController {
  constructor(private supervisorAuthService: SupervisorAuthService) {}

  @Post('create')
  @ApiBearerAuth()
  @Roles(UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Create supervisor (Coordinator only)' })
  async create(@Body() dto: CreateSupervisorDto) {
    return this.supervisorAuthService.create(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Supervisor login' })
  async login(@Body() dto: LoginDto) {
    return this.supervisorAuthService.login(dto);
  }

  @Patch('set-password')
  @ApiBearerAuth()
  @Roles(UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Set/Update supervisor password' })
  async setPassword(@CurrentUser('userId') userId: string, @Body() dto: SetSupervisorPasswordDto) {
    return this.supervisorAuthService.setPassword(userId, dto);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @Roles(UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update supervisor profile' })
  async updateProfile(@CurrentUser('userId') userId: string, @Body() dto: UpdateSupervisorProfileDto) {
    return this.supervisorAuthService.updateProfile(userId, dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @Roles(UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get supervisor profile' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.supervisorAuthService.getProfile(userId);
  }
}