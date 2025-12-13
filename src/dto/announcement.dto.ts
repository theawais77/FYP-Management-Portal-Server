import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementTargetAudience } from '../schema/announcement.schema';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'FYP Submission Deadline' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'All students must submit their FYP proposals by Dec 15, 2025.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    example: AnnouncementTargetAudience.STUDENTS,
    enum: AnnouncementTargetAudience,
    enumName: 'AnnouncementTargetAudience',
    description: 'Target audience: "students" (only students), "supervisors" (only supervisors), or "general" (both students and supervisors)',
    required: true
  })
  @IsEnum(AnnouncementTargetAudience, {
    message: 'targetAudience must be one of: students, supervisors, or general'
  })
  @IsNotEmpty()
  targetAudience: AnnouncementTargetAudience;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ example: 'FYP Submission Deadline Extended', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated announcement content', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ 
    example: AnnouncementTargetAudience.GENERAL,
    enum: AnnouncementTargetAudience,
    enumName: 'AnnouncementTargetAudience',
    required: false,
    description: 'Target audience: "students", "supervisors", or "general" (both)'
  })
  @IsEnum(AnnouncementTargetAudience, {
    message: 'targetAudience must be one of: students, supervisors, or general'
  })
  @IsOptional()
  targetAudience?: AnnouncementTargetAudience;
}
