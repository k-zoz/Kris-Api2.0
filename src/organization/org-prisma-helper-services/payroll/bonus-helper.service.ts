import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { BonusDto, CreateBonusDto, EditBonusDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class BonusHelperService {
  private readonly logger = new Logger(BonusHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async validateRequest(dto) {
    await this.checkEmpPropertyExists("name", dto.name, "Bonus");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.bonuses.findFirst({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async createOneBonus(dto: CreateBonusDto, orgID: string, email: string) {
    try {
      await this.prismaService.bonuses.create({
        data: {
          name: dto.name,
          description: dto.description,
          amount: dto.amount,
          frequency: dto.frequency,
          taxable: dto.taxable,
          organizationId: orgID,
          createdBy: email
        }
      });
      return `Created bonus successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating bonus");
    }
  }

  async findAllBonusesInOrg(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [bonuses, total] = await this.prismaService.$transaction([
        this.prismaService.bonuses.findMany({
          where: { organizationId: orgID },
          skip,
          take
        }),
        this.prismaService.bonuses.count({ where: { organizationId: orgID } })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, bonuses };
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting bonuses");
    }
  }

  async findBonusById(orgID: string, bonusID: string) {
    const bonus = await this.prismaService.bonuses.findFirst({
      where: {
        organizationId: orgID,
        id: bonusID
      }
    });
    if (!bonus) {
      throw new AppNotFoundException(`Cannot find bonus with id ${bonusID}`);
    }
    return bonus;
  }

  async findOneByName(dto: BonusDto, orgID: string) {
    const bonus = await this.prismaService.bonuses.findFirst({
      where: {
        organizationId: orgID,
        name: dto.name
      }
    });
    if (!bonus) {
      throw new AppNotFoundException(`Cannot find ${dto.name} bonus`);
    }
    return bonus;
  }

  async updateBonus(dto: EditBonusDto, bonusID: string, orgID: string, email: string) {
    try {
      return await this.prismaService.bonuses.update({
        where: {
          id: bonusID
        },
        data: {
          ...dto,
          modifiedBy:email
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }

  }

  async deleteBonus(orgID: string, bonusID: string, email: string) {
    try {
      await this.prismaService.bonuses.delete({
        where: {
          id: bonusID
        }
      });
      return "Deleted successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error deleting bonus");
    }
  }
}
