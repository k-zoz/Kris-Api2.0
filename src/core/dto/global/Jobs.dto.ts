import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";
import { Type } from "class-transformer";

export class CreateNewHireDto {
  @IsNotEmpty({ message: "Job title is required!" })
  title: string;
  @IsOptional({ message: "Number of new hire is required!" })
  numberNeeded: string;
  @IsOptional({ message: "Years of experience is required!" })
  yoe: string;
  @IsOptional({ message: "Qualifications is required!" })
  qualifications: string;
  @IsOptional({ message: "Skill set is required!" })
  skillSet: string;
  @IsNotEmpty({ message: "Other necessary information is required required" })
  other: string;
  @IsNotEmpty({ message: "urgency is required" })
  urgency: string;
}


export class PostJobDto {
  @IsOptional()
  title: string;
  @IsOptional()
  type: string;
  @IsOptional()
  yoe: string;
  @IsOptional()
  qualification: string;
  @IsOptional()
  skill_set: string;
  @IsOptional()
  salary_range: string;
  @IsOptional()
  location: string;
  @IsOptional()
  searchEndDate: any;
  @IsOptional()
  information: string;
  @IsOptional()
  jobDescription: string;

}


export class ApplyForJobDto {
  @IsNotEmpty()
  fullname: string;
  @IsNotEmpty()
  @IsEmail({}, { message: "Provide a  valid email" })
  email: string;
  @IsNotEmpty()
  resumeUrl: string;
  @IsOptional()
  coverLetterUrl: string;
}

export class JobApplicationRequestAndResponse extends BaseDto {
  @ValidateNested()
  @Type(() => ApplyForJobDto)
  profile: ApplyForJobDto;
  @ValidateNested()
  responses: { [key: string]: any };

}

export class QuestionDto {
  @IsNotEmpty()
  question: string;
}

export class SearchEmail {
  @IsNotEmpty()
  email: string;
}
