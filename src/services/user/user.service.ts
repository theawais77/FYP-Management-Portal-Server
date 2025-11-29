import {
  Injectable,
  BadRequestException,
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
      activeStudents,
      totalSupervisors,
      activeSupervisors,
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
}