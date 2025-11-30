import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Student, StudentDocument } from '../../schema/student.schema';
import { Supervisor, SupervisorDocument } from '../../schema/supervisor.schema';
import { Coordinator, CoordinatorDocument } from '../../schema/coordinator.schema';

import { BCRYPT_SALT_ROUNDS, UserRole } from '../../common/constants/constants';
import { CreateSupervisorDto, LoginDto, SetSupervisorPasswordDto, UpdateSupervisorProfileDto } from 'src/dto/auth.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';


@Injectable()
export class SupervisorAuthService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateSupervisorDto) {
    const [existingStudent, existingSupervisor, existingCoordinator] = await Promise.all([
      this.studentModel.findOne({ email: dto.email }),
      this.supervisorModel.findOne({ email: dto.email }),
      this.coordinatorModel.findOne({ email: dto.email }),
    ]);

    if (existingStudent || existingSupervisor || existingCoordinator) {
      throw new ConflictException('Email already registered');
    }

    const existingEmployeeId = await this.supervisorModel.findOne({ employeeId: dto.employeeId });
    if (existingEmployeeId) {
      throw new ConflictException('Employee ID already exists');
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const supervisor = new this.supervisorModel({
      ...dto,
      password: hashedPassword,
      role: UserRole.SUPERVISOR,
    });

    await supervisor.save();

    return {
      message: 'Supervisor created successfully',
      supervisor: this.sanitizeUser(supervisor),
      temporaryPassword: tempPassword,
    };
  }

  async login(dto: LoginDto) {
    const supervisor = await this.supervisorModel.findOne({ email: dto.email }).select('+password');

    if (!supervisor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, supervisor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(supervisor._id.toString(), supervisor.email, supervisor.role);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(supervisor),
      token,
    };
  }

  async setPassword(supervisorId: string, dto: SetSupervisorPasswordDto) {
    const supervisor = await this.supervisorModel.findById(supervisorId).select('+password');

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, supervisor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.supervisorModel.findByIdAndUpdate(supervisorId, {
      password: hashedPassword,
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async updateProfile(supervisorId: string, dto: UpdateSupervisorProfileDto) {
    const supervisor = await this.supervisorModel.findByIdAndUpdate(
      supervisorId,
      dto,
      { new: true, runValidators: true }
    );

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return {
      message: 'Profile updated successfully',
      supervisor: this.sanitizeUser(supervisor),
    };
  }

  async getProfile(userId: string) {
    const supervisor = await this.supervisorModel
      .findById(userId)
      .populate('assignedStudents');

    if (!supervisor) {
      throw new UnauthorizedException('Supervisor not found');
    }

    return this.sanitizeUser(supervisor);
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = 'Aa1@';
    
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private sanitizeUser(user: any) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}
