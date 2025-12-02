import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PresentationSchedule, PresentationScheduleDocument } from 'src/schema/presentation-schedule.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';

@Injectable()
export class StudentScheduleService {
  constructor(
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async getMySchedule(studentId: string) {
    // Find student's group
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    // Find schedule for this group
    const schedule = await this.scheduleModel
      .findOne({ group: group._id })
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName rollNumber email' },
          { path: 'members', select: 'firstName lastName rollNumber email' },
        ],
      })
      .populate({
        path: 'panel',
        populate: {
          path: 'members',
          select: 'firstName lastName email designation specialization',
        },
      });

    if (!schedule) {
      return {
        message: 'No presentation schedule assigned yet',
        schedule: null,
      };
    }

    return {
      message: 'Presentation schedule retrieved successfully',
      schedule: {
        id: schedule._id,
        date: schedule.date,
        timeSlot: schedule.timeSlot,
        room: schedule.room,
        department: schedule.department,
        notes: schedule.notes,
        isCompleted: schedule.isCompleted,
        completedAt: schedule.completedAt,
        group: schedule.group,
        panel: schedule.panel,
      },
    };
  }

  async getMyPanel(studentId: string) {
    // Find student's group
    const group = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    // Find schedule for this group to get panel
    const schedule = await this.scheduleModel
      .findOne({ group: group._id })
      .populate({
        path: 'panel',
        populate: {
          path: 'members',
          select: 'firstName lastName email designation department specialization officeLocation officeHours',
        },
      });

    if (!schedule || !schedule.panel) {
      return {
        message: 'No evaluation panel assigned yet',
        panel: null,
      };
    }

    return {
      message: 'Evaluation panel retrieved successfully',
      panel: schedule.panel,
    };
  }
}
