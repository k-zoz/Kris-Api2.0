import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import {
  CreateDepartmentInBranchDto,
  DepartmentNameSearchDto,
  SearchBranchNameOrCodeDto
} from "@core/dto/global/organization.dto";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";

@Injectable()
export class EmployeeOrgDepartmentsService {
  private readonly logger = new Logger(EmployeeOrgDepartmentsService.name)

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly departmentHelperService:OrgDeptPrismaHelperService,
              private readonly branchHelperService:OrgBranchPrismaHelperService
  ) {}


  async addDepartment(dto:CreateDepartmentInBranchDto, orgID, creatorEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.branchHelperService.findBranchBranchCode(dto.branchCode, orgID)
    await this.departmentHelperService.findDeptDuplicates(dto);
    return await this.departmentHelperService.addDepartmentToBranch(dto, orgID, creatorEmail);
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

  async allDepartmentsInBranch(orgID: string, searchRequest: SearchBranchNameOrCodeDto) {
    await this.orgHelperService.findOrgByID(orgID);
    searchRequest.name = this.utilService.toUpperCase(searchRequest.name)
    await this.branchHelperService.findBranchByName(searchRequest.name,orgID)
    return await this.departmentHelperService.findAllDeptsInBranch(orgID, searchRequest)
  }
}
