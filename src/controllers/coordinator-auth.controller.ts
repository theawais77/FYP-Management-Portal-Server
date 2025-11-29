import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { LoginDto } from 'src/dto/auth.dto';
import { CoordinatorAuthService } from 'src/services/auth/coordinator-auth.service';


@ApiTags('Coordinator - Auth')
@Controller('auth/coordinator')
export class CoordinatorAuthController {
  constructor(private coordinatorAuthService: CoordinatorAuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Coordinator login' })
  async login(@Body() dto: LoginDto) {
    return this.coordinatorAuthService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @Roles(UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Get coordinator profile' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.coordinatorAuthService.getProfile(userId);
  }
}
