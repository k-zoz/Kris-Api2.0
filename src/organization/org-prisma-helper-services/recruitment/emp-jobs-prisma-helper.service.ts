import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateNewHireDto } from "@core/dto/global/Jobs.dto";
import { AppException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmpJobsPrismaHelperService {
  private readonly logger = new Logger(EmpJobsPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async makeRequest(dto: CreateNewHireDto, employee, orgID) {
    try {
      await this.prismaService.hireRequest.create({
        data: {
          title: dto.title,
          yoe: dto.yoe,
          numberNeeded: dto.numberNeeded,
          qualifications: dto.qualifications,
          other: dto.other,
          skillSet: dto.skillSet,
          urgency: dto.urgency,
          employeeId: employee.id,
          organizationID: orgID,
          createdBy: employee.email
        }
      });
      return "Created Successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async allMyHireRequest(searchRequest: SearchRequest, orgID: string, employee) {
    const { skip, take } = searchRequest;
    try {
      const [hires, total] = await this.prismaService.$transaction([
        this.prismaService.hireRequest.findMany({
          where: {
            employeeId: employee.id,
            organizationID: orgID
          },
          skip,
          take,
          orderBy: {
           createdDate: 'desc'
          }
        }),

        this.prismaService.hireRequest.count({
          where: {
            employeeId: employee.id
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, hires };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async allOrgHireRequests(orgID: string) {
    try {
      return await this.prismaService.hireRequest.findMany({
        where: {
          organizationID: orgID
        },
        orderBy: {
          createdDate: 'desc'
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }
}
