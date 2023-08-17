import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";

export class CreateBranchDto extends BaseDto {
  @IsNotEmpty({ message: "Branch Name is required!" })
  name: string;
  @IsNotEmpty({ message: "Branch Location is required!" })
  location: string;
  @IsNotEmpty({ message: "State is required!" })
  state: string;
  @IsNotEmpty({ message: "City is required!" })
  city: string;
  @IsNotEmpty({ message: "Country is required!" })
  country: string;
  @IsOptional()
  @IsString()
  orgBranchMailAlias: string;
  @IsString()
  @IsOptional()
  branchManager: string;
  @IsNotEmpty({ message:"Branch code is required" })
  branch_code:string
}


export class CreateClienteleDto extends  BaseDto {
  @IsNotEmpty({ message: "Client Name is required!" })
  name: string;
  @IsNotEmpty({ message: "Client Location is required!" })
  location: string;
  @IsNotEmpty({ message: "State is required!" })
  state: string;
  @IsNotEmpty({ message: "City is required!" })
  city: string;
  @IsNotEmpty({ message: "Country is required!" })
  country: string;
  @IsOptional()
  @IsString()
  orgBranchMailAlias: string;
  @IsString()
  @IsOptional()
  clienteleManager: string;
  @IsNotEmpty({ message:"Client Unique code is required" })
  clientele_code:string
}
