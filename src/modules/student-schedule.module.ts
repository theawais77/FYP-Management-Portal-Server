import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresentationSchedule, PresentationScheduleSchema } from '../schema/presentation-schedule.schema';
import { Group, GroupSchema } from '../schema/group.schema';
import { StudentScheduleController } from '../controllers/student/student-schedule.controller';
import { StudentScheduleService } from '../services/student/student-schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PresentationSchedule.name, schema: PresentationScheduleSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [StudentScheduleController],
  providers: [StudentScheduleService],
  exports: [StudentScheduleService],
})
export class StudentScheduleModule {}
