import { Injectable } from "@nestjs/common";

import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class EmployeeOrganizationService {

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
  ) {}

  async findOrgInfo(orgID) {
    return this.orgHelperService.findOrgByID(orgID);
  }

}
