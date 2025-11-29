import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/constants';
import { GetUsersQueryDto } from 'src/dto/user.dto';
import { UserService } from 'src/services/user/user.service';

@ApiTags('User Management')
@Controller('users')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all users by role (Coordinator only)',
    description: 'Fetch students or supervisors with optional filters'
  })
  @ApiQuery({ name: 'role', enum: UserRole, required: true, description: 'student or supervisor' })
  @ApiQuery({ name: 'department', required: false, example: 'Computer Science' })
  @ApiQuery({ name: 'semester', required: false, example: '8' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get users summary statistics',
    description: 'Get count of students and supervisors'
  })
  @ApiQuery({ name: 'department', required: false })
  async getUsersSummary(@Query('department') department?: string) {
    return this.userService.getUsersSummary(department);
  }
}