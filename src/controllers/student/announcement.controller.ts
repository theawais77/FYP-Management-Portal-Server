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
import { Student, StudentDocument } from 'src/schema/student.schema';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Student - Announcements')
@Controller('student/announcements')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class StudentAnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get announcements for students',
    description: 'Retrieves all announcements targeted for students and general announcements in the student\'s department'
  })
  async getMyAnnouncements(@CurrentUser('userId') studentId: string) {
    // Fetch student to get their department
    const student = await this.studentModel.findById(studentId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.announcementService.findByDepartmentAndAudience(
      student.department,
      AnnouncementTargetAudience.STUDENTS
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  async findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }
}
