import { Injectable, Logger } from "@nestjs/common";
import { BonusHelperService } from "@organization/org-prisma-helper-services/payroll/bonus-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { BonusDto, CreateBonusDto, EditBonusDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class BonusesService {
  private readonly logger = new Logger(BonusesService.name);

  constructor(private readonly bonusHelperService: BonusHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async createABonus(dto: CreateBonusDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.amount = this.utilService.convertAmount(dto.amount);
    dto.name = this.utilService.toUpperCase(dto.name);
    await this.bonusHelperService.validateRequest(dto);
    return await this.bonusHelperService.createOneBonus(dto, orgID, email);
  }

  async getAllBonuses(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.bonusHelperService.findAllBonusesInOrg(orgID, searchRequest);
  }

  async getBonusById(orgID: string, bonusID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.bonusHelperService.findBonusById(orgID, bonusID);
  }

  async getBonusByName(orgID: string, dto: BonusDto) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    return await this.bonusHelperService.findOneByName(dto, orgID);
  }

  async editBonus(dto: EditBonusDto, bonusID: string, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    dto.amount = this.utilService.convertAmount(dto.amount);
    await this.bonusHelperService.findBonusById(orgID, bonusID);
    return await this.bonusHelperService.updateBonus(dto, bonusID, orgID, email);
  }

  async deleteBonus(orgID: string, bonusID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.bonusHelperService.findBonusById(orgID, bonusID);
    return await this.bonusHelperService.deleteBonus(orgID, bonusID, email);
  }
}
