import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppException } from "@core/exception/app-exception";
import { EmailService } from "@alert/email/email.service";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { PdfService } from "@cloudinary/pdf/pdf.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Organization, Payroll_Preview } from "@prisma/client";


@Injectable()
export class PayrollApprovePrismaHelperService {
  private readonly logger = new Logger(PayrollApprovePrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly emailService: EmailService,
              private readonly configService: ConfigService,
              private readonly pdfService: PdfService,
              private readonly eventEmitter: EventEmitter2
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async getPayrollPreviewWithTotals(orgID: string, payrollPreviewID: string) {
    try {
      const result = await this.prismaService.payroll_Preview.findUnique({
        where: { id: payrollPreviewID },
        include: {
          EmployeePayrollPreview: {
            include: {
              Employee: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  designation: true,
                  bonuses: true,
                  deduction: true,
                  taxes: true,
                  gross_pay: true,
                  net_pay: true,
                  basic_salary: true,
                  housing: true,
                  transportation: true,
                  education: true,
                  location: true,
                  furniture: true,
                  utility: true,
                  reimbursable: true,
                  payroll_net: true,
                  special_allowance: true,
                  entertainment: true,
                  other_deductions: true,
                  employee_Pension: true,
                  employer_Pension: true,
                  empNSITF: true,
                  empNHF: true,
                  empITF: true
                }
              }
            }
          }
        }
      });

      // Extract the employees from the EmployeePayrollPreview array
      const employees = result.EmployeePayrollPreview.map(epp => epp.Employee);


      const totals = employees.reduce(
        (acc, employee) => {
          acc.taxes += employee.taxes || 0;
          acc.gross_pay += employee.gross_pay || 0;
          acc.deduction += employee.deduction || 0;
          acc.net_pay += employee.net_pay || 0;
          return acc;
        },
        {
          taxes: 0,
          gross_pay: 0,
          deduction: 0,
          net_pay: 0
        }
      );


      return { payrollPreview: result, totals };
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }


  async startPayrollApproval(orgID: string, payrollPreviewID: string, email, totalsPayroll, ppPreview: Payroll_Preview) {
    try {
      await this.prismaService.$transaction(async (tx) => {


        await tx.payroll_Preview.update({
          where: { id: payrollPreviewID },
          data: { status: "APPROVED" }
        });

        const payrollPreview = await tx.payroll_Preview.findUnique({
          where: { id: payrollPreviewID },
          include: {
            employees: true
          }
        });

        await tx.organizationPayroll.create({
          data: {
            name: ppPreview.name,
            payrollPreview: {
              connect: { id: payrollPreviewID }
            },
            Organization: {
              connect: { id: orgID }
            },
            employees: {
              create: payrollPreview.employees.map(employee => ({
                employee: { connect: { id: employee.id } },
                bonuses: employee.bonuses,
                taxes: employee.taxes,
                deduction: employee.deduction,
                gross_pay: employee.gross_pay,
                net_pay: employee.net_pay,
                basic_salary: employee.basic_salary,
                housing: employee.housing,
                transportation: employee.transportation,
                education: employee.education,
                location: employee.location,
                furniture: employee.furniture,
                utility: employee.utility,
                empNHF: employee.empNHF,
                empNSITF: employee.empNSITF,
                empITF: employee.empITF,
                entertainment: employee.entertainment,
                special_allowance: employee.special_allowance,
                payroll_net: employee.payroll_net,
                reimbursable: employee.reimbursable,
                other_deductions: employee.other_deductions,
                employer_Pension: employee.employer_Pension,
                employee_Pension: employee.employee_Pension,
                createdBy: email
              }))
            },
            totalNet_pay: totalsPayroll.net_pay,
            totalTaxes: totalsPayroll.taxes,
            totalBonuses: totalsPayroll.bonuses,
            totalDeduction: totalsPayroll.deduction,
            totalGross_pay: totalsPayroll.gross_pay,
            totalEmployerPension: totalsPayroll.employer_Pension,
            createdBy: email
          }
        });
      }, { maxWait: 5000, timeout: 10000 });
      return "Payroll approved";
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }


  async allOrgPayrollData(organization: Organization) {
    try {
      return await this.prismaService.organizationPayroll.findMany({
        where: {
          organizationId: organization.id
        }
      });
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }
}
