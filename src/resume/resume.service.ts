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
   * Search from all resumes based on a general query.
   * @param query
   * @returns
   */
  async searchAllResumes(query: string): Promise<any[]> {
    const allResumes = await this.resumeModel.find().exec();
    const results: {
      id: string;
      fileName: string;
      answer: string;
      matchesCriteria: boolean;
    }[] = [];

    if (!this.llm) {
      throw new InternalServerErrorException(
        'LLM not initialized. Check API key configuration.',
      );
    }

    for (const resume of allResumes) {
      const resumeContent = resume.extractedText;
      const specificQuestion = `Based on the following resume, ${query}. If yes, state their name and relevant experience. If no, just state 'No match'.`;

      // Craft a prompt to help Gemini extract specific info and directly answer a boolean question
      const promptMessages = [
        new SystemMessage(
          `You are an AI assistant specialized in analyzing resumes.
          Answer the user's question based *only* on the provided resume content.
          If the resume contains the information required to answer the question positively, state the candidate's name (if available) and the specific detail (e.g., "John Doe has 5 years of experience").
          If the resume does not contain the information or if the criteria is not met, respond only with "No match".
          Resume Content:
          ---
          ${resumeContent}
          ---`,
        ),
        new HumanMessage(specificQuestion),
      ];

      try {
        const response = await this.llm.invoke(promptMessages);
        const answer = response.content.toString().trim();

        // Simple parsing: if it doesn't contain "No match", assume it's a match.
        // For more complex queries, you might need more sophisticated NLP parsing
        // or a structured output from the LLM (e.g., JSON).
        const matchesCriteria = !answer.includes('No match');

        results.push({
          id: resume._id.toString(),
          fileName: resume.originalFileName,
          answer: answer,
          matchesCriteria: matchesCriteria,
        });
      } catch (error) {
        console.error(`Error querying resume ${resume._id} for search:`, error);
        results.push({
          id: resume._id.toString(),
          fileName: resume.originalFileName,
          answer: 'Error processing this resume.',
          matchesCriteria: false,
        });
      }
    }

    // Filter to only include resumes that matched the criteria
    return results.filter((res) => res.matchesCriteria);
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
