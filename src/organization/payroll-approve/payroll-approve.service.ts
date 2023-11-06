import { Injectable } from "@nestjs/common";
import {
  PayrollApprovePrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-approve-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import {
  PayrollPreviewHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-preview-helper.service";

@Injectable()
export class PayrollApproveService {
  constructor(private readonly payrollApproveHelperService: PayrollApprovePrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly payrollPreviewPrismaHelper: PayrollPreviewHelperService,
              private readonly employeeHelperPrismaService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async getPayrollAndTotal(orgID: string, payrollPreviewID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    return await this.payrollApproveHelperService.getPayrollPreviewWithTotals(orgID, payrollPreviewID);
  }


  async approvePayrollPreview(orgID: string, payrollPreviewID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const payrollTotal = await this.payrollApproveHelperService.getPayrollPreviewWithTotals(orgID, payrollPreviewID);
    return await this.payrollApproveHelperService.startPayrollApproval(orgID, payrollPreviewID, email, payrollTotal.totals);
  }

}
