import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';
import { Department, DepartmentDocument } from 'src/schema/department.schema';
import { RegisterFYPDto } from 'src/dto/student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async registerForFYP(studentId: string, dto: RegisterFYPDto) {
    const student = await this.studentModel.findById(studentId);

    if (!student) {
      throw new NotFoundException(`Student not found with ID: ${studentId}. Please ensure you are logged in with a student account.`);
    }

    if (student.isRegisteredForFYP) {
      throw new ConflictException('Student is already registered for FYP');
    }

    // Validate department ID
    const department = await this.departmentModel.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundException('Department not found with the provided ID');
    }

    // Check if student is already in a group
    const existingGroup = await this.groupModel.findOne({
      $or: [{ leader: studentId }, { members: studentId }],
    });

    if (existingGroup) {
      throw new ConflictException('Student is already part of a group');
    }

    student.isRegisteredForFYP = true;
    student.department = department.name; 
    await student.save();

    return {
      message: 'Successfully registered for FYP',
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        department: student.department,
        isRegisteredForFYP: student.isRegisteredForFYP,
      },
    };
  }

  async getMyProfile(studentId: string) {
    const student = await this.studentModel
      .findById(studentId)
      .populate('assignedSupervisor', 'firstName lastName email designation');

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const group = await this.groupModel
      .findOne({
        $or: [{ leader: studentId }, { members: studentId }],
      })
      .populate('leader', 'firstName lastName rollNumber')
      .populate('members', 'firstName lastName rollNumber')
      .populate('assignedSupervisor', 'firstName lastName email designation maxStudents currentStudentCount')
      .select('-isRegisteredForFYP');

    return {
      student: student.toObject(),
      group: group ? group.toObject() : null,
    };
  }

  async getAllDepartments() {
    const departments = await this.departmentModel
      .find()
      .select('_id name code description')
      .sort({ name: 1 });

    return {
      message: 'Departments retrieved successfully',
      departments: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
      })),
    };
  }
}
