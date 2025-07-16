import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  query: string;
}
