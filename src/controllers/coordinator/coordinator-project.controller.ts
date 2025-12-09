import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';
import { UpdateSupervisorAvailabilityDto } from 'src/dto/coordinator.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coordinator - Supervisors')
@Controller('coordinator/supervisors')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorSupervisorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supervisors in coordinator department with their slots' })
  async getAllSupervisors(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getAllSupervisors(coordinatorId);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get supervisor availability status in coordinator department' })
  async getSupervisorAvailability(@CurrentUser('userId') coordinatorId: string) {
    return this.coordinatorService.getSupervisorAvailability(coordinatorId);
  }

  @Put(':id/availability')
  @ApiOperation({ summary: 'Update supervisor availability' })
  async updateSupervisorAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateSupervisorAvailabilityDto,
  ) {
    return this.coordinatorService.updateSupervisorAvailability(id, dto);
  }
}
