import { Injectable, Logger } from "@nestjs/common";
import { ApplyForLeave, CreateLeaveDto } from "@core/dto/global/leave.dto";
import { PrismaService } from "@prisma/prisma.service";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave-prisma-helper.service";
import { AppException } from "@core/exception/app-exception";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly organizationService: OrganizationService,
              private readonly leaveHelperService: LeavePrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }

  async createLeavePlan(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    await this.organizationService.findOrgByID(orgID);
    await this.leaveHelperService.findLeaveDuplicates(dto, orgID);
    return await this.leaveHelperService.createLeavePlanAndEmployeeLeave(dto, orgID, creatorEmail);
  }


  async getAllLeavePlans(orgID) {
    await this.organizationService.findOrgByID(orgID);
    return await this.leaveHelperService.findAllLeavePlansForOrg(orgID);
  }


  async leaveApplication(dto: ApplyForLeave, orgID: string, userPayLoad: AuthPayload) {
    await this.organizationService.findOrgByID(orgID);
    await this.leaveHelperService.findOrgLeaveByName(dto.leaveName, orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    //date conversion based on how dates are entered or could be handled in the front end
    dto.leaveDuration = this.utilService.calcLeaveDuration(dto.leaveStartDate, dto.leaveEndDate);
    dto.leaveEndDate = this.utilService.convertLeaveDate(dto.leaveEndDate);
    dto.leaveStartDate = this.utilService.convertLeaveDate(dto.leaveStartDate);
    await this.leaveHelperService.leaveDurationRequest(employee, dto)
    return await this.leaveHelperService.applyLeave(dto, orgID, employee);
  }

  async leaveHistory(orgID: string, userPayLoad: AuthPayload) {
    await this.organizationService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    return await this.leaveHelperService.getMyLeaveHistory(orgID, employee);
  }

  async onboardLeaveForNewEmployee(orgID: string, employee){
    await this.organizationService.findOrgByID(orgID);
    return await this.leaveHelperService.leaveOnboarding(orgID, employee)
  }

}



