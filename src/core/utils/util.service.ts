import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException } from "@core/exception/app-exception";
import { LocaleService } from "../../locale/locale.service";
import { AuthMsg } from "@core/const/security-msg-const";

const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();


@Injectable()
export class UtilService {
  private readonly logger = new Logger(UtilService.name);

  constructor(private readonly localeService: LocaleService) {
  }

  // sanitizePhoneNumber(phoneNumber: string): string {
  //   const naijaCode = phoneNumber.substring(0, 4);
  //
  //   if (naijaCode.includes("234") && !naijaCode.includes("+")) {
  //     phoneNumber = `+${phoneNumber}`;
  //   }
  //
  //   return phoneNumber;
  // }

  // getPhoneNumber(phoneNumber: string): string {
  //   phoneNumber = this.sanitizePhoneNumber(phoneNumber);
  //
  //   const number = phoneUtil.parseAndKeepRawInput(phoneNumber, "NG");
  //   return `0${number.getNationalNumber()}`;
  // }

  compareEmails(email1: string, email2: string) {
    if (email1 === email2) {
      throw new AppConflictException(this.localeService.resolveMessage(AuthMsg.CANNOT_CHANGE_YOUR_ROLE));
    }
  }

   isEmpty(param: any) {
    if (param === null || param === undefined || param === '') {
      throw new AppConflictException("Empty")
    }
    if (Array.isArray(param) && param.length === 0) {
      throw new AppConflictException("Empty")
    }
    if (typeof param === 'object' && Object.keys(param).length === 0) {
      throw new AppConflictException("Empty")
    }

  }
}
