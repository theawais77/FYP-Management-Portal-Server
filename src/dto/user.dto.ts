import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../common/constants/constants';

export class GetUsersQueryDto {
  @ApiProperty({ 
    enum: UserRole,
    required: true,
    example: UserRole.STUDENT,
    description: 'Filter users by role (student or supervisor)'
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    required: false, 
    example: 'Computer Science',
    description: 'Filter by department'
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ 
    required: false, 
    example: '8',
    description: 'Filter by semester (only for students)'
  })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiProperty({ 
    required: false, 
    type: Boolean,
    description: 'Filter by active status'
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    required: false, 
    example: 'john',
    description: 'Search by name, email, or ID'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    required: false, 
    example: 1, 
    default: 1,
    description: 'Page number'
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    required: false, 
    example: 10, 
    default: 10,
    description: 'Items per page'
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;
}