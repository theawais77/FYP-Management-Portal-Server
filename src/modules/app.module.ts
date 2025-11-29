import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';
import { DepartmentModule } from './department.module';
import { FacultyModule } from './faculty.module';
import { UserModule } from './user.module';
import { AnnouncementModule } from './announcement.module';

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
  ],
  // controllers: [AppController],
  providers: [
    // AppService
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