import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
  @IsNumber()
  leaveDuration: number;
}
