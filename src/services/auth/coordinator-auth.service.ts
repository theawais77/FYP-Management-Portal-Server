import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Coordinator, CoordinatorDocument } from '../../schema/coordinator.schema';
import { UserRole } from '../../common/constants/constants';
import { LoginDto } from 'src/dto/auth.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

@Injectable()
export class CoordinatorAuthService {
  constructor(
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
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
    const coordinator = await this.coordinatorModel.findById(userId);

    if (!coordinator) {
      throw new UnauthorizedException('Coordinator not found');
    }

    return this.sanitizeUser(coordinator);
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