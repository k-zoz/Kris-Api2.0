import { Injectable, Logger } from "@nestjs/common";
import { PayrollPrismaHelperService } from "@organization/org-prisma-helper-services/payroll/payroll-prisma-helper.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class EmpPayrollService {
  private readonly logger = new Logger(EmpPayrollService.name)

  constructor(private readonly payrollHelperService:PayrollPrismaHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly utilService:UtilService
              ) {}




}
