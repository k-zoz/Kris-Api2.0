import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsNotEmpty()
  @IsNumber()
    leaveDuration: number;
}

export class ApplyForLeave{
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsNotEmpty()
  leaveStartDate:any;
  @IsNotEmpty()
  leaveEndDate:any;
  @IsOptional()
  leaveDuration: number;
}


export class MockLeaveDto{
  @IsNotEmpty()
  @IsString()
  leaveName: string;
  @IsOptional()
  leaveDuration: number;
  @IsNotEmpty()
  leaveStartDate:any;
  @IsNotEmpty()
  leaveEndDate:any;
}
