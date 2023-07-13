import { Global, Injectable } from "@nestjs/common";

@Global()
@Injectable()
export class LocaleService {
  resolveMessage(key: any): string {
    return key.toString();
  }
}
