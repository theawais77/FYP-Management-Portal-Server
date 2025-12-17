import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { CreateGroupDto, AddMemberDto } from 'src/dto/student.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async createGroup(studentId: string, dto: CreateGroupDto) {
    const student = await this.studentModel.findById(studentId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!student.isRegisteredForFYP) {
      throw new BadRequestException('Student must register for FYP first');
    }

    // Check if student is already in a group
    const existingGroup = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (existingGroup) {
      throw new ConflictException('Student is already part of a group');
    }

    // Validate all members if provided
    const allMembers = [studentId];
    
    if (dto.members && dto.members.length > 0) {
      // Check if members exceed limit (max 2 additional members + leader = 3 total)
      if (dto.members.length > 2) {
        throw new BadRequestException('Maximum 2 additional members allowed (3 members total including leader)');
      }

      // Validate each member
      for (const memberId of dto.members) {
        const member = await this.studentModel.findById(memberId);
        
        if (!member) {
          throw new NotFoundException(`Member with ID ${memberId} not found`);
        }

        if (!member.isRegisteredForFYP) {
          throw new BadRequestException(`Member ${member.firstName} ${member.lastName} must be registered for FYP`);
        }

        // Check if member is already in any group
        const memberGroup = await this.groupModel.findOne({
          $or: [{ leader: memberId }, { members: memberId }],
        });

        if (memberGroup) {
          throw new ConflictException(`Member ${member.firstName} ${member.lastName} is already part of a group`);
        }

        allMembers.push(memberId);
      }
    }

    const group = await this.groupModel.create({
      name: dto.groupName,
      leader: studentId,
      members: allMembers,
      department: student.department, // Automatically get department from student
    });

    return {
      message: 'Group created successfully',
      group: await group.populate('leader', 'firstName lastName rollNumber email')
        .then(g => g.populate('members', 'firstName lastName rollNumber email')),
    };
  }

  async addMember(groupId: string, leaderId: string, dto: AddMemberDto) {
    const group = await this.groupModel.findById(groupId);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.leader.toString() !== leaderId) {
      throw new ForbiddenException('Only group leader can add members');
    }

    const member = await this.studentModel.findById(dto.memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (!member.isRegisteredForFYP) {
      throw new BadRequestException('Member must be registered for FYP');
    }

    // Check if member already belongs to any group
    const memberGroup = await this.groupModel.findOne({
      $or: [{ leader: dto.memberId }, { members: dto.memberId }],
    });

    if (memberGroup) {
      throw new ConflictException('Member already belongs to a group');
    }

    if (group.members.includes(dto.memberId)) {
      throw new ConflictException('Member is already in this group');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $push: { members: dto.memberId },
    });

    const updatedGroup = await this.groupModel
      .findById(groupId)
      .populate('leader', 'firstName lastName rollNumber')
      .populate('members', 'firstName lastName rollNumber')
      .select('-isRegisteredForFYP');

    return {
      message: 'Member added successfully',
      group: updatedGroup,
    };
  }

  async removeMember(groupId: string, leaderId: string, memberId: string) {
    const group = await this.groupModel.findById(groupId);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.leader.toString() !== leaderId) {
      throw new ForbiddenException('Only group leader can remove members');
    }

    if (group.leader.toString() === memberId) {
      throw new BadRequestException('Leader cannot be removed. Transfer leadership or delete the group');
    }

    if (!group.members.includes(memberId)) {
      throw new BadRequestException('Member is not in this group');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: { members: memberId },
    });

    const updatedGroup = await this.groupModel
      .findById(groupId)
      .populate('leader', 'firstName lastName rollNumber')
      .populate('members', 'firstName lastName rollNumber')
      .select('-isRegisteredForFYP');

    return {
      message: 'Member removed successfully',
      group: updatedGroup,
    };
  }

  async leaveGroup(groupId: string, studentId: string) {
    const group = await this.groupModel.findById(groupId);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.leader.toString() === studentId) {
      throw new BadRequestException('Leader cannot leave the group. Transfer leadership or delete the group');
    }

    if (!group.members.includes(studentId)) {
      throw new BadRequestException('You are not a member of this group');
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: { members: studentId },
    });

    return {
      message: 'Successfully left the group',
    };
  }

  async getMyGroup(studentId: string) {
    const group = await this.groupModel
      .findOne({
        $or: [{ leader: studentId }, { members: studentId }],
      })
      .populate('leader', 'firstName lastName rollNumber email')
      .populate('members', 'firstName lastName rollNumber email')
      .populate('assignedSupervisor', 'firstName lastName email designation')
      .populate('project')
      .select('-isRegisteredForFYP');

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    return group;
  }
}
