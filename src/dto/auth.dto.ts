import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../common/constants/constants';

export class LoginDto {
  @ApiProperty({ example: 'coordinator@university.edu' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Coordinator@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StudentRegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@university.edu' })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/@university\.edu$/, { message: 'Must use university email' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;

  @ApiProperty({ example: '2021-CS-001' })
  @IsString()
  @IsNotEmpty()
  rollNumber: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: '8' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ example: 'BS Computer Science' })
  @IsString()
  @IsNotEmpty()
  program: string;

  @ApiProperty({ example: '03001234567', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 3.5, required: false })
  @IsNumber()
  @IsOptional()
  cgpa?: number;
}

export class CreateSupervisorDto {
  @ApiProperty({ example: 'Dr. Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'jane.smith@university.edu' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'EMP-001' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'Associate Professor' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Machine Learning', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: ['AI', 'Deep Learning'], required: false })
  @IsOptional()
  researchInterests?: string[];

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({ example: 'Room 301', required: false })
  @IsString()
  @IsOptional()
  officeLocation?: string;

  @ApiProperty({ example: 'Mon-Fri 2-4 PM', required: false })
  @IsString()
  @IsOptional()
  officeHours?: string;

  @ApiProperty({ example: '03001234567', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateSupervisorProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  researchInterests?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  officeLocation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  officeHours?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class SetSupervisorPasswordDto {
  @ApiProperty({ example: 'TempPassword123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  newPassword: string;
}
