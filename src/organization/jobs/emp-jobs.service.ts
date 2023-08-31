import { Injectable, Logger } from "@nestjs/common";
import { EmpJobsPrismaHelperService } from "@organization/org-prisma-helper-services/recruitment/emp-jobs-prisma-helper.service";
import { CreateNewHireDto } from "@core/dto/global/Jobs.dto";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmpJobsService {
  private readonly logger = new Logger(EmpJobsService.name);

  constructor(private readonly jobsHelperService: EmpJobsPrismaHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService
  ) {
  }

  async makeANewHireRequest(dto: CreateNewHireDto, orgID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.title = this.utilService.toUpperCase(dto.title);
    const employee = await this.employeeService.findEmpByEmail(email);
    return await this.jobsHelperService.makeRequest(dto, employee, orgID);
  }

 async allMyHireRequests(searchRequest: SearchRequest, orgID: string, email) {
    await this.orgHelperService.findOrgByID(orgID);
   const employee = await this.employeeService.findEmpByEmail(email);
   return await  this.jobsHelperService.allMyHireRequest(searchRequest, orgID, employee)
  }
}
