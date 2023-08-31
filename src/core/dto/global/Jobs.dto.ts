import { IsNotEmpty } from "class-validator";

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
  urgency:string
}
