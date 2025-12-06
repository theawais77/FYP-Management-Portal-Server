import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../../schema/student.schema';
import { Supervisor, SupervisorDocument } from '../../schema/supervisor.schema';
import { Group, GroupDocument } from '../../schema/group.schema';
import { Project, ProjectDocument } from '../../schema/project.schema';
import { Proposal, ProposalDocument } from '../../schema/proposal.schema';
import { FYPDocument, FYPDocumentDocument } from '../../schema/document.schema';
import { PresentationSchedule, PresentationScheduleDocument } from '../../schema/presentation-schedule.schema';
import { EvaluationPanel, EvaluationPanelDocument } from '../../schema/evaluation-panel.schema';
import { Announcement, AnnouncementDocument } from '../../schema/announcement.schema';

@Injectable()
export class CoordinatorDashboardService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(FYPDocument.name) private documentModel: Model<FYPDocumentDocument>,
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
    @InjectModel(EvaluationPanel.name) private panelModel: Model<EvaluationPanelDocument>,
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
  ) {}

  async getDashboard() {
    // A. Users Summary
    const totalStudents = await this.studentModel.countDocuments();
    const studentsRegisteredForFYP = await this.studentModel.countDocuments({
      isRegisteredForFYP: true,
    });
    const studentsNotRegistered = totalStudents - studentsRegisteredForFYP;
    const totalSupervisors = await this.supervisorModel.countDocuments();

    // Faculty per department
    const facultyByDepartment = await this.supervisorModel.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          department: '$_id',
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { department: 1 },
      },
    ]);

    const usersSummary = {
      totalStudents,
      totalSupervisors,
      studentsRegisteredForFYP,
      studentsNotRegistered,
      facultyPerDepartment: facultyByDepartment,
    };

    // B. Group / Project Overview
    const totalGroups = await this.groupModel.countDocuments();
    const groupsWithSupervisor = await this.groupModel.countDocuments({
      assignedSupervisor: { $exists: true, $ne: null },
    });
    const groupsWithoutSupervisor = totalGroups - groupsWithSupervisor;

    // Projects pending approval (either custom ideas or selected ideas)
    const projectSelectionsPendingApproval = await this.projectModel.countDocuments({
      ideaStatus: 'pending',
    });

    const projectSelectionsApproved = await this.projectModel.countDocuments({
      ideaStatus: 'approved',
    });

    const groupProjectOverview = {
      totalGroups,
      groupsWithoutSupervisor,
      groupsWithSupervisor,
      projectSelectionsPendingApproval,
      projectSelectionsApproved,
    };

    // C. Schedules & Panels
    const now = new Date();
    const upcomingPresentationsCount = await this.scheduleModel.countDocuments({
      date: { $gte: now },
    });

    const totalPanelsCreated = await this.panelModel.countDocuments();

    // Check for schedule conflicts by looking for duplicate date+time+room or date+time+panel
    const allSchedules = await this.scheduleModel.find().lean();
    let scheduleConflictsDetected = 0;
    const seenCombinations = new Set<string>();
    
    for (const schedule of allSchedules) {
      const roomKey = `${schedule.date}-${schedule.timeSlot}-${schedule.room}`;
      const panelKey = `${schedule.date}-${schedule.timeSlot}-${schedule.panel}`;
      
      if (seenCombinations.has(roomKey) || seenCombinations.has(panelKey)) {
        scheduleConflictsDetected++;
      }
      seenCombinations.add(roomKey);
      seenCombinations.add(panelKey);
    }

    // Get next presentation slot
    const nextPresentation = await this.scheduleModel
      .findOne({ date: { $gte: now } })
      .sort({ date: 1, timeSlot: 1 })
      .populate('group', 'name')
      .lean();

    const nextPresentationSlot = nextPresentation
      ? {
          date: nextPresentation.date,
          time: nextPresentation.timeSlot,
          room: nextPresentation.room,
          groupName: (nextPresentation as any).group?.name || 'Unknown',
        }
      : null;

    const schedulesAndPanels = {
      upcomingPresentationsCount,
      totalPanelsCreated,
      scheduleConflictsDetected,
      nextPresentationSlot,
    };

    // D. Proposals & Documents
    const proposalsSubmitted = await this.proposalModel.countDocuments({
      status: 'submitted',
    });

    const proposalsApproved = await this.proposalModel.countDocuments({
      status: 'approved',
    });

    const proposalsRejected = await this.proposalModel.countDocuments({
      status: 'rejected',
    });

    const documentsUploaded = await this.documentModel.countDocuments();

    const documentsPendingReview = await this.documentModel.countDocuments({
      status: 'pending',
    });

    const proposalsAndDocuments = {
      proposalSummary: {
        proposalsSubmitted,
        proposalsApproved,
        proposalsRejected,
      },
      documentSummary: {
        documentsUploaded,
        documentsPendingReview,
      },
    };

    // E. Supervisor Availability
    const supervisors = await this.supervisorModel
      .find()
      .select('firstName lastName department maxStudents currentStudentCount isAvailableForSupervision')
      .lean();

    // Get assigned groups count for each supervisor
    const supervisorsWithAvailability = await Promise.all(
      supervisors.map(async (supervisor: any) => {
        const assignedGroupsCount = await this.groupModel.countDocuments({
          assignedSupervisor: supervisor._id,
        });

        const availableSlots = supervisor.maxStudents - assignedGroupsCount;

        return {
          id: supervisor._id,
          name: `${supervisor.firstName} ${supervisor.lastName}`,
          department: supervisor.department,
          assignedGroupsCount,
          availableSlots,
          isAvailable: supervisor.isAvailableForSupervision,
        };
      }),
    );

    const supervisorAvailability = {
      supervisors: supervisorsWithAvailability.sort((a, b) => b.availableSlots - a.availableSlots),
    };

    // F. Announcements
    const recentAnnouncements = await this.announcementModel
      .find()
      .sort({ _id: -1 })
      .limit(5)
      .populate('createdBy', 'firstName lastName')
      .lean();

    const announcements = {
      recent: recentAnnouncements.map((announcement: any) => ({
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        targetAudience: announcement.targetAudience,
        createdBy: announcement.createdBy
          ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`
          : 'Unknown',
        createdAt: announcement.createdAt || announcement._id.getTimestamp(),
      })),
    };

    return {
      usersSummary,
      groupProjectOverview,
      schedulesAndPanels,
      proposalsAndDocuments,
      supervisorAvailability,
      announcements,
    };
  }
}
