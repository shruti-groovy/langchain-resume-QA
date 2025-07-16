// src/resume/resume.controller.ts

import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * API for upload resume pdf file
   * @param file
   * @returns
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadResume(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Max 5MB
          new FileTypeValidator({ fileType: 'application/pdf' }), // Only PDF files
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.resumeService.uploadResume(file);
  }

  /**
   * API for ask question about specific resume
   * @param askQuestionDto
   * @returns
   */
  @Post('ask')
  askQuestion(@Body() askQuestionDto: AskQuestionDto) {
    return this.resumeService.askQuestion(
      askQuestionDto.resumeId,
      askQuestionDto.question,
    );
  }

  /**
   * API for get details of a specific resume by ID.
   * @param id
   * @returns
   */
  @Get(':id')
  async getResume(@Param('id') id: string) {
    return await this.resumeService.getResumeById(id);
  }

  /**
   * API for get a list of all uploaded resumes.
   * @returns
   */
  @Get()
  async getAllResumes() {
    return this.resumeService.getAllResumes();
  }
}
