import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from 'src/common/constants/constants';
import { GetUsersQueryDto } from 'src/dto/user.dto';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
  ) {}

  async getAllUsers(query: GetUsersQueryDto) {
    const { role, department, semester, isActive, search, page = 1, limit = 10 } = query;

    if (!role) {
      throw new BadRequestException('Role parameter is required. Use ?role=student or ?role=supervisor');
    }

    // Validate role is either student or supervisor
    if (role !== UserRole.STUDENT && role !== UserRole.SUPERVISOR) {
      throw new BadRequestException('Role must be either "student" or "supervisor"');
    }

    const skip = (page - 1) * limit;
    let users: any[] = [];
    let total = 0;

    // Build base query
    const baseQuery: any = {};

    if (isActive !== undefined) {
      baseQuery.isActive = isActive;
    }

    if (department) {
      baseQuery.department = department;
    }

    // Add search functionality
    if (search) {
      baseQuery.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    // Query based on role
    if (role === UserRole.STUDENT) {
      // Add semester filter for students
      if (semester) {
        baseQuery.semester = semester;
      }

      // Add rollNumber to search for students
      if (search) {
        baseQuery.$or.push({ rollNumber: new RegExp(search, 'i') });
      }

      [users, total] = await Promise.all([
        this.studentModel
          .find(baseQuery)
          .populate('assignedSupervisor', 'firstName lastName email designation specialization')
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.studentModel.countDocuments(baseQuery),
      ]);
    } else if (role === UserRole.SUPERVISOR) {
      // Add employeeId to search for supervisors
      if (search) {
        baseQuery.$or.push({ employeeId: new RegExp(search, 'i') });
      }

      [users, total] = await Promise.all([
        this.supervisorModel
          .find(baseQuery)
          .populate('assignedStudents', 'firstName lastName email rollNumber')
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.supervisorModel.countDocuments(baseQuery),
      ]);
    }

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersSummary(department?: string) {
    const query: any = {};
    if (department) {
      query.department = department;
    }

    const [
      totalStudents,
      totalSupervisors,
    ] = await Promise.all([
      this.studentModel.countDocuments(query),
      this.studentModel.countDocuments({ ...query }),
      this.supervisorModel.countDocuments(query),
      this.supervisorModel.countDocuments({ ...query }),
    ]);

    return {
      students: {
        total: totalStudents,
      },
      supervisors: {
        total: totalSupervisors,
      },
    };
  }

  async deleteUser(userId: string, role: string) {
    if (!role) {
      throw new BadRequestException('Role parameter is required');
    }

    if (role !== UserRole.STUDENT && role !== UserRole.SUPERVISOR) {
      throw new BadRequestException('Role must be either "student" or "supervisor"');
    }

    let deletedUser;

    if (role === UserRole.STUDENT) {
      const student = await this.studentModel.findById(userId);

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const groupModel = this.studentModel.db.model('Group');
      const isInGroup = await groupModel.findOne({
        $or: [
          { leader: userId },
          { members: userId }
        ]
      });

      if (isInGroup) {
        throw new BadRequestException(
          'Cannot delete student who is part of a group. Remove from group first.'
        );
      }

      deletedUser = await student.deleteOne();
    } else if (role === UserRole.SUPERVISOR) {
      const supervisor = await this.supervisorModel.findById(userId);

      if (!supervisor) {
        throw new NotFoundException('Supervisor not found');
      }

      // Check if supervisor has assigned students
      if (supervisor.assignedStudents && supervisor.assignedStudents.length > 0) {
        throw new BadRequestException(
          'Cannot delete supervisor with assigned students. Reassign students first.'
        );
      }

      // Check if supervisor is assigned to any group
      const groupModel = this.supervisorModel.db.model('Group');
      const assignedGroups = await groupModel.findOne({
        assignedSupervisor: userId
      });

      if (assignedGroups) {
        throw new BadRequestException(
          'Cannot delete supervisor assigned to groups. Reassign groups first.'
        );
      }

      deletedUser = await supervisor.deleteOne();
    }

    return {
      message: `${role === UserRole.STUDENT ? 'Student' : 'Supervisor'} deleted successfully`,
      deletedUser: {
        id: userId,
        role,
      },
    };
  }
}
