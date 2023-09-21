import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import {
  OrgTeamPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-team-prisma-helper.service";
import {
  OrgDeptPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { CreateTeamInDepartmentDto, DepartmentNameSearchDto, TeamLeadDto } from "@core/dto/global/organization.dto";

@Injectable()
export class OrgTeamService {
  private readonly logger = new Logger(OrgTeamService.name);

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly orgTeamHelperService: OrgTeamPrismaHelperService,
              private readonly orgDeptHelperService: OrgDeptPrismaHelperService
  ) {
  }


  async addTeam(dto: CreateTeamInDepartmentDto, orgID, creatorEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.teamName = this.utilService.toUpperCase(dto.teamName);
    dto.departmentName = this.utilService.toUpperCase(dto.departmentName);
    const department = await this.orgDeptHelperService.findDeptByName(dto, orgID);
    await this.orgTeamHelperService.findTeamDuplicates(dto, department);
    return await this.orgTeamHelperService.addTeamToDepartment(dto, orgID, department, creatorEmail);
  }

  async allTeams(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.orgTeamHelperService.findAllTeams(orgID, searchRequest);
  }

  async allTeamLeads(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.orgTeamHelperService.findAllTeamLeads(orgID, searchRequest);
  }

  async allTeamsInDept(orgID: string, dto: DepartmentNameSearchDto) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.departmentName = this.utilService.toUpperCase(dto.departmentName);
    const department = await this.orgDeptHelperService.findDeptByName(dto, orgID);
    return await this.orgTeamHelperService.findAllTeamsInADepartment(orgID, department, dto);
  }

  async allEmployeesInATeam(orgID: string, teamID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgTeamHelperService.findTeamByID(orgID, teamID);
    return await this.orgTeamHelperService.allEmployeesInTeam(orgID, teamID);
  }


  async employeeAsTeamLead(orgID: string, teamID: string, empID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpById(empID);
    const team = await this.orgTeamHelperService.findTeamByID(orgID, teamID);
    await this.orgTeamHelperService.checkIfEmployeeIsInTeam(team, employee);
    return await this.orgTeamHelperService.makeEmployeeTeamLead(team, employee);

  }

  async removeEmployeeAsTeamLead(orgID: string, empID: string, teamID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpById(empID);
    const team = await this.orgTeamHelperService.findTeamByID(orgID, teamID);
    await this.orgTeamHelperService.confirmIfEmployeeIsTeamLead(team, employee);
    return await this.orgTeamHelperService.removeTeamLead(team, employee);
  }

  async allTeamMembers(orgID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpByEmail(email);
    await this.orgTeamHelperService.checkIfEmployeeBelongsToAnyTeam(employee);
    return await this.allEmployeesInATeam(orgID, employee.teamId);
  }

  async makeTeamLeadWithEmail(dto: TeamLeadDto, orgID: string, teamID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const team = await this.orgTeamHelperService.findTeamByID(orgID, teamID);
    const employee = await this.employeeService.findEmpByEmail(dto.email);
    await this.orgTeamHelperService.checkIfTeamLeadBelongsToTeam(employee, team);
    return await this.orgTeamHelperService.makeEmployeeTeamLead(team, employee, organization);
  }
}
