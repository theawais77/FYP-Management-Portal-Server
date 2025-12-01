import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Student, StudentSchema } from '../schema/student.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Coordinator, CoordinatorSchema } from '../schema/coordinator.schema';
import { JWT_CONFIG } from '../common/constants/constants';
import { CoordinatorAuthController } from 'src/controllers/auth/coordinator-auth.controller';
import { StudentAuthController } from 'src/controllers/auth/student-auth.controller';
import { SupervisorAuthController } from 'src/controllers/auth/supervisor-auth.controller';
import { CoordinatorAuthService } from 'src/services/auth/coordinator-auth.service';
import { StudentAuthService } from 'src/services/auth/student-auth.service';
import { SupervisorAuthService } from 'src/services/auth/supervisor.auth.service';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_CONFIG.SECRET,
      signOptions: { expiresIn: JWT_CONFIG.EXPIRES_IN },
    }),
  ],
  controllers: [
    StudentAuthController,
    SupervisorAuthController,
    CoordinatorAuthController,
  ],
  providers: [
    StudentAuthService,
    SupervisorAuthService,
    CoordinatorAuthService,
    JwtStrategy,
  ],
  exports: [
    StudentAuthService,
    SupervisorAuthService,
    CoordinatorAuthService,
    JwtStrategy,
  ],
})
export class AuthModule {}
