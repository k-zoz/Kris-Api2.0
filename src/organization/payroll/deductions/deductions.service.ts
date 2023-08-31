import { Injectable, Logger } from "@nestjs/common";
import { DeductionsHelperService } from "@organization/org-prisma-helper-services/payroll/deductions-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { CreateDeductionsDto, DeductionDto, EditDeductionDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class DeductionsService {
  private readonly logger = new Logger(DeductionsService.name);

  constructor(private readonly deductionHelperService: DeductionsHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async createDeduction(dto: CreateDeductionsDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.amount = this.utilService.convertAmount(dto.amount);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.deductionHelperService.validateRequest(dto);
    return await this.deductionHelperService.create(dto, orgID, email);
  }

  async allDeductionsInOrg(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.deductionHelperService.findAllDeductions(orgID, searchRequest);
  }

  async getDeductionOneDeductionById(orgID: string, deductionID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.deductionHelperService.findOneDeductionById(orgID, deductionID);
  }


  async getDeductionByName(orgID: string, dto: DeductionDto) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    return await this.deductionHelperService.findOneDeductionByName(orgID, dto);
  }

  async editDeduction(dto: EditDeductionDto, deductionID: string, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    dto.amount = this.utilService.convertAmount(dto.amount);
    await this.deductionHelperService.findOneDeductionById(orgID, deductionID)
    return await this.deductionHelperService.updateDeduction(dto, deductionID, orgID, email)
  }

  async deleteDeduction(orgID: string, deductionID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.deductionHelperService.findOneDeductionById(orgID, deductionID)
    return await this.deductionHelperService.deleteDeduction(orgID,deductionID)

  }
}
