import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { OrgEmpPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-emp-prisma-helper.service";
import { OrgTeamPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-team-prisma-helper.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import { CreateEmployeeDto, EmployeeOnboardRequest } from "@core/dto/global/employee.dto";
import * as argon from "argon2";
import { LeaveService } from "@organization/leave/leave.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EnumValues } from "enum-values";
import { BoStatusEnum, UserRoleEnum } from "@core/enum/user-role-enum";
import { CodeValue } from "@core/dto/global/code-value";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import { EmpClienteleHelperService } from "@organization/org-prisma-helper-services/organization/emp-clientele-helper.service";

@Injectable()
export class OrgEmployeeService {
  private readonly logger = new Logger(OrgEmployeeService.name);

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly orgEmployeeHelperService: OrgEmpPrismaHelperService,
              private readonly orgTeamHelperService: OrgTeamPrismaHelperService,
              private readonly orgDeptHelperService: OrgDeptPrismaHelperService,
              private readonly leaveService: LeaveService,
              private readonly orgBranchHelperService: OrgBranchPrismaHelperService,
              private readonly orgDepartmentHelperService: OrgDeptPrismaHelperService,
              private readonly orgClientHelperService: EmpClienteleHelperService
  ) {
  }


  // async onboardEmpToMyOrg(request: CreateEmployeeDto, orgID, creatorMail) {
  //   await this.orgEmployeeHelperService.validateRequest(request);
  //   const orgName = await this.orgHelperService.findOrgByID(orgID);
  //   request.createdBy = creatorMail;
  //   request.empPassword = this.utilService.generateRandomPassword();
  //   request.empFirstName = this.utilService.toUpperCase(request.empFirstName);
  //   request.empLastName = this.utilService.toUpperCase(request.empLastName);
  //   await this.utilService.checkIfRoleIsManagement(request.employee_role);
  //   const employee = await this.employeeHelperService.createEmployeeAndSendWelcomeEmail(request, orgID, orgName);
  //   //TODO leave onboarding for new employee
  //   await this.leaveService.onboardLeaveForNewEmployee(orgID, employee);
  //   // return this.employeeHelperService.findAndExcludeFields(employee);
  // }


  async onboardEmpToMyOrg(request: EmployeeOnboardRequest, orgID, creatorMail) {
    await this.orgEmployeeHelperService.validateRequest(request);
    const orgName = await this.orgHelperService.findOrgByID(orgID);
    const newPassword = this.utilService.generateRandomPassword();
    request.basic.firstName = this.utilService.toUpperCase(request.basic.firstName);
    request.basic.lastName = this.utilService.toUpperCase(request.basic.lastName);
    request.work.employeeBranch = this.utilService.toUpperCase(request.work.employeeBranch);
    request.work.department = this.utilService.toUpperCase(request.work.department);
    request.work.empTeam = this.utilService.toUpperCase(request.work.empTeam);
    request.work.employeeClient = this.utilService.toUpperCase(request.work.employeeClient)
    request.work.dateOfConfirmation = this.utilService.convertDate(request.work.dateOfConfirmation);
    request.work.dateOfJoining = this.utilService.convertDate(request.work.dateOfJoining);
    request.basic.krisID = this.utilService.generateUUID(request.basic.firstName);
    const branch = await this.orgBranchHelperService.findBranchByName(request.work.employeeBranch, orgID);
    const department = await this.orgDepartmentHelperService.findDeptByNameAlone(request.work.department, orgID);
    const client = await this.orgClientHelperService.findClientByName(request.work.employeeClient, orgID);
    await this.orgTeamHelperService.findTeamByName(department.id, orgID, request.work.empTeam);
    await this.utilService.checkIfRoleIsManagement(request.work.employeeKrisRole);
    return await this.employeeHelperService.createNewEmployeeAndSendWelcomeMail(request, newPassword, creatorMail, orgName, client);
    // //TODO leave, onboarding, appraisals for new employee
    // await this.leaveService.onboardLeaveForNewEmployee(orgID, employee);
  }


  async addEmployeeToATeam(orgID, teamID, empID, deptID) {
    await this.employeeService.findEmpById(empID);
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
    await this.orgEmployeeHelperService.checkIfEmpIsAlreadyTeamMember(empID, teamID);
    return await this.orgEmployeeHelperService.addEmpToTeam(empID, teamID);
  }

  async addEmpToDept(deptID, orgID, empID) {
    await this.employeeService.findEmpById(empID);
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgDeptHelperService.findDept(deptID, orgID);
    await this.orgEmployeeHelperService.checkIfEmpIsAlreadyInDept(empID, deptID);
    return await this.orgEmployeeHelperService.addEmpToDept(empID, deptID);
  }

  // async addEmployeeAsTeamLead(orgID, teamID, empID, deptID) {
  //   await this.employeeService.findEmpById(empID);
  //   await this.orgHelperService.findOrgByID(orgID);
  //   await this.orgTeamHelperService.findTeamDept(teamID, deptID);
  //   await this.orgEmployeeHelperService.findEmpDept(empID, deptID);
  //   await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
  //   await this.orgEmployeeHelperService.findEmpTeam(teamID, empID);
  //   await this.orgEmployeeHelperService.isEmployeeTeamLeadValidation(empID, teamID);
  //   return await this.orgEmployeeHelperService.makeEmpTeamLead(empID, teamID, orgID);
  // }

  // async removeEmployeeAsTeamLead(orgID, teamID, empID, deptID){
  //   await this.orgHelperService.findOrgByID(orgID);
  //   await this.employeeService.findEmpById(empID);
  //   await this.orgEmployeeHelperService.findEmpDept(empID, deptID);
  //   await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
  //   await this.orgEmployeeHelperService.findEmpTeam(teamID, empID);
  //   await this.orgTeamHelperService.findTeamDept(teamID, deptID);
  //   await this.orgEmployeeHelperService.isEmployeeTeamLeadVerification(empID, teamID);
  //   return await this.orgEmployeeHelperService.removeEmpTeamLead(empID, teamID, orgID);
  // }

  async resetEmployeePassword(orgID, empID, modifierEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    const newPassword = this.utilService.generateRandomPassword();
    return await this.orgHelperService.resetEmpPasswordAndSendResetMail(empID, modifierEmail, newPassword);
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(EmployeeRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }

  empStatus() {
    return EnumValues.getNamesAndValues(BoStatusEnum).map(value => CodeValue.of(value.name, value.value as string));
  }
}
