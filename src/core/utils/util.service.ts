import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException, AppException, AppUnauthorizedException } from "@core/exception/app-exception";
import { LocaleService } from "@locale/locale.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { randomBytes } from "crypto";
import { v4 as uuidV4 } from "uuid";
import * as moment from "moment";
import * as argon from "argon2";
import { EmployeePayrollPreviewDto } from "@core/dto/global/Payroll.dto";

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
    if (!date) {
      return null;
    } else {
      return dayjs(date).toDate();
    }
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
      currentDate = currentDate.add(1, "days");
    }

    return count;
  }

  toUpperCase(str: any): string {
    if (!str) {
    } else {
      return str.toUpperCase();
    }
  }

  toLowerCase(str: any) {
    if (!str) {
    } else {
      return str.toLowerCase();
    }
  }


  convertAmount(data: string): number {
    if (!data) {
    } else return parseFloat(data);
  }


  generateRandomPassword(): string {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&=";
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

  // generateIDNumber(name: string) {
  //   const namePart = name.slice(0, 3).toUpperCase();
  //   const uuid = uuidV4();
  //   return `KRIS-${namePart}-${uuid}`;
  // }


  returnObjects(data) {
    const [headers, ...rows] = data; // Destructure the headers and rows from the data
    return rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        if (header === "password") {
          obj[header] = this.generateRandomPassword();
        } else if (row[i] !== undefined && row[i] !== "") {
          obj[header] = row[i];
        }
      });
      return obj;
    }).filter(obj => Object.keys(obj).length === headers.length);
  }


  async updateKeysInObject(data) {
    const updatedData = [];
    for (const obj of data) {
      const hashedPassword = await argon.hash(obj.password);
      const krisID = this.generateUUID(obj.firstname);

      const updatedObj = {
        ...obj,
        hashPassword: hashedPassword,
        krisID: krisID
      };
      updatedData.push(updatedObj);
    }
    return updatedData;
  }


  async assignProperties(employeeUploads: any[], orgID: string, creatorEmail: string) {
    return employeeUploads.map(obj => {
      return {
        email: this.toLowerCase(obj.email),
        firstname: this.toUpperCase(obj.firstname),
        lastname: this.toUpperCase(obj.lastname),
        password: obj.hashPassword,
        idNumber: obj.idNumber,
        krisID: obj.krisID,
        role: obj.role,
        status: obj.status,
        middleName: null,
        phoneNumber: null,
        refreshToken: null,
        personalEmail: null,
        workPhoneNumber: null,
        personalPhoneNumber2: null,
        designation: null,
        employment_type: null,
        dateOfBirth: null,
        gender: null,
        maritalStatus: null,
        taxes: null,
        gross_pay: null,
        deduction: null,
        bonuses: null,
        net_pay: null,
        isEdit: null,
        isSelected: null,
        dateOfConfirmation: null,
        dateOfJoining: null,
        address1: null,
        address2: null,
        country: null,
        state: null,
        city: null,
        zipCode: null,

        accountName: null,
        bankName: null,
        accountNmumber: null,
        pensionManager: null,
        pensionNumber: null,
        nok_legalName: null,
        nok_address: null,
        nok_occupation: null,
        nok_phoneNumber: null,
        nok_relationship: null,
        nok_email: null,

        gua_legalName: null,
        gua_address: null,
        gua_occupation: null,
        gua_phoneNumber: null,
        gua_relationship: null,
        gua_email: null,

        hierarchy_position: null,
        organizationId: orgID,
        org_BranchId: null,

        departmentId: null,
        org_ClienteleId: null,

        teamId: null,
        payGradeId: null,


        payGroupId: null,
        payroll_PreviewId: null,

        createdBy: creatorEmail,
        modifiedBy: null,

        createdDate: new Date(), // Assuming current date
        modifiedDate: new Date() // Assuming current date
      };
    });
  }

  calculateEmployeePension(dto: EmployeePayrollPreviewDto) {
    let total = dto.basic_salary + dto.housing + dto.transportation;
    return total * 0.08;
  }

  calculateEmployerPension(dto: EmployeePayrollPreviewDto) {
    let total = dto.basic_salary + dto.housing + dto.transportation;
    return total * 0.10;
  }

  calculateTotalDeductions(dto: EmployeePayrollPreviewDto) {
    return dto.employer_Pension + dto.employee_Pension;
  }
}
