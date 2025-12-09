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
import { EvaluationPanelService } from '../../services/coordinator/evaluation-panel.service';
import { CreatePanelDto, UpdatePanelDto } from '../../dto/coordinator.dto';

@ApiTags('Coordinator - Evaluation Panels')
@Controller('panels')
@ApiBearerAuth()
@Roles(UserRole.COORDINATOR)
export class EvaluationPanelController {
  constructor(private readonly panelService: EvaluationPanelService) {}

  @Post()
  @ApiOperation({ summary: 'Create evaluation panel' })
  async create(
    @Body() dto: CreatePanelDto,
    @CurrentUser('userId') coordinatorId: string,
  ) {
    return this.panelService.create(dto, coordinatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all evaluation panels in coordinator department' })
  async findAll(@CurrentUser('userId') coordinatorId: string) {
    return this.panelService.findAll(coordinatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation panel by ID' })
  async findOne(@Param('id') id: string) {
    return this.panelService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update evaluation panel' })
  async update(@Param('id') id: string, @Body() dto: UpdatePanelDto) {
    return this.panelService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete evaluation panel' })
  async remove(@Param('id') id: string) {
    return this.panelService.remove(id);
  }
}
