import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from 'src/schema/department.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
  ) {}

  async getFacultyList(departmentId: string, filters?: {
    isAvailable?: boolean;
    specialization?: string;
  }) {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const query: any = { _id: { $in: department.facultyList } };

    if (filters?.isAvailable !== undefined) {
      query.isAvailableForSupervision = filters.isAvailable;
    }

    if (filters?.specialization) {
      query.specialization = new RegExp(filters.specialization, 'i');
    }

    const faculty = await this.supervisorModel
      .find(query)
      .populate({
        path: 'assignedGroups',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber' },
          { path: 'members', select: 'firstName lastName email rollNumber' }
        ]
      })
      .select('-assignedStudents')
      .sort({ firstName: 1 });

    return {
      departmentName: department.name,
      departmentCode: department.code,
      totalFaculty: faculty.length,
      faculty,
    };
  }

  async addFaculty(departmentId: string, supervisorId: string) {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Check if supervisor is already in this department
    if (department.facultyList.includes(supervisorId)) {
      throw new ConflictException('Supervisor is already assigned to this department');
    }

    // Add supervisor to department's faculty list
    department.facultyList.push(supervisorId);
    department.totalFaculty = department.facultyList.length;
    await department.save();

    return {
      message: 'Faculty member added to department successfully',
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },
      supervisor: {
        id: supervisor._id,
        name: `${supervisor.firstName} ${supervisor.lastName}`,
        designation: supervisor.designation,
      },
    };
  }

  async removeFaculty(departmentId: string, supervisorId: string) {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const supervisor = await this.supervisorModel.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Check if supervisor is in this department
    if (!department.facultyList.includes(supervisorId)) {
      throw new BadRequestException('Supervisor is not assigned to this department');
    }

    // Check if supervisor has assigned groups
    const groupModel = this.supervisorModel.db.model('Group');
    const assignedGroups = await groupModel.findOne({
      assignedSupervisor: supervisorId
    });

    if (assignedGroups) {
      throw new BadRequestException(
        'Cannot remove faculty member with assigned groups. Please reassign groups first.'
      );
    }

    // Remove supervisor from department's faculty list
    department.facultyList = department.facultyList.filter(
      (id) => id.toString() !== supervisorId
    );
    department.totalFaculty = department.facultyList.length;
    await department.save();

    return {
      message: 'Faculty member removed from department successfully',
    };
  }

  async getFacultyDetails(departmentId: string, facultyId: string) {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.facultyList.includes(facultyId)) {
      throw new BadRequestException('Faculty member not found in this department');
    }

    const supervisor = await this.supervisorModel
      .findById(facultyId)
      .populate({
        path: 'assignedGroups',
        populate: [
          { path: 'leader', select: 'firstName lastName email rollNumber department semester' },
          { path: 'members', select: 'firstName lastName email rollNumber department semester' }
        ]
      })
      .select('-assignedStudents');

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return {
      departmentName: department.name,
      supervisor: {
        ...supervisor.toObject(),
        availableSlots: supervisor.maxStudents - supervisor.currentStudentCount,
      },
    };
  }

  async getAvailableSupervisors() {
    const departments = await this.departmentModel.find();
    const assignedSupervisorIds = departments.flatMap(dept => dept.facultyList);

    const availableSupervisors = await this.supervisorModel
      .find({ _id: { $nin: assignedSupervisorIds } })
      .sort({ firstName: 1 });

    return {
      total: availableSupervisors.length,
      supervisors: availableSupervisors,
    };
  }

  async transferFaculty(
    fromDepartmentId: string, 
    toDepartmentId: string, 
    supervisorId: string
  ) {
    const [fromDepartment, toDepartment, supervisor] = await Promise.all([
      this.departmentModel.findById(fromDepartmentId),
      this.departmentModel.findById(toDepartmentId),
      this.supervisorModel.findById(supervisorId),
    ]);

    if (!fromDepartment) {
      throw new NotFoundException('Source department not found');
    }

    if (!toDepartment) {
      throw new NotFoundException('Target department not found');
    }

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Check if supervisor is in source department
    if (!fromDepartment.facultyList.includes(supervisorId)) {
      throw new BadRequestException('Supervisor is not in the source department');
    }

    // Check if supervisor is already in target department
    if (toDepartment.facultyList.includes(supervisorId)) {
      throw new ConflictException('Supervisor is already in the target department');
    }

    // Remove from source department
    fromDepartment.facultyList = fromDepartment.facultyList.filter(
      (id) => id.toString() !== supervisorId
    );
    fromDepartment.totalFaculty = fromDepartment.facultyList.length;

    // Add to target department
    toDepartment.facultyList.push(supervisorId);
    toDepartment.totalFaculty = toDepartment.facultyList.length;

    await Promise.all([fromDepartment.save(), toDepartment.save()]);

    return {
      message: 'Faculty member transferred successfully',
      from: {
        id: fromDepartment._id,
        name: fromDepartment.name,
      },
      to: {
        id: toDepartment._id,
        name: toDepartment.name,
      },
      supervisor: {
        id: supervisor._id,
        name: `${supervisor.firstName} ${supervisor.lastName}`,
      },
    };
  }

  async getFacultyStatistics(departmentId: string) {
    const department = await this.departmentModel.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const facultyList = await this.supervisorModel.find({ 
      _id: { $in: department.facultyList } 
    });

    const totalFaculty = facultyList.length;
    const availableFaculty = facultyList.filter(f => f.isAvailableForSupervision).length;
    const totalCapacity = facultyList.reduce((sum, f) => sum + f.maxStudents, 0);
    const currentLoad = facultyList.reduce((sum, f) => sum + f.currentStudentCount, 0);
    const availableSlots = totalCapacity - currentLoad;

    return {
      departmentName: department.name,
      departmentCode: department.code,
      totalFaculty,
      availableFaculty,
      fullyOccupiedFaculty: totalFaculty - availableFaculty,
      totalCapacity,
      currentLoad,
      availableSlots,
      utilizationPercentage: totalCapacity > 0 
        ? ((currentLoad / totalCapacity) * 100).toFixed(2) 
        : 0,
    };
  }
}