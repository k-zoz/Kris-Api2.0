import { Injectable, Logger } from "@nestjs/common";
import {
  PayGroupPrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/pay-group-prisma-helper.service";
import { CreatePayGroupDto, PayGroupDto } from "@core/dto/global/Payroll.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class PayGroupService {
  private readonly logger = new Logger(PayGroupService.name);

  constructor(private readonly payGroupHelperService: PayGroupPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async createPayGroup(dto: CreatePayGroupDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.payGroupHelperService.validateRequest(dto)
    return await this.payGroupHelperService.create(dto, orgID, email)
  }

  async getPayGroups(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.payGroupHelperService.findAllPayGroups(orgID, searchRequest)
  }

  async getPayGroupById(orgID: string, payGroupID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.payGroupHelperService.findPayGroupWithID(payGroupID, orgID)
  }

  async getPayGroupByName(orgID: string, dto: PayGroupDto) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    return await this.payGroupHelperService.findPayGroupByName(orgID, dto)
  }

  async deletePayGroup(orgID: string, payGroupID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payGroupHelperService.findPayGroupWithID(payGroupID, orgID)
    return await this.payGroupHelperService.deletePayGroup(payGroupID,orgID)
  }
}
