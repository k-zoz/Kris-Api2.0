import { Injectable, Logger } from "@nestjs/common";
import { OrgPrismaHelperService } from "@organization/org-prisma-helper-services/org-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";

@Injectable()
export class EmployeeOrganizationService {
  private readonly logger = new Logger(EmployeeOrganizationService.name);

  constructor(private readonly employeeOrgHelperService: OrgPrismaHelperService,
              private readonly organizationService: OrganizationService
  ) {
  }




  async findOrgInfo(orgID) {
    return this.organizationService.findOrgByID(orgID);
  }

}
