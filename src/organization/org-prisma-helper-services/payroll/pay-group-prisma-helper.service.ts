import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { CreatePayGroupDto, PayGroupDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class PayGroupPrismaHelperService {
  private readonly logger = new Logger(PayGroupPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async validateRequest(dto) {
    await this.checkEmpPropertyExists("name", dto.name, "Pay group");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.payGroup.findFirst({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async create(dto: CreatePayGroupDto, orgID: string, email: string) {
    try {
      await this.prismaService.payGroup.create({
        data: {
          name: dto.name,
          description: dto.description,
          organizationId: orgID,
          createdBy: email
        }
      });
      return `Created pay group successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating Pay Group");
    }
  }

  async findAllPayGroups(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [payGroups, total] = await this.prismaService.$transaction([
        this.prismaService.payGroup.findMany({
          where: { organizationId: orgID },
          include:{
            employees:true
          },
          skip,
          take
        }),
        this.prismaService.payGroup.count({ where: { organizationId: orgID } })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, payGroups };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findPayGroupWithID(payGroupID: string, orgID: string) {
    const payGroup = await this.prismaService.payGroup.findFirst({
      where: {
        organizationId: orgID,
        id: payGroupID
      },
      include:{
        employees:true
      }
    });
    if (!payGroup) {
      throw new AppNotFoundException(`Cannot find payGroup with id ${payGroupID}`);
    }
    return payGroup;
  }

  async findPayGroupByName(orgID: string, dto: PayGroupDto) {
    const payGroup = await this.prismaService.payGroup.findFirst({
      where: {
        organizationId: orgID,
        name: dto.name
      },
      include:{
        employees:true
      }
    });
    if (!payGroup) {
      throw new AppNotFoundException(`Cannot find pay group with name ${dto.name}`);
    }
    return payGroup;
  }

  async deletePayGroup(payGroupID: string, orgID: string) {
    try {
      await this.prismaService.payGroup.delete({
        where: {
          id: payGroupID
        }
      });
      return "Deleted successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error deleting pay group");
    }
  }
}
