import { Injectable, Logger } from "@nestjs/common";
import { AllowancesHelperService } from "@organization/org-prisma-helper-services/payroll/allowances-helper.service";
import { AllowanceDto, CreateAllowanceDto, EditAllowanceDto } from "@core/dto/global/Payroll.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class AllowancesService {
  private readonly logger = new Logger(AllowancesService.name);

  constructor(private readonly allowanceHelperService: AllowancesHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService
  ) {}


  async createAllowance(dto: CreateAllowanceDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.amount = this.utilService.convertAmount(dto.amount);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.allowanceHelperService.validateRequest(dto);
    return await this.allowanceHelperService.create(dto, orgID, email);
  }

  async allAllowancesInOrg(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.allowanceHelperService.findAllAllowances(orgID, searchRequest);
  }

  async getAllowanceOneAllowanceById(orgID: string, allowanceID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.allowanceHelperService.findOneAllowanceById(orgID, allowanceID);
  }

  async getAlllowanceByName(orgID: string, dto: AllowanceDto) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    return await this.allowanceHelperService.findOneAllowanceByName(orgID, dto);
  }

  async editAllowance(dto: EditAllowanceDto, allowanceID: string, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    dto.amount = this.utilService.convertAmount(dto.amount);
    await this.allowanceHelperService.findOneAllowanceById(orgID, allowanceID);
    return await this.allowanceHelperService.updateAllowance(dto, allowanceID, orgID, email);
  }

  async deleteAllowance(orgID: string, allowanceID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.allowanceHelperService.findOneAllowanceById(orgID, allowanceID);
    return await this.allowanceHelperService.deleteOneAllowance(orgID, allowanceID)
  }
}
