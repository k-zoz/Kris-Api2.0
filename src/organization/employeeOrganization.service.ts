import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { EmployeeOrganizationHelperService } from "@organization/helper-services/employee-organization-helper.service";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/services/organization.service";

@Injectable()
export class EmployeeOrganizationService {
  private readonly logger = new Logger(EmployeeOrganizationService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly employeeOrgHelperService: EmployeeOrganizationHelperService,
              private readonly utilService: UtilService,
              private readonly organizationService: OrganizationService
  ) {
  }

  async addDepartments(dto, orgID) {
    await this.utilService.isEmpty(dto.deptName)
    await this.organizationService.findOrgByID(orgID);
    dto.deptName = this.utilService.toUpperCase(dto.deptName);
    await this.employeeOrgHelperService.findDeptDuplicates(dto, orgID);
    return await this.employeeOrgHelperService.addDepartmentToOrg(dto, orgID);
  }

  async addTeams(dto, orgID, deptID) {
    await this.utilService.isEmpty(dto.teamName)
    await this.organizationService.findOrgByID(orgID);
    dto.teamName = this.utilService.toUpperCase(dto.teamName);
    await this.employeeOrgHelperService.findTeamDuplicates(dto, orgID);
    const department = await this.employeeOrgHelperService.findDept(deptID, orgID);
    return await this.employeeOrgHelperService.addTeamToOrg(dto, orgID, department);
  }

  async findOrgInfo(orgID) {
    return this.organizationService.findOrgByID(orgID);
  }

}
