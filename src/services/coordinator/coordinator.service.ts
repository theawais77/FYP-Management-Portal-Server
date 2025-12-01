import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { Project, ProjectDocument } from 'src/schema/project.schema';
import { Proposal, ProposalDocument } from 'src/schema/proposal.schema';
import { UpdateSupervisorAvailabilityDto } from 'src/dto/coordinator.dto';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
  ) {}

  async getAllGroups(department?: string) {
    const query: any = {};
    
    if (department) {
      query.department = department;
    }

    const groups = await this.groupModel
      .find(query)
      .populate('leader', 'firstName lastName email rollNumber')
      .populate('members', 'firstName lastName email rollNumber')
      .populate('assignedSupervisor', 'firstName lastName email designation')
      .sort({ createdAt: -1 });

    return groups;
  }

  async getGroupById(groupId: string) {
    const group = await this.groupModel
      .findById(groupId)
      .populate('leader', 'firstName lastName email rollNumber department')
      .populate('members', 'firstName lastName email rollNumber department')
      .populate('assignedSupervisor', 'firstName lastName email designation specialization');

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Get project details for this group
    const project = await this.projectModel
      .findOne({ group: groupId })
      .populate('selectedIdea')
      .populate('supervisor', 'firstName lastName email');

    return {
      ...group.toObject(),
      project,
    };
  }

  async getGroupsWithoutSupervisor(department?: string) {
    const query: any = { assignedSupervisor: null };
    
    if (department) {
      query.department = department;
    }

    const groups = await this.groupModel
      .find(query)
      .populate('leader', 'firstName lastName email rollNumber')
      .populate('members', 'firstName lastName email rollNumber')
      .sort({ createdAt: -1 });

    return {
      total: groups.length,
      groups,
    };
  }

  async assignSupervisorToGroup(groupId: string, supervisorId: string) {
    const [group, supervisor] = await Promise.all([
      this.groupModel.findById(groupId),
      this.supervisorModel.findById(supervisorId),
    ]);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    if (!supervisor.isAvailableForSupervision) {
      throw new BadRequestException('Supervisor is not available for supervision');
    }

    if (supervisor.currentStudentCount >= supervisor.maxStudents) {
      throw new BadRequestException('Supervisor has reached maximum student capacity');
    }

    if (group.assignedSupervisor) {
      throw new BadRequestException('Group already has a supervisor assigned. Use change-supervisor endpoint.');
    }

    // Assign supervisor to group
    await this.groupModel.findByIdAndUpdate(groupId, {
      assignedSupervisor: supervisorId,
    });

    // Update supervisor's student count
    const groupSize = 1 + (group.members?.length || 0);
    const newStudentCount = supervisor.currentStudentCount + groupSize;
    
    await this.supervisorModel.findByIdAndUpdate(supervisorId, {
      currentStudentCount: newStudentCount,
      isAvailableForSupervision: newStudentCount < supervisor.maxStudents,
    });

    // Create or update project
    let project = await this.projectModel.findOne({ group: groupId });
    
    if (!project) {
      project = await this.projectModel.create({
        group: groupId,
        supervisor: supervisorId,
        department: group.department,
      });
    } else {
      await this.projectModel.findByIdAndUpdate(project._id, {
        supervisor: supervisorId,
      });
    }

    return {
      message: 'Supervisor assigned to group successfully',
      group: await this.groupModel
        .findById(groupId)
        .populate('leader', 'firstName lastName email')
        .populate('assignedSupervisor', 'firstName lastName email designation'),
    };
  }

  async changeSupervisor(groupId: string, newSupervisorId: string) {
    const [group, newSupervisor] = await Promise.all([
      this.groupModel.findById(groupId),
      this.supervisorModel.findById(newSupervisorId),
    ]);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (!newSupervisor) {
      throw new NotFoundException('New supervisor not found');
    }

    if (!group.assignedSupervisor) {
      throw new BadRequestException('Group has no supervisor assigned. Use assign-supervisor endpoint.');
    }

    if (!newSupervisor.isAvailableForSupervision) {
      throw new BadRequestException('New supervisor is not available for supervision');
    }

    if (newSupervisor.currentStudentCount >= newSupervisor.maxStudents) {
      throw new BadRequestException('New supervisor has reached maximum student capacity');
    }

    const oldSupervisorId = group.assignedSupervisor.toString();
    
    if (oldSupervisorId === newSupervisorId) {
      throw new BadRequestException('New supervisor is the same as current supervisor');
    }

    // Update old supervisor's count
    const oldSupervisor = await this.supervisorModel.findById(oldSupervisorId);
    if (oldSupervisor) {
      const groupSize = 1 + (group.members?.length || 0);
      const newOldCount = Math.max(0, oldSupervisor.currentStudentCount - groupSize);
      
      await this.supervisorModel.findByIdAndUpdate(oldSupervisorId, {
        currentStudentCount: newOldCount,
        isAvailableForSupervision: newOldCount < oldSupervisor.maxStudents,
      });
    }

    // Update new supervisor's count
    const groupSize = 1 + (group.members?.length || 0);
    const newSupervisorCount = newSupervisor.currentStudentCount + groupSize;
    
    await this.supervisorModel.findByIdAndUpdate(newSupervisorId, {
      currentStudentCount: newSupervisorCount,
      isAvailableForSupervision: newSupervisorCount < newSupervisor.maxStudents,
    });

    // Update group
    await this.groupModel.findByIdAndUpdate(groupId, {
      assignedSupervisor: newSupervisorId,
    });

    // Update project
    await this.projectModel.findOneAndUpdate(
      { group: groupId },
      {
        supervisor: newSupervisorId,
        $unset: {
          selectedIdea: '',
          customIdeaTitle: '',
          customIdeaDescription: '',
        },
      }
    );

    return {
      message: 'Supervisor changed successfully',
      group: await this.groupModel
        .findById(groupId)
        .populate('leader', 'firstName lastName email')
        .populate('assignedSupervisor', 'firstName lastName email designation'),
    };
  }


  async getAllSupervisors(department?: string) {
    const query: any = {};
    
    if (department) {
      query.department = department;
    }

    const supervisors = await this.supervisorModel
      .find(query)
      .populate('assignedStudents', 'firstName lastName email rollNumber')
      .sort({ firstName: 1 });

    return supervisors.map(supervisor => ({
      ...supervisor.toObject(),
      availableSlots: supervisor.maxStudents - supervisor.currentStudentCount,
    }));
  }

  async getSupervisorAvailability(department?: string) {
    const query: any = {};
    
    if (department) {
      query.department = department;
    }

    const supervisors = await this.supervisorModel
      .find(query)
      .select('firstName lastName email designation maxStudents currentStudentCount isAvailableForSupervision')
      .sort({ isAvailableForSupervision: -1, firstName: 1 });

    return supervisors.map(supervisor => ({
      id: supervisor._id,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      email: supervisor.email,
      designation: supervisor.designation,
      maxStudents: supervisor.maxStudents,
      currentStudentCount: supervisor.currentStudentCount,
      availableSlots: supervisor.maxStudents - supervisor.currentStudentCount,
      isAvailableForSupervision: supervisor.isAvailableForSupervision,
    }));
  }

  async updateSupervisorAvailability(supervisorId: string, dto: UpdateSupervisorAvailabilityDto) {
    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    if (dto.maxStudents !== undefined) {
      if (dto.maxStudents < supervisor.currentStudentCount) {
        throw new BadRequestException(
          `Cannot set max students below current count (${supervisor.currentStudentCount})`
        );
      }
    }

    const maxStudents = dto.maxStudents ?? supervisor.maxStudents;
    const isAvailable = supervisor.currentStudentCount >= maxStudents 
      ? false 
      : dto.isAvailableForSupervision;

    await this.supervisorModel.findByIdAndUpdate(supervisorId, {
      ...(dto.maxStudents !== undefined && { maxStudents: dto.maxStudents }),
      isAvailableForSupervision: isAvailable,
    }, { new: true });

    return {
      message: 'Supervisor availability updated successfully',
      supervisor: {
        id: supervisor._id,
        name: `${supervisor.firstName} ${supervisor.lastName}`,
        email: supervisor.email,
        maxStudents: supervisor.maxStudents,
        currentStudentCount: supervisor.currentStudentCount,
        availableSlots: supervisor.maxStudents - supervisor.currentStudentCount,
        isAvailableForSupervision: supervisor.isAvailableForSupervision,
      },
    };
  }

  async getAllProjects(department?: string) {
    const query: any = {};

    const projects = await this.projectModel
      .find(query)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber department' },
          { path: 'members', select: 'firstName lastName email rollNumber department' },
        ],
      })
      .populate('supervisor', 'firstName lastName email designation')
      .populate('selectedIdea')
      .sort({ createdAt: -1 });

    // Filter by department if provided
    const filteredProjects = department
      ? projects.filter((p: any) => p.group?.department === department)
      : projects;

    return filteredProjects;
  }

  async getProjectById(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate({
        path: 'group',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber department' },
          { path: 'members', select: 'firstName lastName email rollNumber department' },
        ],
      })
      .populate('supervisor', 'firstName lastName email designation specialization')
      .populate('selectedIdea');

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get proposals for this project
    const proposals = await this.proposalModel
      .find({ project: projectId })
      .sort({ submittedAt: -1 });

    return {
      ...project.toObject(),
      proposals,
    };
  }

  async getAllProposals(department?: string) {
    const proposals = await this.proposalModel
      .find()
      .populate({
        path: 'project',
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber department' },
              { path: 'members', select: 'firstName lastName email rollNumber department' },
            ],
          },
          { path: 'supervisor', select: 'firstName lastName email designation' },
        ],
      })
      .sort({ submittedAt: -1 });

    // Filter by department if provided
    const filteredProposals = department
      ? proposals.filter((p: any) => p.project?.group?.department === department)
      : proposals;

    return filteredProposals;
  }

  async getProposalById(proposalId: string) {
    const proposal = await this.proposalModel
      .findById(proposalId)
      .populate({
        path: 'project',
        populate: [
          {
            path: 'group',
            populate: [
              { path: 'leader', select: 'firstName lastName email rollNumber department' },
              { path: 'members', select: 'firstName lastName email rollNumber department' },
            ],
          },
          { path: 'supervisor', select: 'firstName lastName email designation' },
          { path: 'selectedIdea' },
        ],
      });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }
}
