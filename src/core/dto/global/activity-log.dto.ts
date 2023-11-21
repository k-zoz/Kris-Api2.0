import { IsNotEmpty } from "class-validator";

export class ActivityLogDto {
  @IsNotEmpty()
  description:string
}
