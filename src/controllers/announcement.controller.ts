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
import { CreateAnnouncementDto, UpdateAnnouncementDto } from '../dto/announcement.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/constants/constants';
import { AnnouncementService } from 'src/services/announcement/announcement.service';

@ApiTags('Coordinator - Announcements')
@Controller('announcements')
@ApiBearerAuth()
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Roles(UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Create announcement (Coordinator only)' })
  async create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.create(dto, coordinatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements (filtered by department)' })
  @ApiQuery({ name: 'department', required: false, type: String })
  async findAll(@Query('department') department?: string) {
    return this.announcementService.findAll(department);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  async findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Update announcement (Coordinator only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.update(id, dto, coordinatorId);
  }

  @Delete(':id')
  @Roles(UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Delete announcement (Coordinator only)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.remove(id, coordinatorId);
  }
}
