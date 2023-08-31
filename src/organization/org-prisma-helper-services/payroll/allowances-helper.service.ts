import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AllowanceDto, CreateAllowanceDto, EditAllowanceDto } from "@core/dto/global/Payroll.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class AllowancesHelperService {
  private readonly logger = new Logger(AllowancesHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async validateRequest(dto) {
    await this.checkEmpPropertyExists("name", dto.name, "Allowance");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.allowance.findFirst({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }


  async create(dto: CreateAllowanceDto, orgID: string, email: string) {
    try {
      await this.prismaService.allowance.create({
        data: {
          name: dto.name,
          type: dto.type,
          description: dto.description,
          amount: dto.amount,
          frequency: dto.frequency,
          taxable: dto.taxable,
          organizationId: orgID,
          createdBy: email
        }
      });
      return `Created allowance successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating allowance");
    }
  }

  async findAllAllowances(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [allowances, total] = await this.prismaService.$transaction([
        this.prismaService.allowance.findMany({
          where: { organizationId: orgID },
          skip,
          take
        }),
        this.prismaService.allowance.count({ where: { organizationId: orgID } })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, allowances };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findOneAllowanceById(orgID: string, allowanceID: string) {
    const allowance = await this.prismaService.allowance.findFirst({
      where: {
        organizationId: orgID,
        id: allowanceID
      }
    });
    if (!allowance) {
      throw new AppNotFoundException(`Cannot find allowance with id ${allowanceID}`);
    }
    return allowance;
  }

  async findOneAllowanceByName(orgID: string, dto: AllowanceDto) {
    const allowance = await this.prismaService.allowance.findFirst({
      where: {
        organizationId: orgID,
        name: dto.name
      }
    });
    if (!allowance) {
      throw new AppNotFoundException(`Cannot find ${dto.name} allowance`);
    }
    return allowance;
  }

  async updateAllowance(dto: EditAllowanceDto, allowanceID: string, orgID: string, email: string) {
    try {
      return await this.prismaService.allowance.update({
        where: {
          id: allowanceID
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

  async deleteOneAllowance(orgID: string, allowanceID: string) {
    try {
      await this.prismaService.allowance.delete({
        where: {
          id: allowanceID
        }
      });
      return "Deleted successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error deleting allowance");
    }
  }
}
