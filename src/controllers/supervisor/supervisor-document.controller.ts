import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/constants';
import { SupervisorDocumentService } from '../../services/supervisor/supervisor-document.service';
import { ApproveDocumentDto, RejectDocumentDto, DocumentFeedbackDto } from '../../dto/supervisor.dto';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Supervisor - Documents')
@Controller('supervisor/documents')
@ApiBearerAuth()
@Roles(UserRole.SUPERVISOR)
export class SupervisorDocumentController {
  constructor(private readonly service: SupervisorDocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents from assigned groups' })
  async getDocuments(@CurrentUser('userId') supervisorId: string) {
    return this.service.getDocuments(supervisorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async getDocument(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.getDocument(id, supervisorId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document ZIP file' })
  async downloadDocument(
    @Param('id') id: string,
    @CurrentUser('userId') supervisorId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { filePath, fileName, mimeType } = await this.service.downloadDocument(id, supervisorId);
    
    const file = fs.createReadStream(filePath);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve document' })
  async approveDocument(
    @Param('id') id: string,
    @Body() dto: ApproveDocumentDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.approveDocument(id, dto, supervisorId);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject document' })
  async rejectDocument(
    @Param('id') id: string,
    @Body() dto: RejectDocumentDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.rejectDocument(id, dto, supervisorId);
  }

  @Put(':id/feedback')
  @ApiOperation({ summary: 'Add feedback to document' })
  async addFeedback(
    @Param('id') id: string,
    @Body() dto: DocumentFeedbackDto,
    @CurrentUser('userId') supervisorId: string,
  ) {
    return this.service.addFeedback(id, dto, supervisorId);
  }
}
