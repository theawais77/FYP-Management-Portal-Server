import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Student, StudentDocument } from '../../schema/student.schema';
import { Supervisor, SupervisorDocument } from '../../schema/supervisor.schema';
import { Coordinator, CoordinatorDocument } from '../../schema/coordinator.schema';
import { BCRYPT_SALT_ROUNDS, UserRole } from '../../common/constants/constants';
import { StudentRegisterDto, LoginDto } from 'src/dto/auth.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

@Injectable()
export class StudentAuthService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: StudentRegisterDto) {
    const [existingStudent, existingSupervisor, existingCoordinator] = await Promise.all([
      this.studentModel.findOne({ email: dto.email }),
      this.supervisorModel.findOne({ email: dto.email }),
      this.coordinatorModel.findOne({ email: dto.email }),
    ]);

    if (existingStudent || existingSupervisor || existingCoordinator) {
      throw new ConflictException('Email already registered');
    }

    const existingRollNumber = await this.studentModel.findOne({ rollNumber: dto.rollNumber });
    if (existingRollNumber) {
      throw new ConflictException('Roll number already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const student = new this.studentModel({
      ...dto,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    await student.save();

    const token = this.generateToken(student._id.toString(), student.email, student.role);

    return {
      message: 'Student registered successfully',
      user: this.sanitizeUser(student),
      token,
    };
  }

  async login(dto: LoginDto) {
    const student = await this.studentModel.findOne({ email: dto.email }).select('+password');

    if (!student) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, student.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(student._id.toString(), student.email, student.role);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(student),
      token,
    };
  }

  async getProfile(userId: string) {
    const student = await this.studentModel
      .findById(userId)
      .populate('assignedSupervisor')
      .populate('currentProject');

    if (!student) {
      throw new UnauthorizedException('Student not found');
    }

    return this.sanitizeUser(student);
  }

  async searchStudents(search: string) {
    if (!search || search.trim().length < 2) {
      return {
        message: 'Please enter at least 2 characters to search',
        students: [],
      };
    }

    const searchRegex = new RegExp(search, 'i');
    
    const students = await this.studentModel
      .find({
        $and: [
          { isRegisteredForFYP: true },
          {
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { email: searchRegex },
              { rollNumber: searchRegex },
            ],
          },
        ],
      })
      .select('firstName lastName email rollNumber department')
      .limit(10);

    return {
      message: 'Search results retrieved successfully',
      students,
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