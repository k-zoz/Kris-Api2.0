import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException } from "@core/exception/app-exception";

@Injectable()
export class PaysSlipsPrismaHelperService {
  private readonly logger = new Logger(PaysSlipsPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async myPaySlips(empID: string, orgID: string) {
    try {
      return await this.prismaService.employeePayroll.findMany({
        where: {
          employeeId: empID
        },
        include: {
          payroll: {
            include: {
              payrollPreview: true
            }
          }
        },
        orderBy: {
          createdDate: "desc"
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }
}
