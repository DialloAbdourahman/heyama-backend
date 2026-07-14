import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImageObjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

