import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException, AppException } from "@core/exception/app-exception";
import { LocaleService } from "@locale/locale.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { DateTime } from "luxon";
import { randomBytes } from 'crypto';
import { v4 as uuidV4 } from 'uuid';


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
        throw new AppException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }
    if (Array.isArray(role)) {
      if (role.some(r => r === "MANAGEMENT")) {
        this.logger.error(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
        throw new AppException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }

  }

  calcLeaveDuration(startDate, endDate): number {
    const start = DateTime.fromFormat(startDate, "MM-dd-yyyy", { zone: "Africa/Lagos" });
    const end = DateTime.fromFormat(endDate, "MM-dd-yyyy", { zone: "Africa/Lagos" });
    const duration = end.diff(start);
    return duration.as("days");
  }

  convertLeaveDate(date: any) {
    const newDate = DateTime.fromFormat(date, "MM-dd-yyyy", { zone: "Africa/Lagos" });
    return newDate.toISO();
  }

   toUpperCase(str: string): string {
    return str.toUpperCase();
  }


  generateRandomPassword(): string {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSymbol = false;

    while (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      password = '';
      for (let i = 0; i < length; i++) {
        const index = randomBytes(1)[0] % charset.length;
        const char = charset[index];
        password += char;

        if (char >= 'A' && char <= 'Z') {
          hasUpper = true;
        } else if (char >= 'a' && char <= 'z') {
          hasLower = true;
        } else if (char >= '0' && char <= '9') {
          hasNumber = true;
        } else {
          hasSymbol = true;
        }
      }
    }

    return password;
  }

  generateUUID(name:string){
    const namePart = name.slice(0, 3).toUpperCase()
    const uuid = uuidV4()
    return `${namePart}-${uuid}`
  }


}
