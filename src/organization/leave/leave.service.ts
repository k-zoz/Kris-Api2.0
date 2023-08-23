import { Injectable, Logger } from "@nestjs/common";
import { ApplyForLeave, CreateLeaveDto } from "@core/dto/global/leave.dto";
import { PrismaService } from "@prisma/prisma.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave-prisma-helper.service";
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


  async getAllLeavePlans(orgID) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.leaveHelperService.findAllLeavePlansForOrg(orgID);
  }

  // TODO Check for overlapping leave requests
  // Weekends and weekndays days to know day to minus duration

  async leaveApplication(dto: ApplyForLeave, orgID: string, userPayLoad: AuthPayload) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.leaveName = this.utilService.toUpperCase(dto.leaveName);
    await this.leaveHelperService.findOrgLeaveByName(dto.leaveName, orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    //date conversion based on how dates are entered or could be handled in the front end
    dto.leaveDuration = this.utilService.calcLeaveDuration(dto.leaveStartDate, dto.leaveEndDate);
    dto.leaveEndDate = this.utilService.convertDate(dto.leaveEndDate);
    dto.leaveStartDate = this.utilService.convertDate(dto.leaveStartDate);
    console.log(dto);
    await this.leaveHelperService.leaveDurationRequest(employee, dto);
    return await this.leaveHelperService.applyLeave(dto, orgID, employee);
  }


  async leaveHistory(orgID: string, userPayLoad: AuthPayload) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    return await this.leaveHelperService.getMyLeaveHistory(orgID, employee);
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

  // async allEmployeesLeave(orgID: string) {
  //   await this.orgHelperService.findOrgByID(orgID)
  //   return await this.leaveHelperService.findAllEmpLeaveHistory(orgID);
  // }
  async allEmployeesOnLeave(orgID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.leaveHelperService.allEmployeeLeaveStatus(orgID);
  }

  async findOneLeave(orgID: string, leaveID: string, email) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(email)
    return await this.leaveHelperService.findOneLeave(orgID, leaveID, employee);
  }
}



