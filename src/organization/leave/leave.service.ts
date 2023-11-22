import { Injectable, Logger } from "@nestjs/common";
import { ApplyForLeave, CreateLeaveDto, UpdateLeaveDto } from "@core/dto/global/leave.dto";
import { PrismaService } from "@prisma/prisma.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave/leave-prisma-helper.service";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly leaveHelperService: LeavePrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async createLeavePlan(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.leaveName = this.utilService.toUpperCase(dto.leaveName);
    await this.leaveHelperService.findLeaveDuplicates(dto, orgID);
    return await this.leaveHelperService.createLeavePlanAndEmployeeLeave(dto, orgID, creatorEmail);
  }

  async updateLeavePlan(orgID: string, leavePlanID: string, modifierEmail: string, dto: UpdateLeaveDto) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    dto.leaveName = this.utilService.toUpperCase(dto.leaveName);
    const leavePlan = await this.leaveHelperService.findOrgLeaveByID(leavePlanID, organization);
    return await this.leaveHelperService.updateLeavePlan(dto, organization, leavePlan, modifierEmail);
  }

  async getAllLeavePlans(orgID) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.leaveHelperService.findAllLeavePlansForOrg(orgID);
  }

  // TODO Check for overlapping leave requests
  // Weekends and weekndays days to know day to minus duration

  async leaveApplication(dto: ApplyForLeave, orgID: string, userPayLoad: AuthPayload) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.leaveName = this.utilService.toUpperCase(dto.leaveName);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    const leave = await this.leaveHelperService.findOrgLeaveByName(dto.leaveName, employee.organizationId);
    //date conversion based on how dates are entered or could be handled in the front end
    dto.leaveDuration = this.utilService.countWeekdays(dto.leaveStartDate, dto.leaveEndDate);
    dto.leaveEndDate = this.utilService.convertDateAgain(dto.leaveEndDate);
    dto.leaveStartDate = this.utilService.convertDateAgain(dto.leaveStartDate);
    await this.leaveHelperService.leaveDurationRequest(employee, dto);
    const leaveApplication = await this.leaveHelperService.applyLeave(dto, orgID, employee, leave);
    return await this.leaveHelperService.updateRequests(employee, leaveApplication);
  }


  async leaveHistory(orgID: string, userPayLoad: AuthPayload) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    return await this.leaveHelperService.getMyLeaveHistory(organization, employee);
  }

  async employeeLeaveHistory(orgID: string, empID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    return await this.leaveHelperService.getMyLeaveHistory(organization, employee);
  }

  async onboardLeaveForNewEmployee(orgID: string, employee) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.leaveHelperService.leaveOnboarding(orgID, employee);
  }

  async deleteEmployeeLeavePlan(orgID: string, empID: string, payloadEmail: string) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    this.utilService.compareEmails(employee.email, payloadEmail);
    return await this.leaveHelperService.deleteEmpLeavePlans(orgID, empID);
  }


  async allEmployeesOnLeave(orgID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.leaveHelperService.allEmployeeLeaveStatus(orgID);
  }

  async findOneLeave(orgID: string, leaveID: string, email) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(email);
    return await this.leaveHelperService.findOneLeave(orgID, leaveID, employee);
  }


  async approveEmployeeLeave(teamRequestID: string, approveMail: string) {
    const teamReq = await this.leaveHelperService.findTeamRequest(teamRequestID);
    const employee = await this.employeeHelperService.findEmpById(teamReq.leaveApprovalRequest[0].employeeId);
    const leaveApp = await this.leaveHelperService.findLeaveApplication(teamReq.leaveApprovalRequest[0].id);
    return await this.leaveHelperService.approveLeaveAndSendApprovalMail(leaveApp, employee, teamReq, approveMail);
  }

  async declineEmployeeLeave(leaveApplicationID: string, approveMail: string) {
    const teamReq = await this.leaveHelperService.findTeamRequest(leaveApplicationID);
    const employee = await this.employeeHelperService.findEmpById(teamReq.leaveApprovalRequest[0].employeeId);
    const leaveApp = await this.leaveHelperService.findLeaveApplication(teamReq.leaveApprovalRequest[0].id);
    return await this.leaveHelperService.declineLeaveAndSendDeclineMail(leaveApp, employee, teamReq, approveMail);
  }


}



