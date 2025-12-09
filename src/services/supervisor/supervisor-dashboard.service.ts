import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../../schema/group.schema';
import { Project, ProjectDocument } from '../../schema/project.schema';
import { Proposal, ProposalDocument } from '../../schema/proposal.schema';
import { FYPDocument, FYPDocumentDocument } from '../../schema/document.schema';
import { ProjectIdea, ProjectIdeaDocument } from '../../schema/project-idea.schema';
import { PresentationSchedule, PresentationScheduleDocument } from '../../schema/presentation-schedule.schema';

@Injectable()
export class SupervisorDashboardService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(FYPDocument.name) private documentModel: Model<FYPDocumentDocument>,
    @InjectModel(ProjectIdea.name) private projectIdeaModel: Model<ProjectIdeaDocument>,
    @InjectModel(PresentationSchedule.name) private scheduleModel: Model<PresentationScheduleDocument>,
  ) {}

  async getDashboard(supervisorId: string) {
    // A. Assigned Groups Overview
    const assignedGroups = await this.groupModel
      .find({ assignedSupervisor: supervisorId })
      .populate('leader', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .lean();

    // Get projects for each group separately for better data accuracy
    const groupsWithProjects = await Promise.all(
      assignedGroups.map(async (group: any) => {
        let projectTitle = 'No project yet';
        let projectStatus = 'Not started';
        
        // Find project by group ID instead of relying on group.project reference
        const projectData = await this.projectModel
          .findOne({ group: group._id })
          .populate('selectedIdea', 'title')
          .select('customIdeaTitle selectedIdea ideaStatus isEvaluationComplete')
          .lean();
        
        if (projectData) {
          // Get title from either custom idea or selected idea
          if (projectData.customIdeaTitle) {
            projectTitle = projectData.customIdeaTitle;
          } else if ((projectData as any).selectedIdea?.title) {
            projectTitle = (projectData as any).selectedIdea.title;
          }
          
          // Map ideaStatus to display status
          if (projectData.isEvaluationComplete) {
            projectStatus = 'Completed';
          } else {
            switch (projectData.ideaStatus) {
              case 'pending':
                projectStatus = 'Pending Approval';
                break;
              case 'approved':
                projectStatus = 'In Progress';
                break;
              case 'rejected':
                projectStatus = 'Rejected';
                break;
              case 'in_progress':
                projectStatus = 'In Progress';
                break;
              case 'completed':
                projectStatus = 'Completed';
                break;
              default:
                projectStatus = projectData.ideaStatus || 'Not started';
            }
          }
        }
        
        return {
          id: group._id,
          name: group.name,
          leader: {
            id: group.leader?._id,
            name: group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : 'Unknown',
            email: group.leader?.email,
          },
          members: group.members?.map((member: any) => ({
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
          })) || [],
          projectTitle: projectTitle,
          status: projectStatus,
        };
      })
    );

    const groupsOverview = {
      assignedGroupsCount: assignedGroups.length,
      groups: groupsWithProjects,
    };

    // B. Pending Work
    const groupIds = assignedGroups.map(g => g._id);

    // Pending proposals (submitted but not reviewed)
    const pendingProposals = await this.proposalModel.countDocuments({
      group: { $in: groupIds },
      status: 'SUBMITTED',
    });

    // Pending documents (submitted but not reviewed)
    const pendingDocuments = await this.documentModel.countDocuments({
      group: { $in: groupIds },
      status: 'SUBMITTED',
    });

    // Pending custom ideas (requested but not approved/rejected)
    const pendingCustomIdeas = await this.projectModel.countDocuments({
      group: { $in: groupIds },
      isCustomIdea: true,
      customIdeaStatus: 'PENDING',
    });

    // Pending selected ideas (ideas selected but not confirmed)
    const pendingSelectedIdeas = await this.projectModel.countDocuments({
      group: { $in: groupIds },
      isCustomIdea: false,
      status: 'PENDING',
      projectIdea: { $ne: null },
    });

    // Pending final evaluations (projects with GitHub but no final marks)
    const pendingFinalEvaluations = await this.projectModel.countDocuments({
      group: { $in: groupIds },
      'githubSubmission.repositoryUrl': { $exists: true, $ne: null },
      finalMarks: { $exists: false },
    });

    const pendingWork = {
      pendingProposalsCount: pendingProposals,
      pendingDocumentsCount: pendingDocuments,
      pendingCustomIdeasCount: pendingCustomIdeas,
      pendingSelectedIdeasCount: pendingSelectedIdeas,
      pendingFinalEvaluationsCount: pendingFinalEvaluations,
    };

    // C. Recent Student Activity
    const recentDocuments = await this.documentModel
      .find({ group: { $in: groupIds } })
      .sort({ _id: -1 })
      .limit(5)
      .populate('group', 'name')
      .populate({
        path: 'uploadedBy',
        select: 'firstName lastName email',
      })
      .lean();

    const recentProposals = await this.proposalModel
      .find({ group: { $in: groupIds } })
      .sort({ _id: -1 })
      .limit(5)
      .populate('group', 'name')
      .lean();

    const recentGithubSubmissions = await this.projectModel
      .find({ 
        group: { $in: groupIds },
        'githubSubmission.repositoryUrl': { $exists: true, $ne: null }
      })
      .sort({ 'githubSubmission.submittedAt': -1 })
      .limit(5)
      .populate('group', 'name')
      .lean();

    const recentCustomIdeas = await this.projectModel
      .find({ 
        group: { $in: groupIds },
        isCustomIdea: true
      })
      .sort({ _id: -1 })
      .limit(5)
      .populate('group', 'name')
      .lean();

    // Combine and sort all activities by timestamp
    const allActivities: any[] = [];

    recentDocuments.forEach((doc: any) => {
      const studentName = doc.uploadedBy 
        ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` 
        : 'Unknown';
      
      allActivities.push({
        type: 'document_upload',
        groupName: doc.group?.name || 'Unknown',
        studentName: studentName,
        details: `Uploaded document: ${doc.fileName}`,
        timestamp: doc._id.getTimestamp(),
      });
    });

    recentProposals.forEach((prop: any) => {
      allActivities.push({
        type: 'proposal_submission',
        groupName: prop.group?.name || 'Unknown',
        details: `Submitted proposal: ${prop.fileName}`,
        timestamp: prop._id.getTimestamp(),
      });
    });

    recentGithubSubmissions.forEach((proj: any) => {
      allActivities.push({
        type: 'github_submission',
        groupName: proj.group?.name || 'Unknown',
        details: `Submitted GitHub link: ${proj.githubSubmission.repositoryUrl}`,
        timestamp: proj.githubSubmission.submittedAt,
      });
    });

    recentCustomIdeas.forEach((proj: any) => {
      allActivities.push({
        type: 'custom_idea_request',
        groupName: proj.group?.name || 'Unknown',
        details: `Requested custom idea: ${proj.title}`,
        timestamp: proj._id.getTimestamp(),
      });
    });

    // Sort by timestamp descending and take top 10
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const recentActivity = {
      activities: allActivities.slice(0, 10),
    };

    // D. Document Summary
    const totalDocuments = await this.documentModel.countDocuments({
      group: { $in: groupIds },
    });

    const documentsAwaitingReview = await this.documentModel.countDocuments({
      group: { $in: groupIds },
      status: 'SUBMITTED',
    });

    const documentSummary = {
      totalDocumentsReceived: totalDocuments,
      documentsAwaitingReview: documentsAwaitingReview,
    };

    // E. Evaluations
    const projectsNeedingGithubEvaluation = await this.projectModel.countDocuments({
      group: { $in: groupIds },
      'githubSubmission.repositoryUrl': { $exists: true, $ne: null },
      $or: [
        { 'githubSubmission.marks': { $exists: false } },
        { 'githubSubmission.marks': null },
      ],
    });

    const projectsNeedingFinalEvaluation = await this.projectModel.countDocuments({
      group: { $in: groupIds },
      status: 'COMPLETED',
      finalMarks: { $exists: false },
    });

    const evaluations = {
      projectsNeedingGitHubEvaluation: projectsNeedingGithubEvaluation,
      projectsNeedingFinalEvaluation: projectsNeedingFinalEvaluation,
    };

    // F. Personal Project Ideas
    const totalIdeas = await this.projectIdeaModel.countDocuments({
      supervisor: supervisorId,
    });

    const activeIdeas = await this.projectIdeaModel.countDocuments({
      supervisor: supervisorId,
      isAvailable: true,
    });

    const selectedIdeas = await this.projectModel.countDocuments({
      selectedIdea: { $ne: null },
      supervisor: supervisorId,
    });

    const personalProjectIdeas = {
      totalIdeasCreated: totalIdeas,
      activeIdeas: activeIdeas,
      ideasSelected: selectedIdeas,
    };

    return {
      assignedGroups: groupsOverview,
      pendingWork: pendingWork,
      recentActivity: recentActivity,
      documentSummary: documentSummary,
      evaluations: evaluations,
      personalProjectIdeas: personalProjectIdeas,
    };
  }
}
