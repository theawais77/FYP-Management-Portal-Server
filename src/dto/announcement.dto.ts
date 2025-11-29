import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'FYP Submission Deadline' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'All students must submit their FYP proposals by Dec 15, 2025.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ example: 'FYP Submission Deadline Extended', required: false })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ example: 'Updated announcement content', required: false })
  @IsString()
  @IsNotEmpty()
  content?: string;
}
