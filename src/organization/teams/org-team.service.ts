import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { OrgTeamPrismaHelperService } from "@organization/org-prisma-helper-services/org-team-prisma-helper.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/org-dept-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

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


  async addTeam(dto, orgID, deptID) {
    await this.utilService.isEmpty(dto.teamName);
    await this.orgHelperService.findOrgByID(orgID);
    dto.teamName = this.utilService.toUpperCase(dto.teamName);
    await this.orgTeamHelperService.findTeamDuplicates(dto, orgID);
    const department = await this.orgDeptHelperService.findDept(deptID, orgID);
    return await this.orgTeamHelperService.addTeamToOrg(dto, orgID, department);
  }

  async allTeams(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.orgTeamHelperService.findAllTeams(orgID, searchRequest);
  }

  async allTeamLeads(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.orgTeamHelperService.findAllTeamLeads(orgID, searchRequest);
  }
}
