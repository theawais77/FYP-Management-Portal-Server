import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from '../../dto/announcement.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { AnnouncementService } from 'src/services/announcement/announcement.service';

@ApiTags('Coordinator - Announcements')
@Controller('coordinator/announcements')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create announcement for your department',
    description: 'Creates an announcement for students, supervisors, or both (general) in the coordinator\'s department'
  })
  async create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.create(dto, coordinatorId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all announcements in your department',
    description: 'Retrieves all announcements created for your department'
  })
  async findAll(@CurrentUser('userId') coordinatorId: string) {
    // We could filter by coordinator's department here if needed
    return this.announcementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  async findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update your announcement' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.update(id, dto, coordinatorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your announcement' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.announcementService.remove(id, coordinatorId);
  }
}
