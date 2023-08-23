import { BaseDto } from "@core/dto/global/base.dto";
import { IsNotEmpty } from "class-validator";
import { IsEndDateValid } from "@core/validators/dto/leave-date-validator";

export class CreateAppraisalDto extends BaseDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  startDate: any;
  @IsNotEmpty()
  @IsEndDateValid("startDate")
  endDate: any;
}

export class CreateSectionsForAppraisal extends BaseDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
}

export class QuestionsDto extends BaseDto {
  @IsNotEmpty()
  questions: string;
  @IsNotEmpty()
  response_type: any;
}


export class QuestionsDto2 extends BaseDto {
  @IsNotEmpty()
  questions: { text: string; response_type: any; options?: { text: string; score: number; }[];}[];
}
