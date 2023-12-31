import { Injectable, Logger } from "@nestjs/common";
import * as argon from "argon2";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { RoleToEmployee, CreateEmployeeDto, EditEmployeeDto, CreateMgtEmpDto } from "@core/dto/global/employee.dto";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { CodeValue } from "@core/dto/global/code-value";
import { EnumValues } from "enum-values";
import { BoStatusEnum, UserRoleEnum } from "@core/enum/user-role-enum";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";


@Injectable()
export class EmployeeService {

  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService
  ) {
  }


  async createOrgMgtEmployee(dto: CreateMgtEmpDto, orgID, creatorMail) {
    await this.employeeHelperService.validateRequest(dto);
    const org = await this.orgHelperService.findOrgByID(orgID);
    dto.empFirstName = this.utilService.toUpperCase(dto.empFirstName);
    dto.empLastName = this.utilService.toUpperCase(dto.empLastName);
    dto.empEmail = this.utilService.toLowerCase(dto.empEmail);
    dto.createdBy = creatorMail;
    dto.empPassword = this.utilService.generateRandomPassword();
    dto.orgKrisId = this.utilService.generateUUID(dto.empFirstName);
     return await this.employeeHelperService.createEmployeeAndSendWelcomeEmail(dto, orgID, org.orgName);

  }


  async changeEmployeeRole(request: RoleToEmployee, orgID: string, empID: string, modifierEmail: any) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    await this.utilService.checkIfRoleIsManagement(request.employee_role);
    request.modifiedBy = modifierEmail;
    return await this.employeeHelperService.changeRole(request, empID);
  }

  async addMoreRolesToEmployee(request: RoleToEmployee, orgID: string, empID: string, modifierEmail: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    await this.employeeHelperService.checkIfEmployeeAlreadyHaveRole(request.employee_role, employee);
    await this.utilService.checkIfRoleIsManagement(request.employee_role);
    await this.employeeHelperService.checkMaximumNumOfRoles(employee);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.addRolesToEmployee(request, empID);
  }


  async editEmployeeProfile(request: EditEmployeeDto, orgID: string, payload: AuthPayload) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.employeeHelperService.findEmpByEmail(payload.email);
    await this.utilService.isEmpty(request);
    await this.employeeHelperService.validateRequest(request);
    request.empPassword = await argon.hash(request.empPassword);
    await this.employeeHelperService.editEmployee(payload.email, request);
  }


  async removeRoleFrmEmp(request: RoleToEmployee, orgID: string, empID: string, modifierEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    await this.employeeHelperService.checkMinimumNumOfRoles(employee);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.removeRole(request, empID);
  }

  async validatePassword(emp, password: string): Promise<boolean> {
    return await argon.verify(emp.password, password);
  }

  async findAllEmployees(request: SearchRequest, orgID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.employeeHelperService.findAllEmployeesInOrg(request, orgID);

  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(EmployeeRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }

  async findOneEmployee(orgID: string, empID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.employeeHelperService.findOneEmpAndExclude(empID);
  }

  empStatus() {
    return EnumValues.getNamesAndValues(BoStatusEnum).map(value => CodeValue.of(value.name, value.value as string));
  }
}
