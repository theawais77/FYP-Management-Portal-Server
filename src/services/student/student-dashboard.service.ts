import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { Project, ProjectDocument } from 'src/schema/project.schema';
import { Proposal, ProposalDocument } from 'src/schema/proposal.schema';
import type { FYPDocumentDocument } from 'src/schema/document.schema';
import { FYPDocument } from 'src/schema/document.schema';
import { PresentationSchedule, PresentationScheduleDocument } from 'src/schema/presentation-schedule.schema';

@Injectable()
export class StudentDashboardService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(FYPDocument.name) private documentModel: Model<FYPDocumentDocument>,
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
  ) {}

  async getDashboard(studentId: string) {
    // Get student info
    const student = await this.studentModel.findById(studentId);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // A. Group & Membership
    const group = await this.groupModel
      .findOne({
        $or: [{ leader: studentId }, { members: studentId }],
      })
      .populate('leader', 'firstName lastName email rollNumber')
      .populate('members', 'firstName lastName email rollNumber')
      .populate('assignedSupervisor', 'firstName lastName email designation');

    const groupData = group ? {
      groupId: group._id,
      groupName: group.name,
      groupStatus: this.getGroupStatus(group),
      groupMembers: (group.members as any[]).map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        rollNo: m.rollNumber,
      })),
      leader: group.leader ? {
        name: `${(group.leader as any).firstName} ${(group.leader as any).lastName}`,
        email: (group.leader as any).email,
        rollNo: (group.leader as any).rollNumber,
      } : null,
    } : null;

    // B. Supervisor & Project
    const project = group ? await this.projectModel
      .findOne({ group: group._id })
      .populate('supervisor', 'firstName lastName email designation')
      .populate('selectedIdea', 'title description') : null;

    const supervisorData = group?.assignedSupervisor ? {
      name: `${(group.assignedSupervisor as any).firstName} ${(group.assignedSupervisor as any).lastName}`,
      email: (group.assignedSupervisor as any).email,
      designation: (group.assignedSupervisor as any).designation,
    } : null;

    const projectData = project ? {
      title: project.customIdeaTitle || (project.selectedIdea as any)?.title || 'Not Set',
      ideaType: project.selectedIdea ? 'supervisor-list' : project.customIdeaTitle ? 'custom' : null,
      ideaStatus: project.ideaStatus,
      selectedIdeaId: project.selectedIdea || null,
      customIdeaTitle: project.customIdeaTitle || null,
      customIdeaDescription: project.customIdeaDescription || null,
      supervisorFeedback: project.supervisorFeedback || null,
      rejectionReason: project.rejectionReason || null,
    } : null;

    // C. Proposal Status
    const proposal = group ? await this.proposalModel
      .findOne({ group: group._id })
      .sort({ createdAt: -1 }) : null;

    const proposalData = proposal ? {
      proposalStatus: this.getProposalStatus(proposal),
      proposalComments: proposal.supervisorComments || null,
      submittedAt: proposal.submittedAt,
      filePath: proposal.filePath,
      status: proposal.status,
      supervisorFeedback: proposal.supervisorFeedback || null,
      rejectionReason: proposal.rejectionReason || null,
    } : {
      proposalStatus: 'not-submitted',
      proposalComments: null,
      submittedAt: null,
      filePath: null,
      status: null,
      supervisorFeedback: null,
      rejectionReason: null,
    };

    // D. Uploaded Documents
    const documents = group ? await this.documentModel
      .find({ group: group._id })
      .sort({ _id: -1 })
      .limit(10) : [];

    const documentsData = {
      documentsCount: documents.length,
      lastUploadedDocument: documents.length > 0 ? {
        fileName: documents[0].fileName,
        type: documents[0].documentType,
        filePath: documents[0].filePath,
        description: documents[0].description,
      } : null,
      recentDocuments: documents.slice(0, 5).map((doc: any) => ({
        fileName: doc.fileName,
        type: doc.documentType,
        description: doc.description,
      })),
    };

    // E. Supervisor Feedback
    const feedbackData = {
      ideaFeedback: project?.supervisorFeedback || null,
      ideaRejectionReason: project?.rejectionReason || null,
      githubFeedback: project?.githubFeedback || null,
      githubMarks: project?.githubMarks || null,
      finalEvaluationFeedback: project?.finalFeedback || null,
      totalMarks: project?.totalMarks || null,
      proposalMarks: project?.proposalMarks || null,
      implementationMarks: project?.implementationMarks || null,
      documentationMarks: project?.documentationMarks || null,
      presentationMarks: project?.presentationMarks || null,
      isEvaluationComplete: project?.isEvaluationComplete || false,
    };

    // F. Schedule (Demo / Presentation)
    const schedule = group ? await this.scheduleModel
      .findOne({ group: group._id })
      .populate({
        path: 'panel',
        populate: {
          path: 'members',
          select: 'firstName lastName email designation',
        },
      }) : null;

    const scheduleData = schedule ? {
      date: schedule.date,
      timeSlot: schedule.timeSlot,
      room: schedule.room,
      department: schedule.department,
      notes: schedule.notes,
      isCompleted: schedule.isCompleted,
      panelMembers: schedule.panel ? (schedule.panel as any).members.map((m: any) => ({
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        designation: m.designation,
      })) : [],
      panelName: schedule.panel ? (schedule.panel as any).name : null,
    } : null;

    // Return comprehensive dashboard data
    return {
      message: 'Dashboard data retrieved successfully',
      dashboard: {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          rollNumber: student.rollNumber,
          department: student.department,
          isRegisteredForFyp: student.isRegisteredForFYP,
        },
        group: groupData,
        supervisor: supervisorData,
        project: projectData,
        proposal: proposalData,
        documents: documentsData,
        feedback: feedbackData,
        schedule: scheduleData,
      },
    };
  }

  private getGroupStatus(group: any): string {
    if (!group.assignedSupervisor) {
      return 'pending';
    }
    return 'supervisor-assigned';
  }

  private getProposalStatus(proposal: any): string {
    // You can add more logic here based on your proposal schema
    // For now, if proposal exists, it's submitted
    return 'submitted';
  }
}
