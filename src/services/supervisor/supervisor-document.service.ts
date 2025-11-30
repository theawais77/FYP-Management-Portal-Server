import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FYPDocument, FYPDocumentDocument, DocumentStatus } from 'src/schema/document.schema';
import { ApproveDocumentDto, RejectDocumentDto, DocumentFeedbackDto } from 'src/dto/supervisor.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupervisorDocumentService {
  constructor(
    @InjectModel(FYPDocument.name)
    private documentModel: Model<FYPDocumentDocument>,
  ) {}

  // Get all documents from supervisor's groups
  async getDocuments(supervisorId: string) {
    const documents = await this.documentModel
      .find()
      .populate({
        path: 'project',
        match: { supervisor: supervisorId },
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber' },
              { path: 'members', select: 'firstName lastName email rollNumber' },
            ],
          },
        ],
      })
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Filter out documents where project doesn't match
    return documents.filter((d) => d.project);
  }

  // Get single document
  async getDocument(id: string, supervisorId: string) {
    const document = await this.documentModel
      .findById(id)
      .populate({
        path: 'project',
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber' },
              { path: 'members', select: 'firstName lastName email rollNumber' },
            ],
          },
          { path: 'supervisor', select: 'firstName lastName email' },
        ],
      })
      .populate('uploadedBy', 'firstName lastName email');

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const project = document.project as any;
    if (project.supervisor._id.toString() !== supervisorId) {
      throw new ForbiddenException('You can only view documents from your assigned groups');
    }

    return document;
  }

  // Download document
  async downloadDocument(id: string, supervisorId: string) {
    const document = await this.documentModel.findById(id).populate('project');

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const project = document.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only download documents from your assigned groups');
    }

    const filePath = path.join(process.cwd(), document.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return {
      filePath,
      fileName: document.fileName,
      mimeType: 'application/zip',
    };
  }

  // Approve document
  async approveDocument(id: string, dto: ApproveDocumentDto, supervisorId: string) {
    const document = await this.documentModel.findById(id).populate('project');

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const project = document.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only approve documents from your assigned groups');
    }

    await this.documentModel.findByIdAndUpdate(id, {
      status: DocumentStatus.APPROVED,
      supervisorFeedback: dto.comments,
      reviewedAt: new Date(),
      reviewedBy: supervisorId,
    });

    const updatedDocument = await this.documentModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Document approved successfully',
      document: updatedDocument,
    };
  }

  // Reject document
  async rejectDocument(id: string, dto: RejectDocumentDto, supervisorId: string) {
    const document = await this.documentModel.findById(id).populate('project');

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const project = document.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only reject documents from your assigned groups');
    }

    await this.documentModel.findByIdAndUpdate(id, {
      status: DocumentStatus.REJECTED,
      rejectionReason: dto.reason,
      reviewedAt: new Date(),
      reviewedBy: supervisorId,
    });

    const updatedDocument = await this.documentModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Document rejected',
      document: updatedDocument,
    };
  }

  // Add feedback to document
  async addFeedback(id: string, dto: DocumentFeedbackDto, supervisorId: string) {
    const document = await this.documentModel.findById(id).populate('project');

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const project = document.project as any;
    if (project.supervisor.toString() !== supervisorId) {
      throw new ForbiddenException('You can only provide feedback on documents from your assigned groups');
    }

    await this.documentModel.findByIdAndUpdate(id, {
      supervisorFeedback: dto.feedback,
    });

    const updatedDocument = await this.documentModel
      .findById(id)
      .populate({
        path: 'project',
        populate: {
          path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email' },
              { path: 'members', select: 'firstName lastName email' },
            ],
          },
        })
      .populate('uploadedBy', 'firstName lastName email');

    return {
      message: 'Feedback added successfully',
      document: updatedDocument,
    };
  }
}
