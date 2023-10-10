import { Injectable, Logger } from "@nestjs/common";
import { CreateOrgDto, EditOrgDto, MakeAnnouncementsDto } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";


@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService,
              private readonly employeeHelperService: EmployeePrismaHelperService
  ) {
  }

  async onboardOrganization(org: CreateOrgDto, creatorEmail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    org.createdBy = creatorEmail;
    org.orgDateFounded = this.utilService.convertDateAgain(org.orgDateFounded);
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
    return await this.orgHelperService.findAllOrganizations(request);
  }

  async makeAnnouncements(dto: MakeAnnouncementsDto, orgID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const announcer = await this.employeeHelperService.findEmpByEmail(email);
    return await this.orgHelperService.makeAnnouncementPost(announcer, dto);

  }

  async myAnnouncements(email: string) {
    const employee = await this.employeeHelperService.findEmpByEmail(email);
    const organization = await this.orgHelperService.findOrgByID(employee.organizationId);
    return await this.orgHelperService.allMyOrganizationAnnouncements(employee, organization);
  }
}

