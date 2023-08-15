import { BaseDto } from "@core/dto/global/base.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { IsValidBackOfficeRole } from "@core/validators/role/back-office-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidEmploymentStatus } from "@core/validators/dto/status-validator";

export class UserDto extends BaseDto {
  email?: string;
  phoneNumber?: string;
  firstname?: string;
  surname?: string;
  password?: string;
  createdBy?: string;
  role?: any;
  krisID: string;
  middleName?: string;
  status?: string;
}

export class CreateSuperUserDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: "Phone number is required" })
  @IsString()
  @MinLength(11, { message: "Phone number must be 11 digits" })
  phoneNumber: string;
  @IsNotEmpty({ message: "First name is required" })
  @IsString()
  firstname: string;
  @IsNotEmpty({ message: "Surname is required" })
  @IsString()
  surname: string;
  @IsOptional()
  @IsString()
  middleName: string;
  password: string;
  @IsOptional()
  createdBy: string;
  @IsNotEmpty({ message: "Role is required" })
  @IsValidBackOfficeRole()
  role: any;
  @IsOptional()
  @IsValidEmploymentStatus()
  status: any;
  krisID: string;
}


export class UpdateBackOfficeUserRole {
  @IsNotEmpty({ message: "Role is required" })
  @IsValidBackOfficeRole({ message: "Role must be a valid back office role" })
  role: string;
}


export class UpdateBackOfficeUserPassword {
  @IsNotEmpty({ message: "Password is required" })
  @IsStrongPassword({ minNumbers: 1, minSymbols: 1, minLowercase: 1, minUppercase: 1, minLength: 8 })
  password: string;
}

export class ConfirmInputPasswordDto {
  @IsNotEmpty({ message: "Password is required" })
  current: string;
  @IsNotEmpty({ message: "Password is required" })
  @IsStrongPassword({
    minNumbers: 1,
    minSymbols: 1,
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1
  },
    { message: "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long" })
  newPassword: string;
  retypeNewPassword: string;
}

export class UpdateBackOfficeProfile {
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @MinLength(11, { message: "Phone number must be 11 digits" })
  phoneNumber: string;
  @IsOptional()
  firstname: string;
  @IsOptional()
  surname: string;
  @IsOptional()
  middlename: string;
  @IsOptional()
  status: any;
}




