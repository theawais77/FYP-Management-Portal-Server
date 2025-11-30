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
import { SupervisorEvaluationService } from '../../services/supervisor/supervisor-evaluation.service';
import { EvaluateGithubDto, FinalMarksDto, FinalFeedbackDto } from '../../dto/supervisor.dto';

@ApiTags('Supervisor - Evaluations')
@Controller('supervisor')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorEvaluationController {
  constructor(private readonly service: SupervisorEvaluationService) {}

  @Get('projects/:id/github')
  @ApiOperation({ summary: 'Get project GitHub details' })
  async getProjectGithub(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.getProjectGithub(id, supervisorId);
  }

  @Put('projects/:id/github/evaluate')
  @ApiOperation({ summary: 'Evaluate GitHub repository' })
  async evaluateGithub(
    @Param('id') id: string,
    @Body() dto: EvaluateGithubDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.evaluateGithub(id, dto, supervisorId);
  }

  @Get('final-evaluations')
  @ApiOperation({ summary: 'Get all projects for final evaluation' })
  async getFinalEvaluations(@CurrentUser('userId') supervisorId: string) {
    return this.service.getFinalEvaluations(supervisorId);
  }

  @Put('final-evaluations/:id/marks')
  @ApiOperation({ summary: 'Add final marks' })
  async addFinalMarks(
    @Param('id') id: string,
    @Body() dto: FinalMarksDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.addFinalMarks(id, dto, supervisorId);
  }

  @Put('final-evaluations/:id/feedback')
  @ApiOperation({ summary: 'Add final feedback' })
  async addFinalFeedback(
    @Param('id') id: string,
    @Body() dto: FinalFeedbackDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.addFinalFeedback(id, dto, supervisorId);
  }

  @Put('final-evaluations/:id/complete')
  @ApiOperation({ summary: 'Mark evaluation as complete' })
  async completeEvaluation(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.completeEvaluation(id, supervisorId);
  }
}
