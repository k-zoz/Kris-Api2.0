import { BaseDto } from "@core/dto/global/base.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class OnboardingDto extends BaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  description: string;
}
