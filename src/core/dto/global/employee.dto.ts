import { IsEmail, IsNotEmpty } from "class-validator";
import { BaseDto } from "@core/dto/global/base.dto";
import { IsValidEmployeeRole } from "@core/validators/employee-role-validator";

export class EmployeeDto extends BaseDto {
  @IsNotEmpty({ message: "Employee email address is required" })
  @IsEmail()
  empEmail: string;
  @IsNotEmpty({ message: "Password is required" })
  empPassword:string
  @IsNotEmpty({ message: "Employee First name is required" })
  empFirstName: string;
  @IsNotEmpty({ message: "Employee Last name is required" })
  empLastName: string;
  @IsNotEmpty({ message: "Employee ID Number is required" })
  empIDNumber: string;
  @IsNotEmpty({ message: "Employee Phone Number is required" })
  empPhoneNumber: string;
  @IsNotEmpty({ message: "Employee role is required" })
  @IsValidEmployeeRole({ message: "Role must be a valid employee role!" })
  employee_role: string;
  createdBy: string;
  modifiedBy: string;
}
