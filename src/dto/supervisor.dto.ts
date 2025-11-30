import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Project Idea Management
export class CreateProjectIdeaDto {
  @ApiProperty({ example: 'AI-Based Healthcare System' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A comprehensive healthcare management system using machine learning' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['AI', 'Machine Learning', 'Healthcare'], required: false })
  @IsOptional()
  technologies?: string[];

  @ApiProperty({ example: 'Students should have knowledge of Python and ML basics', required: false })
  @IsString()
  @IsOptional()
  requirements?: string;
}

export class UpdateProjectIdeaDto {
  @ApiProperty({ example: 'AI-Based Healthcare System', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['AI', 'Machine Learning'], required: false })
  @IsOptional()
  technologies?: string[];

  @ApiProperty({ example: 'Updated requirements', required: false })
  @IsString()
  @IsOptional()
  requirements?: string;
}

// Idea Approval/Rejection
export class ApproveIdeaDto {
  @ApiProperty({ example: 'Great project idea! Looking forward to working on this.', required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}

export class RejectIdeaDto {
  @ApiProperty({ example: 'The scope is too broad. Please narrow down the focus.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

// Proposal Review
export class ApproveProposalDto {
  @ApiProperty({ example: 'Well-structured proposal. Approved for implementation.', required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}

export class RejectProposalDto {
  @ApiProperty({ example: 'The methodology section needs more detail.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CommentProposalDto {
  @ApiProperty({ example: 'Please revise the timeline section.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

// Document Review
export class ApproveDocumentDto {
  @ApiProperty({ example: 'Documentation is complete and well-organized.', required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}

export class RejectDocumentDto {
  @ApiProperty({ example: 'Missing UML diagrams and test cases.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class DocumentFeedbackDto {
  @ApiProperty({ example: 'Good progress. Add more details to the implementation section.' })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}

// GitHub Evaluation
export class EvaluateGithubDto {
  @ApiProperty({ example: 'https://github.com/username/project-repo' })
  @IsUrl()
  @IsNotEmpty()
  repositoryUrl: string;

  @ApiProperty({ example: 15, minimum: 0, maximum: 20 })
  @IsNumber()
  @Min(0)
  @Max(20)
  marks: number;

  @ApiProperty({ example: 'Good code structure and commit history.', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}

// Final Evaluation
export class FinalMarksDto {
  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  totalMarks: number;

  @ApiProperty({ example: 18, minimum: 0, maximum: 20, required: false })
  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  proposalMarks?: number;

  @ApiProperty({ example: 25, minimum: 0, maximum: 30, required: false })
  @IsNumber()
  @Min(0)
  @Max(30)
  @IsOptional()
  implementationMarks?: number;

  @ApiProperty({ example: 15, minimum: 0, maximum: 20, required: false })
  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  documentationMarks?: number;

  @ApiProperty({ example: 12, minimum: 0, maximum: 15, required: false })
  @IsNumber()
  @Min(0)
  @Max(15)
  @IsOptional()
  presentationMarks?: number;

  @ApiProperty({ example: 15, minimum: 0, maximum: 15, required: false })
  @IsNumber()
  @Min(0)
  @Max(15)
  @IsOptional()
  githubMarks?: number;
}

export class FinalFeedbackDto {
  @ApiProperty({ example: 'Excellent project execution. Well done!' })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}
