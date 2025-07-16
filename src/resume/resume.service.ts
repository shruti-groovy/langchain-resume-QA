// src/resume/resume.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as pdfParse from 'pdf-parse';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Resume, ResumeDocument } from './entities/resume.entity';

@Injectable()
export class ResumeService implements OnModuleInit {
  private llm: ChatGoogleGenerativeAI;

  constructor(
    @InjectModel(Resume.name)
    private readonly resumeModel: Model<ResumeDocument>,
  ) {}

  /**
   * Initializes the Google Generative AI (Gemini) model when the module starts.
   */
  onModuleInit() {
    if (!process.env.GOOGLE_API_KEY) {
      console.error(
        'GOOGLE_API_KEY is not set in environment variables. Gemini LLM will not function.',
      );
      throw new Error('GOOGLE_API_KEY is not configured.');
    }
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-2.5-pro',
      temperature: 0.1, // Lower temperature for more factual answers
    });
    console.log('Gemini LLM initialized for ResumeService.');
  }

  /**
   * Uploads and parses a resume file, then saves its extracted text to MongoDB.
   * @param file
   * @returns
   */
  async uploadResume(
    file: Express.Multer.File,
  ): Promise<{ message: string; id: string }> {
    let extractedText: string;

    // Check file type
    if (file.mimetype === 'application/pdf') {
      try {
        const data = await pdfParse(file.buffer);
        extractedText = data.text;
      } catch (error) {
        console.error('PDF parsing error:', error);
        throw new InternalServerErrorException(
          'PDF parsing failed. Ensure it is a valid PDF.',
        );
      }
    } else {
      throw new InternalServerErrorException(
        'Unsupported file type. Only PDF is supported for now.',
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new InternalServerErrorException(
        'Could not extract text from the provided resume.',
      );
    }

    const newResume = new this.resumeModel({
      originalFileName: file.originalname,
      extractedText: extractedText,
      mimeType: file.mimetype,
    });

    const savedResume = await newResume.save();
    return {
      message: 'Resume uploaded successfully',
      id: savedResume._id.toString(),
    };
  }

  /**
   * Queries a specific resume using the Gemini LLM.
   * @param id
   * @param question
   * @returns
   */
  async askQuestion(id: string, question: string): Promise<string> {
    const resume = await this.resumeModel.findById(id).exec();
    if (!resume) {
      throw new NotFoundException(`Resume with ID "${id}" not found.`);
    }

    if (!this.llm) {
      throw new InternalServerErrorException(
        'LLM not initialized. Check API key configuration.',
      );
    }

    const resumeContent = resume.extractedText;

    // Provide the resume content as context for the LLM to answer the question.
    const promptMessages = [
      new SystemMessage(
        `You are a helpful AI assistant specialized in analyzing resumes.
        Your task is to answer questions based *only* on the provided resume text.
        If the information is not explicitly present in the resume, state that you cannot find the answer in the document.
        Be concise and direct in your answers.
        Resume Content:
        ---
        ${resumeContent}
        ---`,
      ),
      new HumanMessage(question),
    ];

    try {
      const response = await this.llm.invoke(promptMessages);
      return response.content.toString();
    } catch (error) {
      console.error('Error invoking Gemini LLM:', error);
      throw new InternalServerErrorException(
        'Failed to get an answer from the AI model.',
      );
    }
  }

  /**
   * Retrieves a resume document by its ID.
   * @param id
   * @returns
   */
  async getResumeById(id: string): Promise<ResumeDocument | null> {
    const resume = this.resumeModel.findById(id).exec();
    if (!resume) {
      throw new NotFoundException(`Resume with ID "${id}" not found.`);
    }
    return resume;
  }

  /**
   * Retrieves all uploaded resumes
   * @returns
   */
  async getAllResumes(): Promise<Partial<ResumeDocument>[]> {
    // Use .select('-extractedText') to exclude the large text content for listing
    return this.resumeModel.find().select('-extractedText').exec();
  }
}
