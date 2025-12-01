import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Announcement, AnnouncementSchema } from '../schema/announcement.schema';
import { AnnouncementController } from '../controllers/coordinator/announcement.controller';
import { AnnouncementService } from '../services/announcement/announcement.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
