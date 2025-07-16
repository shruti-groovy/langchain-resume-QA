// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumeModule } from './resume/resume.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
config();

@Module({
  //Mongodb connection
  imports: [MongooseModule.forRoot(process.env.DB_URL as string), ResumeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
