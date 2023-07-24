import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { EmployeeOrganizationHelperService } from "@organization/helper-services/employee-organization-helper.service";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/services/organization.service";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";

@Injectable()
export class EmployeeOrganizationService {
  private readonly logger = new Logger(EmployeeOrganizationService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly employeeOrgHelperService: EmployeeOrganizationHelperService,
              private readonly utilService: UtilService,
              private readonly organizationService: OrganizationService,
              private readonly employeeService: EmployeeHelperService
  ) {
  }

  async addDepartment(dto, orgID) {
    await this.utilService.isEmpty(dto.deptName);
    await this.organizationService.findOrgByID(orgID);
    dto.deptName = this.utilService.toUpperCase(dto.deptName);
    await this.employeeOrgHelperService.findDeptDuplicates(dto, orgID);
    return await this.employeeOrgHelperService.addDepartmentToOrg(dto, orgID);
  }

  async addTeam(dto, orgID, deptID) {
    await this.utilService.isEmpty(dto.teamName);
    await this.organizationService.findOrgByID(orgID);
    dto.teamName = this.utilService.toUpperCase(dto.teamName);
    await this.employeeOrgHelperService.findTeamDuplicates(dto, orgID);
    const department = await this.employeeOrgHelperService.findDept(deptID, orgID);
    return await this.employeeOrgHelperService.addTeamToOrg(dto, orgID, department);
  }

  async addEmployeeToATeam(orgID, teamID, empID, deptID) {
    await this.employeeService.findEmpById(empID);
    await this.organizationService.findOrgByID(orgID);
    await this.employeeOrgHelperService.findTeam(deptID, orgID, teamID);
    await this.employeeOrgHelperService.checkIfEmpIsAlreadyTeamMember(empID, teamID);
    return await this.employeeOrgHelperService.addEmpToTeam(empID, teamID);
  }

  async addEmpToDept(deptID, orgID, empID) {
    await this.employeeService.findEmpById(empID);
    await this.organizationService.findOrgByID(orgID);
    await this.employeeOrgHelperService.findDept(deptID, orgID);
    await this.employeeOrgHelperService.checkIfEmpIsAlreadyInDept(empID, deptID);
    return await this.employeeOrgHelperService.addEmpToDept(empID,deptID )
  }

  async addEmployeeAsTeamLead(orgID, teamID, empID, deptID) {
    await this.employeeService.findEmpById(empID);
    await this.organizationService.findOrgByID(orgID);
    await this.employeeOrgHelperService.findTeam(deptID, orgID, teamID);
    await this.employeeOrgHelperService.findEmpTeam(teamID, empID);
    await this.employeeOrgHelperService.findEmpDept(empID, deptID);
    await this.employeeOrgHelperService.findTeamDept(teamID, deptID);
    await this.employeeOrgHelperService.isEmployeeTeamLead(empID, teamID)
    return await this.employeeOrgHelperService.makeEmpTeamLead(empID, teamID)
  }

  async findOrgInfo(orgID) {
    return this.organizationService.findOrgByID(orgID);
  }

}
