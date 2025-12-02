import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PresentationSchedule, PresentationScheduleDocument } from 'src/schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelDocument } from 'src/schema/evaluation-panel.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';

@Injectable()
export class SupervisorScheduleService {
  constructor(
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
    @InjectModel(EvaluationPanel.name) private panelModel: Model<EvaluationPanelDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async getMyPanels(supervisorId: string) {
    // Find all panels where this supervisor is a member
    const panels = await this.panelModel
      .find({ members: supervisorId, isActive: true })
      .populate({
        path: 'members',
        select: 'firstName lastName email designation department specialization',
      })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    if (!panels || panels.length === 0) {
      return {
        message: 'You are not assigned to any evaluation panels',
        panels: [],
      };
    }

    return {
      message: 'Evaluation panels retrieved successfully',
      totalPanels: panels.length,
      panels,
    };
  }

  async getMyPanelSchedules(supervisorId: string) {
    // Find all panels where this supervisor is a member
    const panels = await this.panelModel.find({ members: supervisorId, isActive: true });

    if (!panels || panels.length === 0) {
      return {
        message: 'You are not assigned to any evaluation panels',
        schedules: [],
      };
    }

    const panelIds = panels.map(p => p._id);

    // Find all schedules for these panels
    const schedules = await this.scheduleModel
      .find({ panel: { $in: panelIds } })
      .populate({
        path: 'group',
        select: '-isRegisteredForFYP',
        populate: [
          { path: 'leader', select: 'firstName lastName rollNumber email' },
          { path: 'members', select: 'firstName lastName rollNumber email' },
          { path: 'assignedSupervisor', select: 'firstName lastName email designation' },
        ],
      })
      .populate({
        path: 'panel',
        populate: {
          path: 'members',
          select: 'firstName lastName designation',
        },
      })
      .sort({ date: 1, timeSlot: 1 });

    return {
      message: 'Panel schedules retrieved successfully',
      totalSchedules: schedules.length,
      schedules,
    };
  }

  async getAssignedGroupsSchedules(supervisorId: string) {
    // Verify supervisor exists
    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Find all groups assigned to this supervisor
    const assignedGroups = await this.groupModel
      .find({ assignedSupervisor: supervisorId })
      .select('-isRegisteredForFYP');

    if (!assignedGroups || assignedGroups.length === 0) {
      return {
        message: 'You have no assigned groups',
        schedules: [],
        unscheduledGroups: [],
        totalAssignedGroups: 0,
        scheduledCount: 0,
        unscheduledCount: 0,
      };
    }

    const groupIds = assignedGroups.map(g => g._id);

    // Find schedules for assigned groups
    const schedules = await this.scheduleModel
      .find({ group: { $in: groupIds } })
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
          select: 'firstName lastName designation email',
        },
      })
      .sort({ date: 1, timeSlot: 1 });

    // Separate scheduled and unscheduled groups
    const scheduledGroupIds = new Set(schedules.map(s => s.group.toString()));
    const unscheduledGroups = assignedGroups.filter(
      g => !scheduledGroupIds.has(g._id.toString())
    );

    return {
      message: 'Assigned groups schedules retrieved successfully',
      totalAssignedGroups: assignedGroups.length,
      scheduledCount: schedules.length,
      unscheduledCount: unscheduledGroups.length,
      schedules,
      unscheduledGroups: unscheduledGroups.map(g => ({
        id: g._id,
        name: g.name,
        department: g.department,
      })),
    };
  }
}
