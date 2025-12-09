import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PresentationSchedule, PresentationScheduleDocument } from 'src/schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelDocument } from 'src/schema/evaluation-panel.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { Coordinator, CoordinatorDocument } from 'src/schema/coordinator.schema';
import { CreateScheduleDto, UpdateScheduleDto, AutoScheduleDto, SwapScheduleDto } from 'src/dto/coordinator.dto';

@Injectable()
export class PresentationScheduleService {
  constructor(
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
    @InjectModel(EvaluationPanel.name) private panelModel: Model<EvaluationPanelDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
  ) {}

  async create(dto: CreateScheduleDto, coordinatorId: string) {
    // Validate group exists
    const group = await this.groupModel.findById(dto.groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Validate panel exists
    const panel = await this.panelModel.findById(dto.panelId);
    if (!panel) {
      throw new NotFoundException('Evaluation panel not found');
    }

    // Check if panel is from the same department
    if (panel.department !== dto.department) {
      throw new BadRequestException('Panel must be from the same department');
    }

    // Check if group already has a schedule
    const existingGroupSchedule = await this.scheduleModel.findOne({ group: dto.groupId });
    if (existingGroupSchedule) {
      throw new ConflictException('This group already has a presentation schedule');
    }

    // Check for conflicts: same panel, date, and time slot
    const panelConflict = await this.scheduleModel.findOne({
      panel: dto.panelId,
      date: new Date(dto.date),
      timeSlot: dto.timeSlot,
    });
    if (panelConflict) {
      throw new ConflictException('This panel is already scheduled at this time');
    }

    // Check for conflicts: same room, date, and time slot
    const roomConflict = await this.scheduleModel.findOne({
      room: dto.room,
      date: new Date(dto.date),
      timeSlot: dto.timeSlot,
    });
    if (roomConflict) {
      throw new ConflictException('This room is already booked at this time');
    }

    const schedule = await this.scheduleModel.create({
      group: dto.groupId,
      panel: dto.panelId,
      date: new Date(dto.date),
      timeSlot: dto.timeSlot,
      room: dto.room,
      department: dto.department,
      notes: dto.notes,
      createdBy: coordinatorId,
    });

    const populatedSchedule = await this.scheduleModel
      .findById(schedule._id)
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
        populate: { path: 'members', select: 'firstName lastName designation' },
      });

    return {
      message: 'Presentation schedule created successfully',
      schedule: populatedSchedule,
    };
  }

  async findAll(coordinatorId: string, date?: string) {
    const coordinator = await this.coordinatorModel.findById(coordinatorId).populate('department');
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const department = coordinator.department as any;
    const query: any = { department: department.name };
    if (date) {
      query.date = new Date(date);
    }

    const schedules = await this.scheduleModel
      .find(query)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName rollNumber' },
          { path: 'members', select: 'firstName lastName rollNumber' },
        ],
      })
      .populate({
        path: 'panel',
        populate: { path: 'members', select: 'firstName lastName designation' },
      })
      .sort({ date: 1, timeSlot: 1 });

    return schedules;
  }

  async findOne(id: string) {
    const schedule = await this.scheduleModel
      .findById(id)
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
        populate: { path: 'members', select: 'firstName lastName designation email' },
      });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const schedule = await this.scheduleModel.findById(id);

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Validate panel if updating
    if (dto.panelId) {
      const panel = await this.panelModel.findById(dto.panelId);
      if (!panel) {
        throw new NotFoundException('Evaluation panel not found');
      }
      if (panel.department !== schedule.department) {
        throw new BadRequestException('Panel must be from the same department');
      }
    }

    // Check for conflicts if updating date, time, or room
    const updatedDate = dto.date ? new Date(dto.date) : schedule.date;
    const updatedTimeSlot = dto.timeSlot || schedule.timeSlot;
    const updatedRoom = dto.room || schedule.room;
    const updatedPanel = dto.panelId || schedule.panel;

    // Check panel conflict (exclude current schedule)
    if (dto.panelId || dto.date || dto.timeSlot) {
      const panelConflict = await this.scheduleModel.findOne({
        _id: { $ne: id },
        panel: updatedPanel,
        date: updatedDate,
        timeSlot: updatedTimeSlot,
      });
      if (panelConflict) {
        throw new ConflictException('This panel is already scheduled at this time');
      }
    }

    // Check room conflict (exclude current schedule)
    if (dto.room || dto.date || dto.timeSlot) {
      const roomConflict = await this.scheduleModel.findOne({
        _id: { $ne: id },
        room: updatedRoom,
        date: updatedDate,
        timeSlot: updatedTimeSlot,
      });
      if (roomConflict) {
        throw new ConflictException('This room is already booked at this time');
      }
    }

    const updateData: any = {};
    if (dto.panelId) updateData.panel = dto.panelId;
    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.timeSlot) updateData.timeSlot = dto.timeSlot;
    if (dto.room) updateData.room = dto.room;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    await this.scheduleModel.findByIdAndUpdate(id, updateData);

    const updatedSchedule = await this.scheduleModel
      .findById(id)
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName rollNumber' },
          { path: 'members', select: 'firstName lastName rollNumber' },
        ],
      })
      .populate({
        path: 'panel',
        populate: { path: 'members', select: 'firstName lastName designation' },
      });

    return {
      message: 'Schedule updated successfully',
      schedule: updatedSchedule,
    };
  }

  async remove(id: string) {
    const schedule = await this.scheduleModel.findById(id);

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleModel.findByIdAndDelete(id);

    return {
      message: 'Schedule deleted successfully',
    };
  }

  async autoSchedule(dto: AutoScheduleDto, coordinatorId: string) {
    // Validate panel
    const panel = await this.panelModel.findById(dto.panelId);
    if (!panel) {
      throw new NotFoundException('Evaluation panel not found');
    }

    if (panel.department !== dto.department) {
      throw new BadRequestException('Panel must be from the same department');
    }

    // Get all groups from the department that don't have a schedule yet
    const allGroups = await this.groupModel.find({ department: dto.department });
    const scheduledGroupIds = await this.scheduleModel.distinct('group');
    const unscheduledGroups = allGroups.filter(
      group => !scheduledGroupIds.some(id => id.toString() === group._id.toString())
    );

    if (unscheduledGroups.length === 0) {
      throw new BadRequestException('All groups in this department already have schedules');
    }

    // Generate 30-minute time slots from 9:00 AM to 4:00 PM
    const timeSlots = this.generateTimeSlots();
    const date = new Date(dto.date);

    // Get existing schedules for this date and room
    const existingSchedules = await this.scheduleModel.find({
      date,
      room: dto.room,
    });

    const bookedSlots = new Set(existingSchedules.map(s => s.timeSlot));
    const availableSlots = timeSlots.filter(slot => !bookedSlots.has(slot));

    if (availableSlots.length === 0) {
      throw new BadRequestException('No available time slots for this date and room');
    }

    const schedulesToCreate: any[] = [];
    const groupsToSchedule = unscheduledGroups.slice(0, availableSlots.length);

    for (let i = 0; i < groupsToSchedule.length; i++) {
      schedulesToCreate.push({
        group: groupsToSchedule[i]._id,
        panel: dto.panelId,
        date,
        timeSlot: availableSlots[i],
        room: dto.room,
        department: dto.department,
        createdBy: coordinatorId,
      });
    }

    const createdSchedules = await this.scheduleModel.insertMany(schedulesToCreate);

    const populatedSchedules = await this.scheduleModel
      .find({ _id: { $in: createdSchedules.map(s => s._id) } })
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: { path: 'leader', select: 'firstName lastName rollNumber' },
      })
      .populate('panel', 'name')
      .sort({ timeSlot: 1 });

    return {
      message: `Successfully scheduled ${createdSchedules.length} groups`,
      totalGroupsScheduled: createdSchedules.length,
      remainingGroups: unscheduledGroups.length - createdSchedules.length,
      schedules: populatedSchedules,
    };
  }

  async swapSchedules(dto: SwapScheduleDto) {
    const [schedule1, schedule2] = await Promise.all([
      this.scheduleModel.findById(dto.scheduleId1),
      this.scheduleModel.findById(dto.scheduleId2),
    ]);

    if (!schedule1 || !schedule2) {
      throw new NotFoundException('One or both schedules not found');
    }

    // Swap time slots, dates, rooms, and panels
    const temp = {
      date: schedule1.date,
      timeSlot: schedule1.timeSlot,
      room: schedule1.room,
      panel: schedule1.panel,
    };

    await this.scheduleModel.findByIdAndUpdate(dto.scheduleId1, {
      date: schedule2.date,
      timeSlot: schedule2.timeSlot,
      room: schedule2.room,
      panel: schedule2.panel,
    });

    await this.scheduleModel.findByIdAndUpdate(dto.scheduleId2, {
      date: temp.date,
      timeSlot: temp.timeSlot,
      room: temp.room,
      panel: temp.panel,
    });

    const [updatedSchedule1, updatedSchedule2] = await Promise.all([
      this.scheduleModel
        .findById(dto.scheduleId1)
        .populate({
          path: 'group',
          select: '-isRegisteredForFYP',
          populate: { path: 'leader', select: 'firstName lastName rollNumber' },
        })
        .populate('panel', 'name'),
      this.scheduleModel
        .findById(dto.scheduleId2)
        .populate({
          path: 'group',
          select: '-isRegisteredForFYP',
          populate: { path: 'leader', select: 'firstName lastName rollNumber' },
        })
        .populate('panel', 'name'),
    ]);

    return {
      message: 'Schedules swapped successfully',
      schedules: [updatedSchedule1, updatedSchedule2],
    };
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour < 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 30;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
        slots.push(`${startTime}-${endTime}`);
      }
    }
    return slots.slice(0, -1); // Remove the last slot that goes beyond 4 PM
  }
}
