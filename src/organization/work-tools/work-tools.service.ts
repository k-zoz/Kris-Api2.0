import { Injectable } from "@nestjs/common";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import {
  WorkToolsPrismaHelperService
} from "@organization/org-prisma-helper-services/work-tools/work-tools-prisma-helper.service";
import { WorkToolDto } from "@core/dto/global/worktool";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class WorkToolsService {

  constructor(private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly workToolHelperService: WorkToolsPrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }

  async createTool(orgID: string, request: WorkToolDto, creatorEmail: string) {
    const organization = await this.organizationHelperService.findOrgByID(orgID);
    request.name = this.utilService.toUpperCase(request.name);
    return await this.workToolHelperService.createWorkTool(request, organization, creatorEmail);
  }

  async allOrgWorkTools(orgID: string) {
    const organization = await this.organizationHelperService.findOrgByID(orgID);
    return await this.workToolHelperService.findAllWorkTools(organization);
  }

  async giveEmployeeWorkTool(orgID: string, empID: string, request: WorkToolDto) {
    const organization = await this.organizationHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    request.name = this.utilService.toUpperCase(request.name);
    const workTool = await this.workToolHelperService.getWorkToolByName(request.name);
    return await this.workToolHelperService.addWorkToolToEmployee(organization, employee, workTool, request);
  }

  async employeeWorkTools(orgID: string, empID: string) {
    const organization = await this.organizationHelperService.findOrgByID(orgID);
    const employee = await this.employeeHelperService.findEmpById(empID);
    return await this.workToolHelperService.allEmployeeOwnedWorktool(employee, organization);
  }

  async myWorkTools(email: string) {
    const employee = await this.employeeHelperService.findEmpByEmail(email);

    return await this.workToolHelperService.allEmployeeOwnedWorktool(employee);
  }

  async addCommentToWT(wtID: string, email: string, request: WorkToolDto) {
    const employee = await this.employeeHelperService.findEmpByEmail(email);
    const workTool = await this.workToolHelperService.getEmpWorkToolID(wtID);
    return await this.workToolHelperService.addCommentToWorkTool(employee, workTool, request);
  }
}
