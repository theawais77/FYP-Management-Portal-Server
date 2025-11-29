import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/constants/constants';
import { ProposalService } from 'src/services/proposal/proposal.service';
import { UploadDocumentDto } from 'src/dto/student.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Proposals & Documents')
@Controller()
@ApiBearerAuth()
@Roles(UserRole.STUDENT)
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post('proposals')
  @ApiOperation({ summary: 'Upload proposal (ZIP only, max 10MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/proposals',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `proposal-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (extname(file.originalname).toLowerCase() !== '.zip') {
          return cb(new BadRequestException('Only ZIP files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadProposal(
    @CurrentUser('userId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.proposalService.uploadProposal(studentId, file);
  }

  @Put('proposals/:id/submit')
  @ApiOperation({ summary: 'Submit proposal for review' })
  async submitProposal(
    @Param('id') proposalId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.proposalService.submitProposal(proposalId, studentId);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload other documents (ZIP only, max 10MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        documentType: {
          type: 'string',
          enum: ['proposal', 'presentation', 'report', 'other'],
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `document-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (extname(file.originalname).toLowerCase() !== '.zip') {
          return cb(new BadRequestException('Only ZIP files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(
    @CurrentUser('userId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.proposalService.uploadDocument(studentId, file, dto);
  }

  @Get('documents/my-documents')
  @ApiOperation({ summary: 'View uploaded documents and proposal' })
  async getMyDocuments(@CurrentUser('userId') studentId: string) {
    return this.proposalService.getMyDocuments(studentId);
  }
}
