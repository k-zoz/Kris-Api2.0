import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";
import { IsValidEmployeeRole } from "@core/validators/employee-role-validator";

export class CreateEmployeeDto extends BaseDto {
  @IsNotEmpty({ message: "Employee email address is required" })
  @IsEmail()
  empEmail: string;
  @IsNotEmpty({ message: "Password is required" })
  empPassword: string;
  @IsString()
  @IsNotEmpty({ message: "Employee First name is required" })
  empFirstName: string;
  @IsString()
  @IsNotEmpty({ message: "Employee Last name is required" })
  empLastName: string;
  @IsNotEmpty({ message: "Employee ID Number is required" })
  empIDNumber: string;
  @IsNotEmpty({ message: "Employee Phone Number is required" })
  empPhoneNumber: string;
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: any;
  createdBy: string;
  modifiedBy: string;
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


