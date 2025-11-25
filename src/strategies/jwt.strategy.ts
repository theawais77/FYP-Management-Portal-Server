import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JWT_CONFIG, UserRole } from 'src/common/constants/constants';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { Coordinator, CoordinatorDocument } from 'src/schema/coordinator.schema';
import { Student, StudentDocument } from 'src/schema/student.schema';
import { Supervisor, SupervisorDocument } from 'src/schema/supervisor.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    let user;

    switch (payload.role) {
      case UserRole.STUDENT:
        user = await this.studentModel.findById(payload.sub);
        break;
      case UserRole.SUPERVISOR:
        user = await this.supervisorModel.findById(payload.sub);
        break;
      case UserRole.COORDINATOR:
        user = await this.coordinatorModel.findById(payload.sub);
        break;
      default:
        throw new UnauthorizedException('Invalid user role');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
