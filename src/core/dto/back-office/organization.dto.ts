import { BaseDto } from "@core/dto/global/base.dto";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateOrgDto extends BaseDto {
  @IsNotEmpty({message: "Organization name is required!"})
  orgName: string;
  @IsNotEmpty({message: "Organization Website is required!"})
  orgWebsite: string;
  @IsNotEmpty({message: "Organization Email Address is required!"})
  @IsEmail()
  orgEmail: string;
  @IsNotEmpty({message: "Organization Address is required!"})
  orgAddress: string;
  @IsNotEmpty({message: "Organization Number is required!"})
  orgNumber:string;
  @IsOptional()
  orgAddress2 ?: string;
  @IsNotEmpty({message: "Organization State is required!"})
  orgState: string;
  @IsNotEmpty({message: "Organization Country is required!"})
  orgCountry: string;
  @IsNotEmpty({message: "Organization RC number is required!"})
  orgRCnumber: string;
  @IsNotEmpty({message: "Organization industry is required!"})
  orgIndustry: string;
  createdBy:string;
  modifiedBy:string
}
