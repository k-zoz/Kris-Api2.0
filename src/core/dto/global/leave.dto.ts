import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsEndDateValid } from "@core/validators/dto/leave-date-validator";

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsNotEmpty()
  @IsNumber()
  leaveDuration: number;
  @IsNotEmpty()
  leaveType: any;
  @IsOptional()
  leaveDocUrl:string
}

export class ApplyForLeave {
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsNotEmpty()
  leaveStartDate: any;
  @IsNotEmpty()
  @IsEndDateValid("leaveStartDate")
  leaveEndDate: any;
  @IsOptional()
  leaveDuration: number;
  @IsOptional()
  reliefOfficer: string;
  @IsOptional()
  supervisorEmail: string;
  @IsOptional()
  leaveDocs: any;
}


export class MockLeaveDto {
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsOptional()
  leaveDuration: number;
  @IsNotEmpty()
  leaveStartDate: any;
  @IsNotEmpty()
  leaveEndDate: any;
}
