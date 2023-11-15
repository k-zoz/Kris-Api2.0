import { IsNotEmpty } from "class-validator";

export class HolidayDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  date: any;
}
