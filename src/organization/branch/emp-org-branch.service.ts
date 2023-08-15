import { Injectable, Logger } from "@nestjs/common";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/org-branch-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class EmpOrgBranchService {
  private readonly logger = new Logger(EmpOrgBranchService.name);

  constructor(private readonly branchHelperService: OrgBranchPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService
  ) {
  }


  async onboardBranchToOrg(dto: CreateBranchDto, orgID: string, creatorEmail: string) {
    await this.organizationHelperService.findOrgByID(orgID);

  }
}
