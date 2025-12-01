import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFYPDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Department ID' })
  @IsMongoId()
  @IsNotEmpty()
  departmentId: string;
}

export class CreateGroupDto {
  @ApiProperty({ example: 'Team Alpha' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;
}

export class AddMemberDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  memberId: string;
}

export class SelectIdeaDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  ideaId: string;
}

export class RequestCustomIdeaDto {
  @ApiProperty({ example: 'AI-Based Attendance System' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A comprehensive attendance tracking system using facial recognition' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class SubmitProposalDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}

export class UploadDocumentDto {
  @ApiProperty({ example: 'proposal', enum: ['proposal', 'presentation', 'report', 'other'] })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ example: 'Final project report', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
