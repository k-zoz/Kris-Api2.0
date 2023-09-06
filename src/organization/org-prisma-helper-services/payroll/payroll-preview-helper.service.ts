import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreatePayrollPreviewDto, EmployeePayrollPreviewDto } from "@core/dto/global/Payroll.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";
import { Employee } from "@prisma/client";

@Injectable()
export class PayrollPreviewHelperService {
  private readonly logger = new Logger(PayrollPreviewHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async validateRequest(dto) {
    await this.checkEmpPropertyExists("name", dto.name, "Payroll");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.payroll_Preview.findFirst({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }


  async createPayrollPreview(dto: CreatePayrollPreviewDto, orgID: string, email: string) {
    try {
      await this.prismaService.payroll_Preview.create({
        data: {
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          date: dto.date,
          status: "PENDING",
          organizationId: orgID,
          createdBy: email
        }
      });
      return "Created successfully";
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error creating payroll");
    }
  }

  async allPayrollPreview(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [payrollPreview, total] = await this.prismaService.$transaction([
        this.prismaService.payroll_Preview.findMany({
          where: { organizationId: orgID },
          skip,
          take,
          orderBy: {
            createdDate: "desc"
          }
        }),
        this.prismaService.payroll_Preview.count({ where: { organizationId: orgID } })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, payrollPreview };
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async findPayrollPreviewById(orgID: string, payrollPreviewID: string) {
    const payrollPreview = await this.prismaService.payroll_Preview.findFirst({
      where: {
        organizationId: orgID,
        id: payrollPreviewID
      },
      include: {
        employees: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            designation: true,
            bonuses: true,
            deduction: true,
            taxes: true,
            gross_pay: true,
            net_pay: true
          }
        }
      }
    });
    if (!payrollPreview) {
      throw new AppNotFoundException(`Cannot find payroll preview with id ${payrollPreviewID}`);
    }
    return payrollPreview;
  }


  async checkIfEmployeeIsAlreadyInPayrollPreview(empID, payrollPreviewID, orgID) {
    const employeeInPayrollPreview = await this.prismaService.payroll_Preview.findUnique({
      where: {
        id: payrollPreviewID
      },
      include: {
        employees: true
      }
    });
    const employees = employeeInPayrollPreview.employees.some(employee => employee.id === empID);

    if (employees) {
      throw new AppException("Employee is already in the payroll preview");
    }

  }


  async addEmployeeToPayrollPreview(empID, payrollPreviewID, orgID: string, email, employee) {
    try {
      await this.prismaService.payroll_Preview.update({
        where: {
          id: payrollPreviewID
        },
        data: {
          employees: {
            connect: {
              id: empID
            }
          },
          modifiedBy: email
        }
      });
      return `${employee.firstname} ${employee.lastname} has been added!`;
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async findEmployeeInPayrollPreview(empID: any, payrollPreviewID: string, orgID: string) {
    const employeeInPayrollPreview = await this.prismaService.payroll_Preview.findUnique({
      where: {
        id: payrollPreviewID
      },
      include: {
        employees: true
      }
    });
    const employees = employeeInPayrollPreview.employees.some(employee => employee.id === empID);

    if (!employees) {
      throw new AppNotFoundException("Employee is not in the payroll preview");
    }
  }

  async disconnectEmployeeFromPayrollPreview(empID: any, payrollPreviewID: string, orgID: string, email: string, employee) {
    try {
      await this.prismaService.payroll_Preview.update({
        where: {
          id: payrollPreviewID
        },
        data: {
          employees: {
            disconnect: {
              id: empID
            }
          },
          modifiedBy: email
        }
      });
      return `${employee.firstname} ${employee.lastname} has been removed!`;
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async updateEmployeeInfoInPayrollPreview(dto: EmployeePayrollPreviewDto, id: any, payrollPreviewID: string, orgID: string, email: string) {
    try {
      await this.prismaService.employee.update({
        where: { id },
        data: {
          taxes: dto.taxes,
          bonuses: dto.bonuses,
          gross_pay: dto.gross_pay,
          deduction: dto.deduction,
          modifiedBy: email
        }
      });
      return "Successful";
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }
}
