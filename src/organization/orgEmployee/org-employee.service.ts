import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { OrgEmpPrismaHelperService } from "@organization/org-prisma-helper-services/org-emp-prisma-helper.service";
import { OrgTeamPrismaHelperService } from "@organization/org-prisma-helper-services/org-team-prisma-helper.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/org-dept-prisma-helper.service";
import { CreateEmployeeDto } from "@core/dto/global/employee.dto";
import * as argon from "argon2";
import { LeaveService } from "@organization/leave/leave.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class OrgEmployeeService {
  private readonly logger = new Logger(OrgEmployeeService.name)

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly employeeHelperService:EmployeePrismaHelperService,
              private readonly orgEmployeeHelperService:OrgEmpPrismaHelperService,
              private readonly orgTeamHelperService:OrgTeamPrismaHelperService,
              private readonly orgDeptHelperService:OrgDeptPrismaHelperService,
              private readonly leaveService:LeaveService
              ) {}


  async onboardEmpToMyOrg(request: CreateEmployeeDto, orgID, creatorMail) {
    await this.orgEmployeeHelperService.validateRequest(request);
    await this.orgHelperService.findOrgByID(orgID);
    request.createdBy = creatorMail;
    request.empPassword = await argon.hash(request.empPassword);
    await this.utilService.checkIfRoleIsManagement(request.employee_role);
    const employee = await this.employeeHelperService.createEmployee(request, orgID);
    //TODO leave onboarding for new employee
    await this.leaveService.onboardLeaveForNewEmployee(orgID, employee)
    return this.employeeHelperService.findAndExcludeFields(employee);
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

  async addEmployeeAsTeamLead(orgID, teamID, empID, deptID) {
    await this.employeeService.findEmpById(empID);
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgTeamHelperService.findTeamDept(teamID, deptID);
    await this.orgEmployeeHelperService.findEmpDept(empID, deptID);
    await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
    await this.orgEmployeeHelperService.findEmpTeam(teamID, empID);
    await this.orgEmployeeHelperService.isEmployeeTeamLeadValidation(empID, teamID);
    return await this.orgEmployeeHelperService.makeEmpTeamLead(empID, teamID, orgID);
  }

  async removeEmployeeAsTeamLead(orgID, teamID, empID, deptID){
    await this.orgHelperService.findOrgByID(orgID);
    await this.employeeService.findEmpById(empID);
    await this.orgEmployeeHelperService.findEmpDept(empID, deptID);
    await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
    await this.orgEmployeeHelperService.findEmpTeam(teamID, empID);
    await this.orgTeamHelperService.findTeamDept(teamID, deptID);
    await this.orgEmployeeHelperService.isEmployeeTeamLeadVerification(empID, teamID);
    return await this.orgEmployeeHelperService.removeEmpTeamLead(empID, teamID, orgID);
  }
}
