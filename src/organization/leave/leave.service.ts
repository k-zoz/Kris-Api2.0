import { Injectable, Logger } from "@nestjs/common";
import { ApplyForLeave, CreateLeaveDto } from "@core/dto/global/leave.dto";
import { PrismaService } from "@prisma/prisma.service";
import { OrganizationService } from "@back-office/orgnization/services/organization.service";
import { LeaveHelperService } from "@organization/helper-services/leave-helper.service";
import { AppException } from "@core/exception/app-exception";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly organizationService: OrganizationService,
              private readonly leaveHelperService: LeaveHelperService,
              private readonly employeeHelperService: EmployeeHelperService
  ) {
  }

  async createLeavePlan(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    await this.organizationService.findOrgByID(orgID);
    await this.leaveHelperService.findLeaveDuplicates(dto, orgID)
    return await this.leaveHelperService.createLeavePlanAndEmployeeLeave(dto, orgID, creatorEmail);
  }


  async getAllLeavePlans(orgID) {
    await this.organizationService.findOrgByID(orgID);
    return await this.leaveHelperService.findAllLeavePlansForOrg(orgID);
  }


  async leaveApplication(dto: ApplyForLeave, orgID: string, userPayLoad: AuthPayload) {
    await this.organizationService.findOrgByID(orgID);
    await this.leaveHelperService.findLeaveByName(dto.leaveName, orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    return await this.leaveHelperService.applyLeave(dto, orgID, employee);
  }

  async leaveHistory(orgID:string, userPayLoad: AuthPayload){
    await this.organizationService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpByEmail(userPayLoad.email);
    return await this.leaveHelperService.getMyLeaveHistory(orgID, employee)
  }
}


//TODO adding an employee will the employee have access to all the leave plans?

