import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException } from "@core/exception/app-exception";
import { LocaleService } from "@locale/locale.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { DateTime } from "luxon";



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

}
