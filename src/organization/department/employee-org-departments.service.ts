import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/org-dept-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class EmployeeOrgDepartmentsService {
  private readonly logger = new Logger(EmployeeOrgDepartmentsService.name)

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly departmentHelperService:OrgDeptPrismaHelperService
  ) {}


  async addDepartment(dto, orgID) {
    await this.utilService.isEmpty(dto.deptName);
    await this.orgHelperService.findOrgByID(orgID);
    dto.deptName = this.utilService.toUpperCase(dto.deptName);
    await this.departmentHelperService.findDeptDuplicates(dto, orgID);
    return await this.departmentHelperService.addDepartmentToOrg(dto, orgID);
  }


  async forceRemoveDept(orgID, deptID){
    await this.orgHelperService.findOrgByID(orgID)
    await this.departmentHelperService.findDept(deptID, orgID)
    return await this.departmentHelperService.hardRemoveDeptFromOrg(orgID, deptID)
  }


  async softRemoveDept(orgID, deptID){
    await this.orgHelperService.findOrgByID(orgID)
    await this.departmentHelperService.findDept(deptID, orgID)
    return await this.departmentHelperService.softRemoveDeptFromOrg(orgID, deptID)
  }


  async allDepartments(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.departmentHelperService.findAllDepts(orgID, searchRequest);
  }
}
