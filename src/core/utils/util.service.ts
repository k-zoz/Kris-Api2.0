import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException } from "@core/exception/app-exception";

const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();


@Injectable()
export class UtilService {
  private readonly logger = new Logger(UtilService.name);

  sanitizePhoneNumber(phoneNumber: string): string {
    const naijaCode = phoneNumber.substring(0, 4);

    if (naijaCode.includes("234") && !naijaCode.includes("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    return phoneNumber;
  }

  getPhoneNumber(phoneNumber: string): string {
    phoneNumber = this.sanitizePhoneNumber(phoneNumber);

    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, "NG");
    return `0${number.getNationalNumber()}`;
  }

  compareEmails(email1: string, email2: string) {
    if (email1 === email2) {
      throw new AppConflictException("You cannot change your role");
    } else {

    }
  }
}
