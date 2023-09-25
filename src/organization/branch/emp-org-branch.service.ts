import { Injectable, Logger } from "@nestjs/common";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { SearchRequest } from "@core/model/search-request";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";

@Injectable()
export class EmpOrgBranchService {
  private readonly logger = new Logger(EmpOrgBranchService.name);

  constructor(private readonly branchHelperService: OrgBranchPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async onboardBranchToOrg(dto: CreateBranchDto, orgID: string, creatorEmail: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.branchHelperService.validateDtoRequest(dto, orgID);
    return await this.branchHelperService.createBranch(dto, orgID, creatorEmail);
  }


  async allBranches(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.branchHelperService.findAllBranches(orgID, searchRequest);
  }

  async oneBranch(orgID: string, branchID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.branchHelperService.findBranch(branchID, orgID);
  }

  async allBranchCodes(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.branchHelperService.findAllBranchCodes(orgID, searchRequest);
  }

  async myBranchMembers(orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(email)
    await this.branchHelperService.checkIfEmployeeBelongsToAnyBranch(employee)
    return await this.branchHelperService.findAllEmployees(employee.org_BranchId)
  }

  async employeesInBranch(orgID: string, branchID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.branchHelperService.findBranch(branchID, orgID);
    return await this.branchHelperService.findAllEmployees(branchID);
  }

  async makeBranchManager(orgID: string, branchID: string, empID: string) {
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.organizationHelperService.findOrgByID(orgID);
    const branch = await this.branchHelperService.findBranch(branchID, orgID);
    await this.branchHelperService.isEmployeeABranchMember(employee, branchID, orgID);
    return await this.branchHelperService.makeEmployeeBranchManager(employee, branch, orgID);
  }

  async removeAsBranchManger(orgID: string, branchID: string, empID: string) {
    const employee = await this.employeeHelperService.findEmpById(empID);
    await this.organizationHelperService.findOrgByID(orgID);
    const branch = await this.branchHelperService.findBranch(branchID, orgID);
    await this.branchHelperService.confirmIfEmployeeIsBranchManager(employee, branch);
    return await this.branchHelperService.removeEmployeeAsBranchManager(employee, branch);
  }

  async allBranchManagers(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.branchHelperService.allBranchManagers(orgID, searchRequest)
  }


}
