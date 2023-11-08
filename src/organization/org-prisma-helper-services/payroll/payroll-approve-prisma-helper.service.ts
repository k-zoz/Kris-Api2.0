import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppException } from "@core/exception/app-exception";
import { EmailService } from "@alert/email/email.service";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { PdfService } from "@cloudinary/pdf/pdf.service";
import { EventEmitter2 } from "@nestjs/event-emitter";



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
          employees: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              taxes: true,
              gross_pay: true,
              deduction: true,
              bonuses: true,
              net_pay: true,
              employee_Pension: true,
              employer_Pension: true,
              utility: true,
              housing: true,
              transportation: true,
              education: true,
              location: true,
              designation: true
            }
          }
        }
      });


      const totals = result.employees.reduce(
        (acc, employee) => {
          acc.taxes += employee.taxes || 0;
          acc.gross_pay += employee.gross_pay || 0;
          acc.deduction += employee.deduction || 0;
          acc.bonuses += employee.bonuses || 0;
          acc.net_pay += employee.net_pay || 0;
          acc.employer_Pension += employee.employer_Pension || 0;
          return acc;
        },
        {
          taxes: 0,
          gross_pay: 0,
          deduction: 0,
          bonuses: 0,
          net_pay: 0,
          employer_Pension:0
        }
      );
      return { payrollPreview: result, totals };
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }


  async startPayrollApproval(orgID: string, payrollPreviewID: string, email, totalsPayroll) {
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

        const payroll = await tx.organizationPayroll.create({
          data: {
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


}
