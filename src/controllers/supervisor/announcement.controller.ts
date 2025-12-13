import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { AnnouncementService } from 'src/services/announcement/announcement.service';
import { AnnouncementTargetAudience } from 'src/schema/announcement.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Supervisor - Announcements')
@Controller('supervisor/announcements')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorAnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    @InjectModel(Supervisor.name)
    private supervisorModel: Model<SupervisorDocument>,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get announcements for supervisors',
    description: 'Retrieves all announcements targeted for supervisors and general announcements in the supervisor\'s department'
  })
  async getMyAnnouncements(@CurrentUser('userId') supervisorId: string) {
    // Fetch supervisor to get their department
    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return this.announcementService.findByDepartmentAndAudience(
      supervisor.department,
      AnnouncementTargetAudience.SUPERVISORS
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  async findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }
}
