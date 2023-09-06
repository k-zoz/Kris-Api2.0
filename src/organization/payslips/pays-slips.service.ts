import { Injectable } from "@nestjs/common";
import {
  PaysSlipsPrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/pays-slips-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";

@Injectable()
export class PaysSlipsService {
  constructor(private readonly payslipPrismaHelperService: PaysSlipsPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService
  ) {
  }

  async allMyPayslips(orgID: string, empID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.employeeHelperService.findEmpById(empID);
    return await this.payslipPrismaHelperService.myPaySlips(empID, orgID);
  }
}
