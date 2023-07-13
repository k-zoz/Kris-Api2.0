import { BaseDto } from "@core/dto/global/base.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { Transform } from "class-transformer";
import { IsValidBackOfficeRole } from "@core/validators/back-office-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto extends BaseDto {
  email?: string;
  phoneNumber?: string;
  firstname?: string;
  surname?: string;
  password?: string;
  createdBy?: string;
  role?: any;
}

export class CreateSuperUserDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: "Phone number is required" })
  phoneNumber: string;
  @IsNotEmpty({ message: "First name is required" })
  firstname: string;
  @IsNotEmpty({ message: "Surname is required" })
  surname: string;
  @IsNotEmpty({ message: "Password is required" })
  @IsStrongPassword({ minNumbers: 1, minSymbols: 1, minLowercase: 1, minUppercase: 1, minLength: 8 })
  password: string;
  @IsOptional()
  createdBy: string;
  @IsNotEmpty({ message: "Role is required" })
  @IsValidBackOfficeRole()
  role: string;
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

export class UpdateBackOfficeProfile extends BaseDto {
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  phoneNumber: string;
  @IsOptional()
  firstname: string;
  @IsOptional()
  surname: string;
  @IsOptional()
  @IsStrongPassword({ minNumbers: 1, minSymbols: 1, minLowercase: 1, minUppercase: 1, minLength: 8 })
  password: string;
}




