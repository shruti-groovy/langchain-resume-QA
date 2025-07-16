// src/resume/entities/resume.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true })
  originalFileName: string;

  @Prop({ required: true, type: String, index: true })
  extractedText: string;

  @Prop({ required: true })
  mimeType: string;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
