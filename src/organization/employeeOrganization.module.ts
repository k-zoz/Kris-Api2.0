import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { LeaveController } from "@organization/leave/leave.controller";
import { LeaveService } from "@organization/leave/leave.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { LocaleService } from "@locale/locale.service";
import { UtilService } from "@core/utils/util.service";
import { EmployeeOrganizationController } from "./employeeOrganization.controller";
import { EmployeeOrganizationService } from "./employeeOrganization.service";
import { OrgPrismaHelperService } from "@organization/org-prisma-helper-services/org-prisma-helper.service";
import { EmployeeOrgDepartmentsController } from "@organization/department/employee-org-departments.controller";
import { EmployeeOrgDepartmentsService } from "@organization/department/employee-org-departments.service";
import { OrgDeptPrismaHelperService } from "@organization/org-prisma-helper-services/org-dept-prisma-helper.service";
import { OrgTeamPrismaHelperService } from "@organization/org-prisma-helper-services/org-team-prisma-helper.service";
import { OrgTeamService } from "@organization/teams/org-team.service";
import { OrgTeamController } from "@organization/teams/org-team.controller";
import { OrgEmployeeController } from "@organization/orgEmployee/org-employee.controller";
import { OrgEmpPrismaHelperService } from "@organization/org-prisma-helper-services/org-emp-prisma-helper.service";
import { OrgEmployeeService } from "@organization/orgEmployee/org-employee.service";


@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [LeaveService, LeavePrismaHelperService],
  controllers: [LeaveController, EmployeeOrganizationController, EmployeeOrgDepartmentsController, OrgTeamController, OrgEmployeeController],
  providers: [LeaveService, LeavePrismaHelperService, EmployeePrismaHelperService, EmployeeOrgDepartmentsService, OrgDeptPrismaHelperService,
    OrgTeamPrismaHelperService, OrgTeamService, OrgEmpPrismaHelperService, OrgEmployeeService,
    LocaleService, UtilService, EmployeeOrganizationService, OrgPrismaHelperService]
})
export class EmployeeOrganizationModule {
}
