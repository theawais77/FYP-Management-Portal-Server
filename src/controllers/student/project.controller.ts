import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { ProjectService } from 'src/services/project/project.service';
import { SelectIdeaDto, RequestCustomIdeaDto, SubmitGithubDto } from 'src/dto/student.dto';

@ApiTags('Student - Projects')
@Controller('projects')
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('supervisor/ideas')
  @ApiOperation({ summary: 'View assigned supervisor project ideas' })
  async getSupervisorIdeas(
    @CurrentUser('userId') studentId: string,
  ) {
    return this.projectService.getSupervisorIdeas(studentId);
  }

  @Post('select-idea')
  @ApiOperation({ summary: 'Select project idea from supervisor list' })
  async selectIdea(
    @Body() dto: SelectIdeaDto,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.projectService.selectIdea(dto, studentId);
  }

  @Post('request-custom-idea')
  @ApiOperation({ summary: 'Request custom project idea for approval' })
  async requestCustomIdea(
    @Body() dto: RequestCustomIdeaDto,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.projectService.requestCustomIdea(dto, studentId);
  }

  @Get('my-project')
  @ApiOperation({ summary: 'Get own project details' })
  async getMyProject(@CurrentUser('userId') studentId: string) {
    return this.projectService.getMyProject(studentId);
  }

  @Post('github')
  @ApiOperation({ summary: 'Submit GitHub repository URL' })
  async submitGithub(
    @Body() dto: SubmitGithubDto,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.projectService.submitGithub(dto, studentId);
  }

  @Get('github/my')
  @ApiOperation({ summary: 'View submitted GitHub repository' })
  async getMyGithub(@CurrentUser('userId') studentId: string) {
    return this.projectService.getMyGithub(studentId);
  }
}
