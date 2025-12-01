import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AppController } from 'src/controllers/app.controller';
import { AppService } from 'src/services/app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}