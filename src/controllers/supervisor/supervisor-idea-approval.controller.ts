import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorIdeaApprovalService } from '../../services/supervisor/supervisor-idea-approval.service';
import { ApproveIdeaDto, RejectIdeaDto } from '../../dto/supervisor.dto';

@ApiTags('Supervisor - Idea Approvals')
@Controller('supervisor')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorIdeaApprovalController {
  constructor(private readonly service: SupervisorIdeaApprovalService) {}

  @Get('assigned-groups')
  @ApiOperation({ summary: 'Get all assigned groups with complete details' })
  async getAllAssignedGroups(@CurrentUser('userId') supervisorId: string) {
    const groups = await this.service.getAllAssignedGroups(supervisorId);
    return {
      statusCode: 200,
      message: 'Assigned groups retrieved successfully',
      data: groups,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('assigned-groups/:id')
  @ApiOperation({ summary: 'Get single assigned group by ID with complete details' })
  async getAssignedGroupById(
    @Param('id') groupId: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    const group = await this.service.getAssignedGroupById(groupId, supervisorId);
    return {
      statusCode: 200,
      message: 'Group details retrieved successfully',
      data: group,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('custom-ideas')
  @ApiOperation({ summary: 'Get all custom ideas pending approval' })
  async getCustomIdeas(@CurrentUser('userId') supervisorId: string) {
    return this.service.getCustomIdeas(supervisorId);
  }

  @Put('custom-ideas/:id/approve')
  @ApiOperation({ summary: 'Approve custom idea' })
  async approveCustomIdea(
    @Param('id') id: string,
    @Body() dto: ApproveIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.approveCustomIdea(id, dto, supervisorId);
  }

  @Put('custom-ideas/:id/reject')
  @ApiOperation({ summary: 'Reject custom idea' })
  async rejectCustomIdea(
    @Param('id') id: string,
    @Body() dto: RejectIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.rejectCustomIdea(id, dto, supervisorId);
  }

  @Get('selected-ideas')
  @ApiOperation({ summary: 'Get all selected ideas pending approval' })
  async getSelectedIdeas(@CurrentUser('userId') supervisorId: string) {
    return this.service.getSelectedIdeas(supervisorId);
  }

  @Put('selected-ideas/:id/approve')
  @ApiOperation({ summary: 'Approve selected idea from list' })
  async approveSelectedIdea(
    @Param('id') id: string,
    @Body() dto: ApproveIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.approveSelectedIdea(id, dto, supervisorId);
  }

  @Put('selected-ideas/:id/reject')
  @ApiOperation({ summary: 'Reject selected idea from list' })
  async rejectSelectedIdea(
    @Param('id') id: string,
    @Body() dto: RejectIdeaDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.rejectSelectedIdea(id, dto, supervisorId);
  }
}
