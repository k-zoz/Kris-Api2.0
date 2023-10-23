import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppException } from "@core/exception/app-exception";
import { EmailService } from "../../../alert/email/email.service";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { PdfService } from "@cloudinary/pdf/pdf.service";
import { v2 } from "cloudinary";
import { EventEmitter2 } from "@nestjs/event-emitter";

const PDFDocument = require("pdfkit");
const fs = require("fs");

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
          return acc;
        },
        {
          taxes: 0,
          gross_pay: 0,
          deduction: 0,
          bonuses: 0,
          net_pay: 0
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
                createdBy: email
              }))
            },
            totalNet_pay: totalsPayroll.net_pay,
            totalTaxes: totalsPayroll.taxes,
            totalBonuses: totalsPayroll.bonuses,
            totalDeduction: totalsPayroll.deduction,
            totalGross_pay: totalsPayroll.gross_pay,
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


  // async sendPaySlips(orgID: string, payrollPreviewID: string) {
  //   try {
  //     const payrollPreview = await this.prismaService.payroll_Preview.findUnique({
  //       where: { id: payrollPreviewID },
  //       include: {
  //         employees: true,
  //         Organization: true
  //       }
  //     });
  //
  //     for (const employee of payrollPreview.employees) {
  //       const html = await this.emailService.sendPayrollEmail({
  //         organizationName: payrollPreview.Organization.orgName,
  //         employeeFirstName: employee.firstname,
  //         employeeLastName: employee.lastname,
  //         payslipEndDate: payrollPreview.endDate,
  //         payslipStartDate: payrollPreview.startDate
  //       });
  //
  //       await this.resend.emails.send({
  //         from: `${this.mailSource}`,
  //         to: `${employee.email}`,
  //         subject: "PAYSLIP",
  //         html: `${html}`
  //       });
  //     }
  //     return "Successfully sent";
  //   } catch (e) {
  //     this.logger.log(e);
  //     throw new AppException();
  //   }
  // }


}
