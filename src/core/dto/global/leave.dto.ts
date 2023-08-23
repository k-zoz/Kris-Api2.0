import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
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
