import { Injectable, Logger } from "@nestjs/common";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { SearchRequest } from "@core/model/search-request";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class EmpOrgBranchService {
  private readonly logger = new Logger(EmpOrgBranchService.name);

  constructor(private readonly branchHelperService: OrgBranchPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService:UtilService
  ) {
  }


  async onboardBranchToOrg(dto: CreateBranchDto, orgID: string, creatorEmail: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name)
    await this.branchHelperService.validateDtoRequest(dto);
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

  async allBranchCodes(orgID: string,searchRequest:SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.branchHelperService.findAllBranchCodes(orgID, searchRequest)
  }
}
