import { Type } from "@nestjs/common";
import { LeaveService } from "@organization/leave/leave.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave/leave-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { EmployeeOrgDepartmentsService } from "@organization/department/employee-org-departments.service";
import { EmpOrgAppraisalService } from "@organization/appraisals/emp-org-appraisal.service";
import {
  JobOpeningHelperService
} from "@organization/org-prisma-helper-services/recruitment/job-opening-helper.service";
import { JobOpeningService } from "@organization/jobs-opening/job-opening.service";
import { PayrollPreviewService } from "@organization/payroll-preview/payroll-preview.service";
import {
  PayrollPreviewHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-preview-helper.service";
import { PayrollApproveService } from "@organization/payroll-approve/payroll-approve.service";
import {
  PayrollApprovePrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-approve-prisma-helper.service";
import {
  PaysSlipsPrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/pays-slips-prisma-helper.service";
import { PaysSlipsService } from "@organization/payslips/pays-slips.service";
import {
  OrgDeptPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import { EmpOrgBranchService } from "@organization/branch/emp-org-branch.service";
import { EmpOrgClienteleService } from "@organization/clentele/emp-org-clientele.service";
import {
  EmpClienteleHelperService
} from "@organization/org-prisma-helper-services/organization/emp-clientele-helper.service";
import {
  OrgOnboardPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-onboard-prisma-helper.service";
import { EmpJobsService } from "@organization/jobs/emp-jobs.service";
import {
  PayrollPrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-prisma-helper.service";
import { EmpPayrollService } from "@organization/payroll/emp-payroll.service";
import { AllowancesService } from "@organization/payroll/allowances/allowances.service";
import { BonusesService } from "@organization/payroll/bonuses/bonuses.service";
import { DeductionsService } from "@organization/payroll/deductions/deductions.service";
import { PayGradeService } from "@organization/payroll/pay-grades/pay-grade.service";
import { AllowancesHelperService } from "@organization/org-prisma-helper-services/payroll/allowances-helper.service";
import { BonusHelperService } from "@organization/org-prisma-helper-services/payroll/bonus-helper.service";
import { DeductionsHelperService } from "@organization/org-prisma-helper-services/payroll/deductions-helper.service";
import { PaygradeHelperService } from "@organization/org-prisma-helper-services/payroll/paygrade-helper.service";
import { PayGroupService } from "@organization/payroll/pay-group/pay-group.service";
import {
  PayGroupPrismaHelperService
} from "@organization/org-prisma-helper-services/payroll/pay-group-prisma-helper.service";
import {
  OrgTeamPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-team-prisma-helper.service";
import { OrgTeamService } from "@organization/teams/org-team.service";
import {
  OrgEmpPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-emp-prisma-helper.service";
import { OrgEmployeeService } from "@organization/orgEmployee/org-employee.service";
import { EmpOrgOnboardingService } from "@organization/onboarding/emp-org-onboarding.service";
import {
  OrgAppraisalPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-appraisal-prisma-helper.service";
import { LocaleService } from "@locale/locale.service";
import { UtilService } from "@core/utils/util.service";
import { EmployeeOrganizationService } from "@organization/employeeOrganization.service";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import {
  EmpJobsPrismaHelperService
} from "@organization/org-prisma-helper-services/recruitment/emp-jobs-prisma-helper.service";
import { LeaveController } from "@organization/leave/leave.controller";
import { EmployeeOrganizationController } from "@organization/employeeOrganization.controller";
import { EmpOrgClienteleController } from "@organization/clentele/emp-org-clientele.controller";
import { EmpOrgOnboardingController } from "@organization/onboarding/emp-org-onboarding.controller";
import { EmpOrgAppraisalController } from "@organization/appraisals/emp-org-appraisal.controller";
import { EmpJobsController } from "@organization/jobs/emp-jobs.controller";
import { AllowancesController } from "@organization/payroll/allowances/allowances.controller";
import { BonusesController } from "@organization/payroll/bonuses/bonuses.controller";
import { DeductionsController } from "@organization/payroll/deductions/deductions.controller";
import { PayGradeController } from "@organization/payroll/pay-grades/pay-grade.controller";
import { PayGroupController } from "@organization/payroll/pay-group/pay-group.controller";
import { PayrollPreviewController } from "@organization/payroll-preview/payroll-preview.controller";
import { PayrollApproveController } from "@organization/payroll-approve/payroll-approve.controller";
import { PaysSlipsController } from "@organization/payslips/pays-slips.controller";
import { JobOpeningController } from "@organization/jobs-opening/job-opening.controller";
import { EmployeeOrgDepartmentsController } from "@organization/department/employee-org-departments.controller";
import { OrgTeamController } from "@organization/teams/org-team.controller";
import { OrgEmployeeController } from "@organization/orgEmployee/org-employee.controller";
import { EmpOrgBranchController } from "@organization/branch/emp-org-branch.controller";

export const providers:Array<Type<any>> = [
  LeaveService, LeavePrismaHelperService, EmployeePrismaHelperService, EmployeeOrgDepartmentsService, EmpOrgAppraisalService,JobOpeningHelperService,
  JobOpeningService,
  PayrollPreviewService,PayrollPreviewHelperService,PayrollApproveService,PayrollApprovePrismaHelperService,PaysSlipsPrismaHelperService,PaysSlipsService,
  OrgDeptPrismaHelperService, EmpOrgBranchService, EmpOrgClienteleService, EmpClienteleHelperService, OrgOnboardPrismaHelperService, EmpJobsService,
  PayrollPrismaHelperService, EmpPayrollService, AllowancesService, BonusesService, DeductionsService, PayGradeService, AllowancesHelperService,
  BonusHelperService, DeductionsHelperService, PaygradeHelperService, BonusesService, BonusHelperService, PayGroupService, PayGroupPrismaHelperService,
  OrgTeamPrismaHelperService, OrgTeamService, OrgEmpPrismaHelperService, OrgEmployeeService, EmpOrgOnboardingService, OrgAppraisalPrismaHelperService,
  LocaleService, UtilService, EmployeeOrganizationService, OrgBranchPrismaHelperService, EmpJobsPrismaHelperService
]


export const controllers:Array<Type<any>> = [
  LeaveController, EmployeeOrganizationController, EmpOrgClienteleController, EmpOrgOnboardingController, EmpOrgAppraisalController,
  EmpJobsController, AllowancesController, BonusesController, DeductionsController, PayGradeController, BonusesController, PayGroupController,
  PayrollPreviewController, PayrollApproveController, PaysSlipsController, JobOpeningController,
  EmployeeOrgDepartmentsController, OrgTeamController, OrgEmployeeController, EmpOrgBranchController
]
