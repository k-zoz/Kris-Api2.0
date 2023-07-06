import { Injectable } from '@nestjs/common';
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { CodeValue } from "@core/dto/global/code-value";
import { EnumValues } from "enum-values";

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(UserRoleEnum).map(value => CodeValue.of(value.name, value.value as string))
  }
}
