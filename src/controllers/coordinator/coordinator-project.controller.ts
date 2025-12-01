import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/constants';
import { CoordinatorService } from 'src/services/coordinator/coordinator.service';
import { UpdateSupervisorAvailabilityDto } from 'src/dto/coordinator.dto';

@ApiTags('Coordinator - Supervisors')
@Controller('coordinator/supervisors')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class CoordinatorSupervisorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supervisors with their slots' })
  @ApiQuery({ name: 'department', required: false, type: String })
  async getAllSupervisors(@Query('department') department?: string) {
    return this.coordinatorService.getAllSupervisors(department);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get supervisor availability status' })
  @ApiQuery({ name: 'department', required: false, type: String })
  async getSupervisorAvailability(@Query('department') department?: string) {
    return this.coordinatorService.getSupervisorAvailability(department);
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
