import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { DepartmentModule } from './department.module';
import { FacultyModule } from './faculty.module';
import { UserModule } from './user.module';
import { AnnouncementModule } from './announcement.module';
import { StudentModule } from './student.module';
import { GroupModule } from './group.module';
import { ProjectModule } from './project.module';
import { ProposalModule } from './proposal.module';
import { CoordinatorModule } from './coordinator.module';
import { SupervisorModule } from './supervisor.module';
import { EvaluationPanelModule } from './evaluation-panel.module';
import { PresentationScheduleModule } from './presentation-schedule.module';
import { StudentScheduleModule } from './student-schedule.module';
import { SupervisorScheduleModule } from './supervisor-schedule.module';
import { StudentDashboardModule } from './student-dashboard.module';
import { AppController } from 'src/controllers/app.controller';
import { AppService } from 'src/services/app.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    AuthModule,
    DepartmentModule,
    FacultyModule,
    UserModule,
    AnnouncementModule,
    StudentModule,
    GroupModule,
    ProjectModule,
    ProposalModule,
    CoordinatorModule,
    SupervisorModule,
    EvaluationPanelModule,
    PresentationScheduleModule,
    StudentScheduleModule,
    SupervisorScheduleModule,
    StudentDashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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