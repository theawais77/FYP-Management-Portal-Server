import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from 'src/dto/announcement.dto';
import { Announcement, AnnouncementDocument, AnnouncementTargetAudience } from 'src/schema/announcement.schema';
import { Coordinator, CoordinatorDocument } from 'src/schema/coordinator.schema';
import { Department, DepartmentDocument } from 'src/schema/department.schema';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
    @InjectModel(Coordinator.name)
    private coordinatorModel: Model<CoordinatorDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(dto: CreateAnnouncementDto, coordinatorId: string) {
    // Fetch coordinator to get their department
    const coordinator = await this.coordinatorModel
      .findById(coordinatorId)
      .populate('department');

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const department = await this.departmentModel.findById(coordinator.department);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const announcement = await this.announcementModel.create({
      title: dto.title,
      content: dto.content,
      targetAudience: dto.targetAudience,
      department: department.name,
      createdBy: coordinatorId,
    });

    return {
      message: 'Announcement created successfully',
      announcement,
    };
  }

  async findAll(department?: string) {
    const query: any = {};

    if (department) {
      query.department = department;
    }

    const announcements = await this.announcementModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return announcements;
  }

  async findByDepartmentAndAudience(department: string, targetAudience: AnnouncementTargetAudience | 'all') {
    const query: any = { department };

    if (targetAudience !== 'all') {
      // If specific audience, get both that audience and general announcements
      query.targetAudience = { 
        $in: [targetAudience, AnnouncementTargetAudience.GENERAL] 
      };
    }

    const announcements = await this.announcementModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return announcements;
  }

  async findOne(id: string) {
    const announcement = await this.announcementModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async update(id: string, dto: UpdateAnnouncementDto, coordinatorId: string) {
    const announcement = await this.announcementModel.findById(id);

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.createdBy.toString() !== coordinatorId) {
      throw new ForbiddenException('You can only edit your own announcements');
    }

    Object.assign(announcement, dto);
    await announcement.save();

    return {
      message: 'Announcement updated successfully',
      announcement,
    };
  }

  async remove(id: string, coordinatorId: string) {
    const announcement = await this.announcementModel.findById(id);

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.createdBy.toString() !== coordinatorId) {
      throw new ForbiddenException('You can only delete your own announcements');
    }

    await announcement.deleteOne();

    return {
      message: 'Announcement deleted successfully',
    };
  }
}
