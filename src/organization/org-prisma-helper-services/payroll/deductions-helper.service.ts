import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { CreateDeductionsDto, DeductionDto, EditDeductionDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class DeductionsHelperService {
  private readonly logger = new Logger(DeductionsHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async validateRequest(dto) {
    await this.checkEmpPropertyExists("name", dto.name, "Deduction");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.deduction.findFirst({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async create(dto: CreateDeductionsDto, orgID: string, email: string) {
    try {
      await this.prismaService.deduction.create({
        data: {
          name: dto.name,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
          groupBy: dto.groupBy,
          relief: dto.relief,
          organizationId: orgID,
          createdBy: email
        }
      });
      return `Created deduction successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async findAllDeductions(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [deductions, total] = await this.prismaService.$transaction([
        this.prismaService.deduction.findMany({
          where: { organizationId: orgID },
          skip,
          take
        }),
        this.prismaService.deduction.count(
          { where: { organizationId: orgID } })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, deductions };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findOneDeductionById(orgID: string, deductionID: string) {
    const deduction = await this.prismaService.deduction.findFirst({
      where: {
        organizationId: orgID,
        id: deductionID
      }
    });
    if (!deduction) {
      throw new AppNotFoundException(`Cannot find deduction with id ${deductionID}`);
    }
    return deduction;
  }

  async findOneDeductionByName(orgID: string, dto: DeductionDto) {
    const deduction = await this.prismaService.deduction.findFirst({
      where: {
        organizationId: orgID,
        name: dto.name
      }
    });
    if (!deduction) {
      throw new AppNotFoundException(`Cannot find ${dto.name} deduction`);
    }
    return deduction;
  }

  async updateDeduction(dto: EditDeductionDto, deductionID: string, orgID: string, email: string) {
    try {
      return await this.prismaService.deduction.update({
        where: {
          id: deductionID
        },
        data: {
          ...dto,
          modifiedBy: email
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error updating Deduction");
    }
  }

  async deleteDeduction(orgID: string, deductionID: string) {
    try {
      await this.prismaService.deduction.delete({
        where: {
          id: deductionID
        }
      });
      return "Deleted successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error deleting deduction");
    }
  }
}
