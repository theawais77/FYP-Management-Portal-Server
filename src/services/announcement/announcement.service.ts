import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from 'src/dto/announcement.dto';
import { Announcement, AnnouncementDocument } from 'src/schema/announcement.schema';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
  ) {}

  async create(dto: CreateAnnouncementDto, coordinatorId: string) {
    const announcement = await this.announcementModel.create({
      ...dto,
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
