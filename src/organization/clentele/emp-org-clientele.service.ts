import { Injectable, Logger } from "@nestjs/common";
import { CreateClienteleDto } from "@core/dto/global/branch.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmpClienteleHelperService } from "@organization/org-prisma-helper-services/emp-clientele-helper.service";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmpOrgClienteleService {

  private readonly logger = new Logger(EmpOrgClienteleService.name);

  constructor(private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly clienteleHelperService: EmpClienteleHelperService,
              private readonly utilService:UtilService
  ) {
  }

  async onboardClienteleToOrg(dto: CreateClienteleDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name)
    await this.clienteleHelperService.validateDtoRequest(dto);
    return await this.clienteleHelperService.createClientele(dto, orgID, email);
  }

  async allClientele(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.clienteleHelperService.findAllClients(orgID, searchRequest);
  }

  async oneClientele(orgID: string, clienteleID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.clienteleHelperService.findClient(clienteleID, orgID);
  }
}
