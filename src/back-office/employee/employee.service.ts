import { Injectable, Logger } from "@nestjs/common";
import * as argon from "argon2";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { RoleToEmployee, CreateEmployeeDto, EditEmployeeDto } from "@core/dto/global/employee.dto";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";


@Injectable()
export class EmployeeService {

  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
  ) {}


  async createOrgMgtEmployee(orgEmp: CreateEmployeeDto, orgID, creatorMail) {
    await this.employeeHelperService.validateRequest(orgEmp);
    await this.orgHelperService.findOrgByID(orgID);
    orgEmp.createdBy = creatorMail;
    orgEmp.empPassword = await argon.hash(orgEmp.empPassword);
    const employee = await this.employeeHelperService.createEmployee(orgEmp, orgID);
    return this.employeeHelperService.findAndExcludeFields(employee);
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
    await this.utilService.checkIfRoleIsManagement(request.employee_role);
    await this.employeeHelperService.checkMaximumNumOfRoles(employee);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.addRolesToEmployee(request, empID);
  }


  async editEmployeeProfile(request: EditEmployeeDto, orgID: string, payload: AuthPayload) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.employeeHelperService.findEmpByEmail(payload.email);
    await this.utilService.isEmpty(request)
    await this.employeeHelperService.validateRequest(request)
    request.empPassword = await argon.hash(request.empPassword)
    await this.employeeHelperService.editEmployee(payload.email, request);
  }


  async removeRoleFrmEmp(request: RoleToEmployee, orgID: string, empID: string, modifierEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    request.modifiedBy = modifierEmail;
    return this.employeeHelperService.removeRole(request, empID);
  }

  async validatePassword(emp, password: string): Promise<boolean> {
    return await argon.verify(emp.password, password);
  }

  async findAllEmployees(request: SearchRequest, orgID:string) {
    await this.orgHelperService.findOrgByID(orgID);
    return  await this.employeeHelperService.findAllEmployeesInOrg(request, orgID)

  }
}
