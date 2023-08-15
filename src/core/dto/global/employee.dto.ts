import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";
import { IsValidEmployeeRole } from "@core/validators/role/employee-role-validator";

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
  @IsNotEmpty({ message: "Employee Phone Number is required" })
  @MinLength(11, {message:"Digits must be 11"})
  empPhoneNumber: string;
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: any;
  empPassword: string;
  orgKrisId:string

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
