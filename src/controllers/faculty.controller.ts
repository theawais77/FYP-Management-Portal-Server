import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AddFacultyDto } from '../dto/department.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/constants';
import { FacultyService } from 'src/services/faculty/faculty.service';

@ApiTags('Faculty Management')
@Controller('departments/:departmentId/faculty')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @ApiOperation({ summary: 'Get faculty list of a department' })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  @ApiQuery({ name: 'specialization', required: false, type: String })
  async getFacultyList(
    @Param('departmentId') departmentId: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('specialization') specialization?: string,
  ) {
    return this.facultyService.getFacultyList(departmentId, {
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      specialization,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Add faculty to department' })
  async addFaculty(
    @Param('departmentId') departmentId: string,
    @Body() dto: AddFacultyDto,
  ) {
    return this.facultyService.addFaculty(departmentId, dto.supervisorId);
  }

  @Delete(':facultyId')
  @ApiOperation({ summary: 'Remove faculty from department' })
  async removeFaculty(
    @Param('departmentId') departmentId: string,
    @Param('facultyId') facultyId: string,
  ) {
    return this.facultyService.removeFaculty(departmentId, facultyId);
  }

  @Get(':facultyId')
  @ApiOperation({ summary: 'Get faculty details' })
  async getFacultyDetails(
    @Param('departmentId') departmentId: string,
    @Param('facultyId') facultyId: string,
  ) {
    return this.facultyService.getFacultyDetails(departmentId, facultyId);
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get faculty statistics for department' })
  async getFacultyStatistics(@Param('departmentId') departmentId: string) {
    return this.facultyService.getFacultyStatistics(departmentId);
  }
}

// Separate controller for general faculty operations
@ApiTags('Faculty Management')
@Controller('faculty')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class FacultyManagementController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get supervisors not assigned to any department' })
  async getAvailableSupervisors() {
    return this.facultyService.getAvailableSupervisors();
  }

  @Patch('transfer')
  @ApiOperation({ summary: 'Transfer faculty from one department to another' })
  async transferFaculty(
    @Body() body: {
      fromDepartmentId: string;
      toDepartmentId: string;
      supervisorId: string;
    },
  ) {
    return this.facultyService.transferFaculty(
      body.fromDepartmentId,
      body.toDepartmentId,
      body.supervisorId,
    );
  }
}