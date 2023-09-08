import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateNewHireDto {
  @IsNotEmpty({ message: "Job title is required!" })
  title: string;
  @IsNotEmpty({ message: "Number of new hire is required!" })
  numberNeeded: string;
  @IsNotEmpty({ message: "Years of experience is required!" })
  yoe: string;
  @IsNotEmpty({ message: "Qualifications is required!" })
  qualifications: string;
  @IsNotEmpty({ message: "Skill set is required!" })
  skillSet: string;
  @IsNotEmpty({ message: "Other necessary information is required required" })
  other: string;
  @IsNotEmpty({ message: "urgency is required required" })
  urgency: string;
}


export class PostJobDto {
  @IsNotEmpty({ message: "Job title is required" })
  title: string;
  @IsNotEmpty({ message: "Job type is required" })
  type: string;
  @IsNotEmpty({ message: "Year of experience is required" })
  yoe: string;
  @IsNotEmpty({ message: "Qualifications is required" })
  qualification: string;
  @IsNotEmpty({ message: "Skill sets is required" })
  skill_set: string;
  @IsOptional()
  salary_range: string;
  @IsNotEmpty({ message: "Job location is required" })
  location: string;
  @IsNotEmpty({ message: "Job posting end date is required" })
  searchEndDate: any;
  @IsNotEmpty({ message: "More job information is required" })
  information: string;

}


export class ApplyForJobDto {
  @IsNotEmpty()
  fullname: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  resumeUrl: string;
  @IsOptional()
  coverLetterUrl: string;
}
