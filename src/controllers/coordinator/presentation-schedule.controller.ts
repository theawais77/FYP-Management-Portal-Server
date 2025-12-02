import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { PresentationScheduleService } from '../../services/coordinator/presentation-schedule.service';
import { CreateScheduleDto, UpdateScheduleDto, AutoScheduleDto, SwapScheduleDto } from '../../dto/coordinator.dto';

@ApiTags('Coordinator - Presentation Schedules')
@Controller('schedules')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class PresentationScheduleController {
  constructor(private readonly scheduleService: PresentationScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create presentation schedule for a group' })
  async create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.scheduleService.create(dto, coordinatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all presentation schedules' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'date', required: false })
  async findAll(
    @Query('department') department?: string,
    @Query('date') date?: string,
  ) {
    return this.scheduleService.findAll(department, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update schedule details' })
  async update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schedule' })
  async remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  @Post('auto-schedule')
  @ApiOperation({ summary: 'Automatically schedule all unscheduled groups (9AM-4PM, 30min slots)' })
  async autoSchedule(
    @Body() dto: AutoScheduleDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.scheduleService.autoSchedule(dto, coordinatorId);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap schedules between two groups' })
  async swapSchedules(@Body() dto: SwapScheduleDto) {
    return this.scheduleService.swapSchedules(dto);
  }
}
