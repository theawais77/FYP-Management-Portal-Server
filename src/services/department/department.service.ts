import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDepartmentDto, UpdateDepartmentDto } from 'src/dto/department.dto';
import { Department, DepartmentDocument } from 'src/schema/department.schema';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';
import { Group, GroupDocument } from 'src/schema/group.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(dto: CreateDepartmentDto, coordinatorId: string) {
    const existingName = await this.departmentModel.findOne({ 
      name: new RegExp(`^${dto.name}$`, 'i') // case-insensitive
    });
    if (existingName) {
      throw new ConflictException('Department name already exists');
    }

    const existingCode = await this.departmentModel.findOne({ 
      code: dto.code.toUpperCase() 
    });
    if (existingCode) {
      throw new ConflictException('Department code already exists');
    }

    const department = await this.departmentModel.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });

    return {
      message: 'Department created successfully',
      department,
    };
  }

  async findAll() {
    const query: any = {};

    const departments = await this.departmentModel
      .find(query)
      .sort({ createdAt: -1 });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await this.supervisorModel.countDocuments({ 
          _id: { $in: dept.facultyList } 
        });
        const studentCount = await this.studentModel.countDocuments({ 
          department: dept.name 
        });

        return {
          ...dept.toObject(),
          totalFaculty: facultyCount,
          totalStudents: studentCount,
        };
      })
    );

    return departmentsWithCounts;
  }

  async findOne(id: string) {
    const department = await this.departmentModel
      .findById(id)
      .populate('facultyList', 'firstName lastName email designation specialization maxStudents currentStudentCount');

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const studentCount = await this.studentModel.countDocuments({ 
      department: department.name 
    });

    return {
      ...department.toObject(),
      totalStudents: studentCount,
    };
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (dto.name && dto.name !== department.name) {
      const existingName = await this.departmentModel.findOne({ 
        name: new RegExp(`^${dto.name}$`, 'i'),
        _id: { $ne: id }
      });
      if (existingName) {
        throw new ConflictException('Department name already exists');
      }
    }

    // Check if new code conflicts
    if (dto.code && dto.code.toUpperCase() !== department.code) {
      const existingCode = await this.departmentModel.findOne({ 
        code: dto.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCode) {
        throw new ConflictException('Department code already exists');
      }
    }

    Object.assign(department, {
      ...dto,
      code: dto.code ? dto.code.toUpperCase() : department.code,
    });

    await department.save();

    return {
      message: 'Department updated successfully',
      department,
    };
  }

  async remove(id: string) {
    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department has faculty
    if (department.facultyList.length > 0) {
      throw new BadRequestException(
        'Cannot delete department with assigned faculty. Please remove all faculty first.'
      );
    }

    // Check if department has students
    const studentCount = await this.studentModel.countDocuments({ 
      department: department.name 
    });
    if (studentCount > 0) {
      throw new BadRequestException(
        'Cannot delete department with registered students. Please reassign or remove students first.'
      );
    }

    await department.deleteOne();

    return {
      message: 'Department deleted successfully',
    };
  }

  async getStatistics(id: string) {
    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const [totalFaculty, totalStudents, availableFaculty] = await Promise.all([
      this.supervisorModel.countDocuments({ _id: { $in: department.facultyList } }),
      this.studentModel.countDocuments({ department: department.name }),
      this.supervisorModel.countDocuments({ 
        _id: { $in: department.facultyList },
        isAvailableForSupervision: true 
      }),
    ]);

    // Count groups with and without supervisors
    const [groupsWithSupervisor, groupsWithoutSupervisor] = await Promise.all([
      this.groupModel.countDocuments({
        department: department.name,
        assignedSupervisor: { $exists: true, $ne: null },
      }),
      this.groupModel.countDocuments({
        department: department.name,
        $or: [
          { assignedSupervisor: { $exists: false } },
          { assignedSupervisor: null }
        ],
      }),
    ]);

    return {
      departmentName: department.name,
      departmentCode: department.code,
      totalFaculty,
      totalStudents,
      availableFaculty,
      groupsWithSupervisor,
      groupsWithoutSupervisor,
    };
  }
}