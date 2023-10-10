import { BaseDto } from "@core/dto/global/base.dto";
import { IsDate, IsEmail, IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateOrgDto extends BaseDto {
  @IsNotEmpty({ message: "Organization name is required!" })
  @MinLength(3)
  orgName: string;
  @IsNotEmpty({ message: "Organization Website is required!" })
  orgWebsite: string;
  @IsNotEmpty({ message: "Email Address is required!" })
  @IsEmail()
  orgEmail: string;
  @IsNotEmpty({ message: "Address is required!" })
  orgAddress: string;
  @IsNotEmpty({ message: " Contact Number is required!" })
  orgNumber: string;
  @IsOptional()
  orgAddress2 ?: string;
  @IsNotEmpty({ message: "State is required!" })
  orgState: string;
  @IsNotEmpty({ message: "City is required!" })
  orgCity: string;
  @IsNotEmpty({ message: "Country is required!" })
  orgCountry: string;
  @IsNotEmpty({ message: "Type is required!" })
  orgType: string;
  @IsNotEmpty({ message: "Zip Code is required!" })
  orgZipCode: string;
  @IsNotEmpty({ message: "RC number is required!" })
  orgRCnumber: string;
  @IsNotEmpty()
  orgDateFounded: any;
  @IsNotEmpty({ message: "Industry is required!" })
  orgIndustry: string;
  createdBy: string;
  modifiedBy: string;
  orgKrisId: string;
}

export  class MakeAnnouncementsDto {
  @IsNotEmpty()
  @IsString()
  title:string
  @IsNotEmpty()
  @IsString()
  content:string
}

export class EditOrgDto extends BaseDto {
  @IsOptional()
  orgName: string;
  @IsOptional()
  orgWebsite: string;
  @IsOptional()
  @IsEmail()
  orgEmail: string;
  @IsOptional()
  orgAddress: string;
  @IsOptional()
  orgNumber: string;
  @IsOptional()
  orgAddress2 ?: string;
  @IsOptional()
  orgState: string;
  @IsOptional()
  orgCountry: string;
  @IsOptional()
  orgRCnumber: string;
  @IsOptional()
  orgIndustry: string;
  modifiedBy: string;
}

export class ModifyOrg {
  @IsOptional()
  deptName: string;
  @IsOptional()
  teamName: string;
}

export class CreateTeamInDepartmentDto {
  @IsNotEmpty({ message: "Department Name is required" })
  @IsString()
  departmentName: string;
  @IsNotEmpty({ message: "Team Name is required" })
  @IsString()
  teamName: string;
}


export class CreateDepartmentInBranchDto {
  @IsNotEmpty({ message: "Name of Department is required" })
  @IsString()
  name: string;
}

export class HeadOFDepartmentDto {
  @IsNotEmpty({ message: "HOD email is required" })
  @IsString()
  @IsEmail()
  email: string;
}


export class TeamLeadDto {
  @IsNotEmpty({ message: "Team Lead email is required" })
  @IsString()
  @IsEmail()
  email: string;
}



export class DepartmentNameSearchDto {
  @IsNotEmpty({ message: "Name of Department is required" })
  @IsString()
  departmentName: string;
  readonly skip: number
  readonly take: number
}

export class SearchBranchNameOrCodeDto{
  branch_code:string
  @IsNotEmpty({message:"Branch name is required!"})
  name:string
  readonly skip: number
  readonly take: number
}
