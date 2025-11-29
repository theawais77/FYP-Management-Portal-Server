import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
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
