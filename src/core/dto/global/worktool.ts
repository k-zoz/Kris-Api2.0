import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class WorkToolDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  description: string;
  tagNumber: string;
  comments: string;
}
