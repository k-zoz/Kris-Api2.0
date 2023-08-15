import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";

export class CreateBranchDto extends BaseDto {
  @IsNotEmpty({ message: "Branch Name is required!" })
  orgBranchName: string;
  @IsNotEmpty({ message: "Branch Location is required!" })
  orgBranchAddress: string;
  @IsNotEmpty({ message: "Branch Location is required!" })
  orgBranchState: string;
  @IsNotEmpty({ message: "Branch Location is required!" })
  orgBranchCity: string;
  @IsNotEmpty({ message: "Branch Location is required!" })
  orgBranchCountry: string;
  @IsOptional()
  @IsString()
  orgBranchMailAlias: string;
  @IsString()
  @IsOptional()
  branchManager: string;
  @IsOptional()
  branch_code:string
}
