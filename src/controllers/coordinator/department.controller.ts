// src/controllers/department.controller.ts

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
import { CreateDepartmentDto, UpdateDepartmentDto } from '../../dto/department.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { DepartmentService } from 'src/services/department/department.service';

@ApiTags('Coordinator - Departments')
@Controller('departments')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department (Coordinator only)' })
  async create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.departmentService.create(dto, coordinatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  async findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department (only if empty)' })
  async remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get department statistics' })
  async getStatistics(@Param('id') id: string) {
    return this.departmentService.getStatistics(id);
  }
}