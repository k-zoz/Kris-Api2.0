import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateNested
} from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";
import { IsValidEmployeeRole } from "@core/validators/role/employee-role-validator";
import { Type } from "class-transformer";
import { IsValidEmploymentStatus } from "@core/validators/dto/status-validator";


export class CreateEmployeeDto extends BaseDto {
  @IsNotEmpty({ message: "Employee email address is required" })
  @IsEmail()
  empEmail: string;
  @IsNotEmpty({ message: "Password is required" })
  @IsStrongPassword({ minNumbers: 1, minSymbols: 1, minLowercase: 1, minUppercase: 1, minLength: 8 })
  empPassword: string;
  @IsString()
  @IsNotEmpty({ message: "Employee First name is required" })
  @MinLength(3)
  empFirstName: string;
  @IsString()
  @MinLength(3)
  @IsNotEmpty({ message: "Employee Last name is required" })
  empLastName: string;
  @IsNotEmpty({ message: "Employee ID Number is required" })
  empIDNumber: string;
  @IsNotEmpty({ message: "Employee Phone Number is required" })
  empPhoneNumber: string;
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: any;
}


export class EmployeeBasic {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  employeeID: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: "First name must not be less than 3 characters" })
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsOptional()
  @IsString()
  middleName: string;
  krisID: string;
}


export class EmployeeWork {
  @IsOptional()
  dateOfConfirmation: any;
  @IsNotEmpty()
  dateOfJoining: any;
  @IsNotEmpty()
  @IsString()
  department: string;
  @IsOptional()
  @IsString()
  designation: string;
  @IsOptional()
  @IsString()
  empTeam: string;
  @IsNotEmpty()
  @IsString()
  employeeBranch: string;
  @IsOptional()
  @IsString()
  employeeClient: string;
  @IsString()
  @IsValidEmployeeRole()
  employeeKrisRole: any;
  @IsNotEmpty()
  @IsString()
  @IsValidEmploymentStatus()
  employeeStatus: any;
  @IsOptional()
  @IsString()
  employmentType: string;
  idNumber: string;
  @IsOptional()
  @IsEmail()
  email: string;
  workPhoneNumber: string;
}

export class ClientEmployeeWork {
  @IsOptional()
  dateOfConfirmation: any;
  @IsNotEmpty()
  dateOfJoining: any;
  @IsOptional()
  @IsString()
  designation: string;
  @IsNotEmpty()
  @IsString()
  employeeClient: string;
  @IsString()
  @IsValidEmployeeRole()
  employeeKrisRole: any;
  @IsNotEmpty()
  @IsString()
  @IsValidEmploymentStatus()
  employeeStatus: any;
  @IsOptional()
  @IsString()
  employmentType: string;
  idNumber: string;
  @IsOptional()
  @IsEmail()
  email: string;
  workPhoneNumber: string;
}


export class UpdateEmployeeWork {
  @IsOptional()
  dateOfConfirmation: any;
  @IsOptional()
  dateOfJoining: any;
  @IsNotEmpty()
  @IsString()
  department: string;
  @IsOptional()
  @IsString()
  designation: string;
  @IsNotEmpty()
  @IsString()
  empTeam: string;
  @IsNotEmpty()
  @IsString()
  employeeBranch: string;
  @IsOptional()
  @IsString()
  employeeClient: string;
  @IsNotEmpty()
  @IsString()
  @IsValidEmploymentStatus()
  employeeStatus: any;
  @IsOptional()
  @IsString()
  employmentType: string;
  idNumber: string;
  @IsOptional()
  @IsEmail()
  email: string;
  workPhoneNumber: string;
  payGroup?: string;
}


export class EmployeeContact {
  @IsNotEmpty()
  @IsEmail()
  personalEmail: string;
  @IsNotEmpty()
  personalPhoneNumber: string;
  @IsOptional()
  workPhoneNumber: string;
  @IsOptional()
  personalPhoneNumber2: string;
}


export class EmployeeOnboardRequest extends BaseDto {
  @ValidateNested()
  @Type(() => EmployeeBasic)
  basic: EmployeeBasic;
  @ValidateNested()
  @Type(() => EmployeeWork)
  work: EmployeeWork;
  @ValidateNested()
  @Type(() => EmployeeContact)
  contact: EmployeeContact;
}


export class ClientEmployeeOnboardRequest extends BaseDto {
  @ValidateNested()
  @Type(() => EmployeeBasic)
  basic: EmployeeBasic;
  @ValidateNested()
  @Type(() => ClientEmployeeWork)
  clientWork: ClientEmployeeWork;
  @ValidateNested()
  @Type(() => EmployeeContact)
  contact: EmployeeContact;
}

export class CreateMgtEmpDto extends BaseDto {
  @IsNotEmpty({ message: "Employee email address is required" })
  @IsEmail()
  empEmail: string;
  @IsString()
  @IsNotEmpty({ message: "Employee First name is required" })
  @MinLength(3)
  empFirstName: string;
  @IsString()
  @IsNotEmpty({ message: "Employee Last name is required" })
  @MinLength(3)
  empLastName: string;
  @IsNotEmpty({ message: "Employee ID Number is required" })
  empIDNumber: string;
  @IsOptional()
  @MinLength(11, { message: "Digits must be 11" })
  empPhoneNumber: string;
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: any;
  empPassword: string;
  orgKrisId: string;
}

export class Employee {
  readonly id?: string;
  readonly firstname?: string;
  readonly surname?: string;
  readonly phoneNumber?: string;
  readonly email?: string;
  readonly password?: string;
  readonly refreshToken?: string;
  readonly role?: any;
  readonly createdBy?: string;
  readonly createdDate?: Date;
  readonly modifiedBy?: string;
  readonly modifiedDate?: Date;
}


export class RoleToEmployee {
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: any;
  modifiedBy?: string;
}

export class EditEmployeeDto extends BaseDto {
  @IsOptional()
  @IsEmail()
  empEmail: string;
  @IsOptional()
  empLastName: string;
  @IsOptional()
  empFirstName: string;
  @IsOptional()
  empPhoneNumber: string;
  @IsOptional()
  empIDNumber: string;
  @IsOptional()
  @IsStrongPassword({ minNumbers: 1, minSymbols: 1, minLowercase: 1, minUppercase: 1, minLength: 8 })
  empPassword: string;
}

export class UpdateCertificateDto {
  @IsNotEmpty()
  @IsString()
  certName: string;
  @IsNotEmpty()
  @IsString()
  certUrl: string;
}


export class UpdateBasicInformation {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  personalEmail?: string;
  phoneNumber?: string;
  personalPhoneNumber2?: string;
}

export class UpdatePersonalInformation {
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
}

export class UpdateResidentialInformation {
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

export class UpdateNokInformation {
  nok_legalName?: string;
  nok_address?: string;
  nok_occupation?: string;
  nok_phoneNumber?: string;
  nok_relationship?: string;
  nok_email?: string;
}

export class UpdateGuarantorInformation {
  gua_legalName?: string;
  gua_address?: string;
  gua_occupation?: string;
  gua_phoneNumber?: string;
  gua_relationship?: string;
  gua_email?: string;
}

export class FinancialInformation {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  pensionNumber?: string;
  pensionManager?: string;
}


export class EmployeeUpdateRequest {
  basic!: UpdateBasicInformation;
  personal!: UpdatePersonalInformation;
  residential!: UpdateResidentialInformation;
  financial!: FinancialInformation;
  nok!: UpdateNokInformation;
  gua!: UpdateGuarantorInformation;
}


export interface EmployeeStatistics {
  male: number,
  female: number,
  others: number
}


export class ContactSupport {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
}
