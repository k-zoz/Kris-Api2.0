import { Injectable, Logger } from "@nestjs/common";
import { AppException, AppNotFoundException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";
import * as argon from "argon2";
import { prismaExclude } from "@prisma/prisma-utils";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";
import { RoleToEmployee, CreateEmployeeDto } from "@core/dto/global/employee.dto";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { AppConst } from "@core/const/app.const";
import { AuthMsg } from "@core/const/security-msg-const";
import { LocaleService } from "@locale/locale.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmployeeService {

  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly employeeHelperService: EmployeeHelperService,
              private readonly utilService: UtilService,
              private readonly organizationService: OrganizationService,
              private readonly localeService: LocaleService
  ) {
  }


  async onboardEmp(request: CreateEmployeeDto, orgID, creatorMail) {
    await this.employeeHelperService.validateRequest(request);
    await this.organizationService.findOrgByID(orgID);
    request.createdBy = creatorMail;
    request.empPassword = await argon.hash(request.empPassword);
    await this.employeeHelperService.checkIfRoleIsManagement(request.employee_role);
    const employee = await this.employeeHelperService.createEmployee(request, orgID);
    return this.employeeHelperService.findAndExcludeFields(employee);
  }

  async findFirst(email: string) {
    const user = await this.prismaService.employee.findFirst({ where: { email } });
    if (!user) {
      this.logger.error(AuthMsg.INVALID_EMAIL_OR_PASSWORD);
      throw new AppNotFoundException(AuthMsg.INVALID_EMAIL_OR_PASSWORD);
    }
    return user;
  }


  async changeEmployeeRole(request: RoleToEmployee, orgID: string, empID: string, modifierEmail: any) {
    await this.organizationService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    await this.employeeHelperService.checkIfRoleIsManagement(request.employee_role);
    request.modifiedBy = modifierEmail;
    return await this.employeeHelperService.changeRole(request, empID);
  }


  async addMoreRolesToEmployee(request: RoleToEmployee, orgID: string, empID: string, modifierEmail: string) {
    await this.organizationService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    await this.employeeHelperService.checkIfRoleIsManagement(request.employee_role);
    await this.employeeHelperService.checkMaximumNumOfRoles(employee);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.addRolesToEmployee(request, empID);
  }

  async removeRoleFrmEmp(request: RoleToEmployee, orgID: string, empID: string, modifierEmail) {
    await this.organizationService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.removeRole(request, empID)
  }

  async validatePassword(emp, password: string): Promise<boolean> {
    return await argon.verify(emp.password, password);
  }

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.employee.update({
      where: { email },
      data: { refreshToken }
    });
  };

  async findAllEmployees(request: SearchRequest, orgID) {
    await this.organizationService.findOrgByID(orgID);
    const { skip, take } = request;
    try {
      const [employees, total] = await this.prismaService.$transaction([
          this.prismaService.organization.findFirst({
            where: { id: orgID },
            select: {
              employees: {
                select: prismaExclude("Employee", ["password", "refreshToken"])
              }
            },
            skip,
            take
          }),
          this.prismaService.organization.count({ where: { id: orgID } })
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, employees };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }
  }
}
