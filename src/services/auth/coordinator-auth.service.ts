import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Coordinator, CoordinatorDocument } from '../../schema/coordinator.schema';
import { Department, DepartmentDocument } from '../../schema/department.schema';
import { Student, StudentDocument } from '../../schema/student.schema';
import { UserRole, BCRYPT_SALT_ROUNDS } from '../../common/constants/constants';
import { LoginDto, CreateCoordinatorDto } from 'src/dto/auth.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

@Injectable()
export class CoordinatorAuthService {
  constructor(
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const coordinator = await this.coordinatorModel.findOne({ email: dto.email }).select('+password');

    if (!coordinator) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, coordinator.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(coordinator._id.toString(), coordinator.email, coordinator.role);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(coordinator),
      token,
    };
  }

  async getProfile(userId: string) {
    const coordinator = await this.coordinatorModel.findById(userId).populate('department');

    if (!coordinator) {
      throw new UnauthorizedException('Coordinator not found');
    }

    // Calculate actual student count for the department
    const coordinatorObj = coordinator.toObject();
    if (coordinatorObj.department) {
      const departmentName = (coordinatorObj.department as any).name;
      const actualStudentCount = await this.studentModel.countDocuments({ 
        department: departmentName 
      });
      
    // Update the totalStudents field with actual count
      (coordinatorObj.department as any).totalStudents = actualStudentCount;
    }

    const { password, ...coordinatorWithoutPassword } = coordinatorObj;
    return coordinatorWithoutPassword;
  }

  async register(dto: CreateCoordinatorDto) {
    // Check if coordinator with email already exists
    const existingCoordinator = await this.coordinatorModel.findOne({ email: dto.email });
    if (existingCoordinator) {
      throw new ConflictException('Coordinator with this email already exists');
    }

    // Check if coordinator ID already exists
    const existingCoordinatorId = await this.coordinatorModel.findOne({ coordinatorId: dto.coordinatorId });
    if (existingCoordinatorId) {
      throw new ConflictException('Coordinator ID already exists');
    }

    // Verify department exists
    const department = await this.departmentModel.findById(dto.department);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department already has a coordinator
    if (department.coordinator) {
      throw new ConflictException('This department already has a coordinator assigned');
    }

    // Generate a temporary password
    const tempPassword = `Coord${Math.random().toString(36).slice(-8)}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const coordinator = await this.coordinatorModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      coordinatorId: dto.coordinatorId,
      department: dto.department,
      designation: dto.designation,
      officeAddress: dto.officeAddress,
      phoneNumber: dto.phoneNumber,
    });

    // Update department with coordinator reference
    await this.departmentModel.findByIdAndUpdate(dto.department, {
      coordinator: coordinator._id,
    });

    return {
      message: 'Coordinator registered successfully',
      coordinator: this.sanitizeUser(coordinator),
      tempPassword, // Send this securely to the coordinator
    };
  }

  async deleteCoordinator(coordinatorId: string) {
    const coordinator = await this.coordinatorModel.findById(coordinatorId);

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const departmentId = coordinator.department;

    // Remove coordinator reference from department
    await this.departmentModel.findByIdAndUpdate(departmentId, {
      $unset: { coordinator: '' },
    });

    // Delete the coordinator
    await this.coordinatorModel.findByIdAndDelete(coordinatorId);

    return {
      message: 'Coordinator deleted successfully',
      deletedCoordinator: {
        id: coordinator._id,
        email: coordinator.email,
        coordinatorId: coordinator.coordinatorId,
      },
    };
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}