import { Module } from '@nestjs/common';
// import { AppController } from '../controllers/app.controller';
// import { AppService } from '../services/app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Student, StudentSchema } from '../schema/student.schema';
import { Supervisor, SupervisorSchema } from '../schema/supervisor.schema';
import { Coordinator, CoordinatorSchema } from '../schema/coordinator.schema';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Supervisor.name, schema: SupervisorSchema },
      { name: Coordinator.name, schema: CoordinatorSchema },
    ]),
    AuthModule,
  ],
  // controllers: [AppController],
  providers: [
    // AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}