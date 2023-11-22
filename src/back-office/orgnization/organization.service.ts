import { Injectable, Logger } from "@nestjs/common";
import { CreateOrgDto, EditOrgDto, MakeAnnouncementsDto } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { HttpService } from "@nestjs/axios";
import * as moment from "moment";
import { ConfigService } from "@nestjs/config";
import { AppConflictException } from "@core/exception/app-exception";
import { HolidayDto } from "@core/dto/global/holiday";
import { ContactSupport } from "@core/dto/global/employee.dto";
import {
  OrgActivityLogPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-activity-log-prisma-helper.service";

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly orgActivityLogHelperService: OrgActivityLogPrismaHelperService,
              private readonly httpService: HttpService,
              private readonly config: ConfigService
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

  async allEmployeesCount(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.employeesCount(organization);
  }

  async employeeBirthdays(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.birthdays(organization);

  }

  async allHolidays(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.holidays(organization);
  }

  async orgMonthlyBirthDays(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.birthdaysInTheMonth(organization);
  }

  async orgMonthlyWorkAnniversary(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.anniversaryInTheMonth(organization);
  }

  async monthHolidays(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.holidaysInTheMonth(organization);
  }

  async employeeWorkAnniversary(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.anniversaries(organization);
  }

  async wikiTodayInHistory() {
    try {
      const today = moment();
      const month = today.format("MM");
      const day = today.format("DD");
      const wikiUrl = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`;
      const token = `Bearer ${this.config.get<string>("wikiAccessToken")}`;
      const response = await this.httpService.get(wikiUrl, {
        headers: { Authorization: token, "User-Agent": "kris info@kimberly-ryan.net" }
      }).toPromise();
      return response.data;
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Something went wrong please try again");
    }

  }

  async employeeStatistics(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgHelperService.employeeStatistics(organization);
  }

  async createHoliday(orgID: string, dto: HolidayDto, creatorEmail: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    dto.date = this.utilService.convertDateAgain(dto.date);
    return await this.orgHelperService.createHoliday(organization, dto, creatorEmail);
  }


  async contactBOSupport(dto: ContactSupport, email: string) {
    const employee = await this.employeeHelperService.findEmpByEmail(email);
    return await this.orgHelperService.sendSupportMessage(dto, employee);
  }

  async getAllOrgActivityLogs(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.orgActivityLogHelperService.myOrganizationActivityLog(organization);
  }

  async hideAnnouncements(announcementID, email: string) {
    const employee = await this.employeeHelperService.findEmpByEmail(email);
    const announcement = await this.orgHelperService.findMyAnnouncement(employee, announcementID);
    return await this.orgHelperService.hideMyAnnouncements(employee, announcement);
  }
}

