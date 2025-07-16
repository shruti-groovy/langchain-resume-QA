// src/resume/dto/ask-question.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AskQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resumeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;
}
