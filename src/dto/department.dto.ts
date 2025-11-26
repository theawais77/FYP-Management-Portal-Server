import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Department of Computer Science and Engineering', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Computer Science', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'CS', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Updated department description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddFacultyDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  supervisorId: string;
}