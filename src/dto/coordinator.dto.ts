import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSupervisorDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  supervisorId: string;
}

export class UpdateSupervisorAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isAvailableForSupervision: boolean;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  maxStudents?: number;
}

// Evaluation Panel DTOs
export class CreatePanelDto {
  @ApiProperty({ example: 'Panel A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'], description: 'Array of supervisor/faculty IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  members: string[];

  @ApiProperty({ example: 'Evaluation panel for FYP presentations', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePanelDto {
  @ApiProperty({ example: 'Panel A', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Presentation Schedule DTOs
export class CreateScheduleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Group ID' })
  @IsMongoId()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Panel ID' })
  @IsMongoId()
  @IsNotEmpty()
  panelId: string;

  @ApiProperty({ example: '2025-12-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '09:00-09:30' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiProperty({ example: 'Room 301' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Final year project presentation', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateScheduleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439012', required: false })
  @IsMongoId()
  @IsOptional()
  panelId?: string;

  @ApiProperty({ example: '2025-12-15', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: '09:00-09:30', required: false })
  @IsString()
  @IsOptional()
  timeSlot?: string;

  @ApiProperty({ example: 'Room 301', required: false })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ example: 'Updated notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AutoScheduleDto {
  @ApiProperty({ example: '2025-12-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Room 301' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Panel ID' })
  @IsMongoId()
  @IsNotEmpty()
  panelId: string;
}

export class SwapScheduleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'First schedule ID' })
  @IsMongoId()
  @IsNotEmpty()
  scheduleId1: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Second schedule ID' })
  @IsMongoId()
  @IsNotEmpty()
  scheduleId2: string;
}
