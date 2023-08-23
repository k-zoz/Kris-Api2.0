import { Global, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { LeaveController } from "@organization/leave/leave.controller";
import { LeaveService } from "@organization/leave/leave.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { LocaleService } from "@locale/locale.service";
import { UtilService } from "@core/utils/util.service";
import { EmployeeOrganizationController } from "./employeeOrganization.controller";
import { EmployeeOrganizationService } from "./employeeOrganization.service";
import { OrgBranchPrismaHelperService } from "@organization/org-prisma-helper-services/org-branch-prisma-helper.service";
import { EmployeeOrgDepartmentsController } from "@organization/department/employee-org-departments.controller";
import { EmployeeOrgDepartmentsService } from "@organization/department/employee-org-departments.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/org-dept-prisma-helper.service";
import { OrgTeamPrismaHelperService } from "@organization/org-prisma-helper-services/org-team-prisma-helper.service";
import { OrgTeamService } from "@organization/teams/org-team.service";
import { OrgTeamController } from "@organization/teams/org-team.controller";
import { OrgEmployeeController } from "@organization/orgEmployee/org-employee.controller";
import { OrgEmpPrismaHelperService } from "@organization/org-prisma-helper-services/org-emp-prisma-helper.service";
import { OrgEmployeeService } from "@organization/orgEmployee/org-employee.service";
import { EmpOrgBranchController } from "@organization/branch/emp-org-branch.controller";
import { EmpOrgBranchService } from "@organization/branch/emp-org-branch.service";
import { EmpOrgClienteleController } from "@organization/clentele/emp-org-clientele.controller";
import { EmpOrgClienteleService } from "@organization/clentele/emp-org-clientele.service";
import { EmpClienteleHelperService } from "@organization/org-prisma-helper-services/emp-clientele-helper.service";
import { EmpOrgOnboardingController } from "@organization/onboarding/emp-org-onboarding.controller";
import { EmpOrgOnboardingService } from "@organization/onboarding/emp-org-onboarding.service";
import {
  OrgOnboardPrismaHelperService
} from "@organization/org-prisma-helper-services/org-onboard-prisma-helper.service";
import { EmpOrgAppraisalController } from "@organization/appraisals/emp-org-appraisal.controller";
import { EmpOrgAppraisalService } from "@organization/appraisals/emp-org-appraisal.service";
import {
  OrgAppraisalPrismaHelperService
} from "@organization/org-prisma-helper-services/org-appraisal-prisma-helper.service";

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false }),],
  exports: [LeaveService, LeavePrismaHelperService, EmployeePrismaHelperService, EmployeeOrgDepartmentsService,
    OrgDeptPrismaHelperService, OrgTeamPrismaHelperService, OrgTeamService,
    OrgEmpPrismaHelperService, OrgEmployeeService, EmployeeOrganizationService, OrgBranchPrismaHelperService],
  controllers: [LeaveController, EmployeeOrganizationController, EmpOrgClienteleController,EmpOrgOnboardingController, EmpOrgAppraisalController,
    EmployeeOrgDepartmentsController, OrgTeamController, OrgEmployeeController, EmpOrgBranchController],
  providers: [LeaveService, LeavePrismaHelperService, EmployeePrismaHelperService, EmployeeOrgDepartmentsService,EmpOrgAppraisalService,
    OrgDeptPrismaHelperService, EmpOrgBranchService, EmpOrgClienteleService,EmpClienteleHelperService,OrgOnboardPrismaHelperService,
    OrgTeamPrismaHelperService, OrgTeamService, OrgEmpPrismaHelperService, OrgEmployeeService,EmpOrgOnboardingService,OrgAppraisalPrismaHelperService,
    LocaleService, UtilService, EmployeeOrganizationService, OrgBranchPrismaHelperService]
})
export class EmployeeOrganizationModule {
}
