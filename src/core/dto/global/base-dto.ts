import { AuthPayload } from "@core/dto/auth/auth-payload";

export abstract class BaseDto {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  authPayload?: AuthPayload;
}
