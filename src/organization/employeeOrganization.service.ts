import { Injectable, Logger } from "@nestjs/common";

import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class EmployeeOrganizationService {
  private readonly logger = new Logger(EmployeeOrganizationService.name);

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
  ) {}

  async findOrgInfo(orgID) {
    return this.orgHelperService.findOrgByID(orgID);
  }

}
