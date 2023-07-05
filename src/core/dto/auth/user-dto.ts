import { BaseDto } from "@core/dto/global/base-dto";
import { IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class UserDto extends BaseDto{
  email: string;
  phoneNumber: string;
  firstname: string;
  surname: string;
  password: string;
}

export class CreateSuperUserDto extends BaseDto {
  @IsNotEmpty({ message: "Email is required" })
  email: string;
  @IsOptional()
  phoneNumber: string;
  @IsNotEmpty({ message: "First name is required" })
  firstname: string;
  @IsNotEmpty({ message: "Surname is required" })
  surname: string;
  @IsString()
  @IsOptional()
  @IsStrongPassword({minNumbers:8, minSymbols:1,minLowercase:1,minUppercase:1,minLength:2})
  password: string;

}



 interface SuperUser {

}
