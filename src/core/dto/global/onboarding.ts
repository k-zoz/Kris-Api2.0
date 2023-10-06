import { BaseDto } from "@core/dto/global/base.dto";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class OnboardingDto extends BaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsOptional()
  contentUrl: any;
}
