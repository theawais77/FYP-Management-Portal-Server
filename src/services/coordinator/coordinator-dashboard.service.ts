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
import { Coordinator, CoordinatorDocument } from '../../schema/coordinator.schema';
import { NotFoundException } from '@nestjs/common';

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
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
  ) {}

  async getDashboard(coordinatorId: string) {
    const coordinator = await this.coordinatorModel.findById(coordinatorId).populate('department');
    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const department = coordinator.department as any;
    const departmentName = department.name;

    // A. Users Summary
    const totalStudents = await this.studentModel.countDocuments({ department: departmentName });
    const studentsRegisteredForFYP = await this.studentModel.countDocuments({
      department: departmentName,
      isRegisteredForFYP: true,
    });
    const studentsNotRegistered = totalStudents - studentsRegisteredForFYP;
    const totalSupervisors = await this.supervisorModel.countDocuments({ department: departmentName });

    // Faculty per department (only coordinator's department)
    const facultyByDepartment = [{
      department: departmentName,
      count: totalSupervisors,
    }];

    const usersSummary = {
      totalStudents,
      totalSupervisors,
      studentsRegisteredForFYP,
      studentsNotRegistered,
      facultyPerDepartment: facultyByDepartment,
    };

    // B. Group / Project Overview
    const totalGroups = await this.groupModel.countDocuments({ department: departmentName });
    const groupsWithSupervisor = await this.groupModel.countDocuments({
      department: departmentName,
      assignedSupervisor: { $exists: true, $ne: null },
    });
    const groupsWithoutSupervisor = totalGroups - groupsWithSupervisor;

    // Projects pending approval (filter by department through group)
    const allProjects = await this.projectModel.find().populate('group').lean();
    const departmentProjects = allProjects.filter((p: any) => p.group?.department === departmentName);
    
    const projectSelectionsPendingApproval = departmentProjects.filter(
      (p: any) => p.ideaStatus === 'pending'
    ).length;

    const projectSelectionsApproved = departmentProjects.filter(
      (p: any) => p.ideaStatus === 'approved'
    ).length;

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
      department: departmentName,
      date: { $gte: now },
    });

    const totalPanelsCreated = await this.panelModel.countDocuments({ department: departmentName });

    // Check for schedule conflicts by looking for duplicate date+time+room or date+time+panel
    const allSchedules = await this.scheduleModel.find({ department: departmentName }).lean();
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
      .findOne({ department: departmentName, date: { $gte: now } })
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
    const allProposalsWithGroups = await this.proposalModel.find().populate({
      path: 'project',
      populate: { path: 'group' }
    }).lean();
    
    const departmentProposals = allProposalsWithGroups.filter(
      (p: any) => p.project?.group?.department === departmentName
    );

    const proposalsSubmitted = departmentProposals.filter(
      (p: any) => p.status === 'submitted'
    ).length;

    const proposalsApproved = departmentProposals.filter(
      (p: any) => p.status === 'approved'
    ).length;

    const proposalsRejected = departmentProposals.filter(
      (p: any) => p.status === 'rejected'
    ).length;

    const allDocumentsWithGroups = await this.documentModel.find().populate('group').lean();
    const departmentDocuments = allDocumentsWithGroups.filter(
      (d: any) => d.group?.department === departmentName
    );

    const documentsUploaded = departmentDocuments.length;

    const documentsPendingReview = departmentDocuments.filter(
      (d: any) => d.status === 'pending'
    ).length;

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
      .find({ department: departmentName })
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
      .find({ department: departmentName })
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
