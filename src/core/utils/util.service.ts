import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException, AppException, AppUnauthorizedException } from "@core/exception/app-exception";
import { LocaleService } from "@locale/locale.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { randomBytes } from "crypto";
import { v4 as uuidV4 } from "uuid";
import * as moment from "moment";
const dayjs = require("dayjs");


@Injectable()
export class UtilService {
  private readonly logger = new Logger(UtilService.name);

  constructor(private readonly localeService: LocaleService) {
  }


  compareEmails(email1: string, email2: string) {
    if (email1 === email2) {
      throw new AppConflictException(this.localeService.resolveMessage(AuthMsg.CANNOT_CHANGE_YOUR_ROLE));
    }
  }

  isEmpty(param: any) {
    if (param === null || param === undefined || param === "") {
      throw new AppConflictException("Empty");
    }
    if (Array.isArray(param) && param.length === 0) {
      throw new AppConflictException("Empty");
    }
    if (typeof param === "object" && Object.keys(param).length === 0) {
      throw new AppConflictException("Empty");
    }

  }

  async checkIfRoleIsManagement(role: string | string[]) {
    if (typeof role === "string") {
      if (role === "MANAGEMENT") {
        this.logger.error(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
        throw new AppUnauthorizedException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }
    if (Array.isArray(role)) {
      if (role.some(r => r === "MANAGEMENT")) {
        this.logger.error(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
        throw new AppUnauthorizedException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }

  }


  convertDateAgain(date) {
    return dayjs(date).toDate();
  }

  getDifferenceInDays(startDate, endDate): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, "days");

  }

  countWeekdays(startDate, endDate) {
    let count = 0;
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate)) {
      // weekdays are from Monday (1) to Friday (5)
      if (currentDate.isoWeekday() <= 5) {
        count++;
      }
      currentDate = currentDate.add(1, 'days');
    }

    return count;
  }

  toUpperCase(str: any): string {
    if (!str) {
    } else {
      return str.toUpperCase();
    }

  }


  convertAmount(data: string): number {
    if (!data) {
    } else return parseFloat(data);
  }


  generateRandomPassword(): string {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSymbol = false;

    while (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      password = "";
      for (let i = 0; i < length; i++) {
        const index = randomBytes(1)[0] % charset.length;
        const char = charset[index];
        password += char;

        if (char >= "A" && char <= "Z") {
          hasUpper = true;
        } else if (char >= "a" && char <= "z") {
          hasLower = true;
        } else if (char >= "0" && char <= "9") {
          hasNumber = true;
        } else {
          hasSymbol = true;
        }
      }
    }

    return password;
  }

  generateUUID(name: string) {
    const namePart = name.slice(0, 3).toUpperCase();
    const uuid = uuidV4();
    return `KRIS-${namePart}-${uuid}`;
  }


}
