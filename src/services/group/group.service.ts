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

    const group = await this.groupModel.create({
      ...dto,
      leader: studentId,
      members: [studentId],
    });

    return {
      message: 'Group created successfully',
      group: await group.populate('leader', 'firstName lastName rollNumber'),
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

    group.members.push(dto.memberId);
    await group.save();

    return {
      message: 'Member added successfully',
      group: await (await group
          .populate('leader', 'firstName lastName rollNumber'))
        .populate('members', 'firstName lastName rollNumber'),
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

    group.members = group.members.filter((id) => id.toString() !== memberId);
    await group.save();

    return {
      message: 'Member removed successfully',
      group: await (await group
          .populate('leader', 'firstName lastName rollNumber'))
        .populate('members', 'firstName lastName rollNumber'),
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

    group.members = group.members.filter((id) => id.toString() !== studentId);
    await group.save();

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
      .populate('project');

    if (!group) {
      throw new NotFoundException('You are not part of any group');
    }

    return group;
  }
}
