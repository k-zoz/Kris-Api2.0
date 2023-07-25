import { Injectable, Logger } from "@nestjs/common";
import { CreateOrgDto, EditOrgDto } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";


@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
  ) {
  }

  async onboardOrganization(org: CreateOrgDto, creatorEmail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    org.createdBy = creatorEmail;
    return this.orgHelperService.saveOrganization(org);
  }


  async editOrganization(org: EditOrgDto, id, modifierMail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    await this.orgHelperService.findOrgByID(id);
    org.modifiedBy = modifierMail;
    return this.orgHelperService.updateOrg(id, org);
  }


  async findAllOrg(request: SearchRequest) {
    return await this.orgHelperService.findAllOrganizations(request)
  }

}

