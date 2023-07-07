import { BaseDto } from "@core/dto/global/base-dto";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class UserDto extends BaseDto{
  email: string;
  phoneNumber: string;
  firstname: string;
  surname: string;
  password: string;
  role?:any
}

export class CreateSuperUserDto extends BaseDto {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: "Phone number is required" })
  phoneNumber: string;
  @IsNotEmpty({ message: "First name is required" })
  firstname: string;
  @IsNotEmpty({ message: "Surname is required" })
  surname: string;
  @IsStrongPassword({minNumbers:1, minSymbols:1,minLowercase:1,minUppercase:1,minLength:8})
  password: string;

}



