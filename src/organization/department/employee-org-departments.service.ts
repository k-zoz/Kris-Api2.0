import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import {
  OrgDeptPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import {
  CreateDepartmentInBranchDto,
  DepartmentNameSearchDto, HeadOFDepartmentDto,
  SearchBranchNameOrCodeDto
} from "@core/dto/global/organization.dto";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmployeeOrgDepartmentsService {
  private readonly logger = new Logger(EmployeeOrgDepartmentsService.name);

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly departmentHelperService: OrgDeptPrismaHelperService,
              private readonly branchHelperService: OrgBranchPrismaHelperService
  ) {
  }


  async addDepartment(dto: CreateDepartmentInBranchDto, orgID, branchID, creatorEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    const branch = await this.branchHelperService.findBranch(branchID, orgID);
    await this.departmentHelperService.findDeptDuplicates(dto, branchID);
    return await this.departmentHelperService.addDepartmentToBranch(dto, branch, orgID, creatorEmail);
  }


  async softRemoveDept(orgID, deptID) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.departmentHelperService.findDept(deptID, orgID);
    return await this.departmentHelperService.softRemoveDeptFromOrg(orgID, deptID);
  }


  async allDepartments(orgID, searchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.departmentHelperService.findAllDepts(orgID, searchRequest);
  }

  async allDepartmentsInBranch(orgID: string, searchRequest: SearchBranchNameOrCodeDto) {
    await this.orgHelperService.findOrgByID(orgID);
    searchRequest.name = this.utilService.toUpperCase(searchRequest.name);
    await this.branchHelperService.findBranchByName(searchRequest.name, orgID);
    return await this.departmentHelperService.findAllDeptsInBranch(orgID, searchRequest);
  }

  async employeesInDepartment(orgID: string, deptID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.departmentHelperService.findDept(deptID, orgID);
    return await this.departmentHelperService.allEmployeesInDepartment(orgID, deptID);
  }

  async employeeHeadOfDepartment(orgID: string, deptID: string, empID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const department = await this.departmentHelperService.findDept(deptID, orgID);
    const employee = await this.employeeService.findEmpById(empID);
    await this.departmentHelperService.isEmployeeAMemberOfDepartment(employee, department);
    return await this.departmentHelperService.makeEmployeeHOD(employee, department);
  }

  async headOfDepartment(dto: HeadOFDepartmentDto, orgID: string, deptID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpByEmail(dto.email);
    const department = await this.departmentHelperService.findDept(deptID, orgID);
    await this.departmentHelperService.isEmployeeAMemberOfDepartment(employee, department);
    return await this.departmentHelperService.makeEmployeeHOD(employee, department, organization);

  }

  async removeEmployeeAsHeadOfDept(orgID: string, empID: string, deptID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const department = await this.departmentHelperService.findDept(deptID, orgID);
    const employee = await this.employeeService.findEmpById(empID);
    await this.departmentHelperService.confirmIfEmployeeIsHeadOfDepartment(employee, department);
    return await this.departmentHelperService.removeEmployeeAsHOD(employee, department);

  }

  async allHODs(orgID: string, searchRequest: SearchRequest) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.departmentHelperService.getAllHeadOfDepartments(orgID, searchRequest);
  }

  async allDepartmentsInBranchWithID(orgID: string, branchID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const branch = await this.branchHelperService.findBranch(branchID, orgID);
    return await this.departmentHelperService.getAllDepartmentsInBranch(branch, orgID);
  }


  async departmentRequests(email: string) {
    const employee = await this.employeeService.findEmpByEmail(email);
    await this.departmentHelperService.checkIfEmployeeHasADepartment(employee);
    const department = await this.departmentHelperService.findDept(employee.departmentId, employee.organizationId);
    await this.departmentHelperService.confirmIfEmployeeIsHeadOfDepartment(employee, department);
    return await this.departmentHelperService.allDepartmentRequests(employee, department);
  }
}
