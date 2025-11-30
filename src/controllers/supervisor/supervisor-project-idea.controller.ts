import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorProjectIdeaService } from '../../services/supervisor/supervisor-project-idea.service';
import { CreateProjectIdeaDto, UpdateProjectIdeaDto } from '../../dto/supervisor.dto';

@ApiTags('Supervisor - Project Ideas')
@Controller('supervisor/project-ideas')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorProjectIdeaController {
  constructor(private readonly service: SupervisorProjectIdeaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project idea' })
  async create(
    @Body() dto: CreateProjectIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.create(dto, supervisorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all my project ideas' })
  async findAll(@CurrentUser('userId') supervisorId: string) {
    return this.service.findAll(supervisorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project idea by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.findOne(id, supervisorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project idea' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.update(id, dto, supervisorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project idea' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.remove(id, supervisorId);
  }
}
