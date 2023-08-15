import { Injectable, Logger } from "@nestjs/common";
import { CreateOrgDto, EditOrgDto } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";


@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly utilService:UtilService
  ) {
  }

  async onboardOrganization(org: CreateOrgDto, creatorEmail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    org.createdBy = creatorEmail;
    org.orgDateFounded = this.utilService.convertLeaveDate(org.orgDateFounded)
    org.orgKrisId = this.utilService.generateUUID(org.orgName);
    return this.orgHelperService.saveOrganizationAndSendWelcomeEmail(org, creatorEmail);
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

