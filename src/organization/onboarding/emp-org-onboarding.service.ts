import { Injectable, Logger } from "@nestjs/common";
import { OrgOnboardPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-onboard-prisma-helper.service";
import { OnboardingDto } from "@core/dto/global/onboarding";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { OrgEmpPrismaHelperService } from "@organization/org-prisma-helper-services/organization/org-emp-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";

@Injectable()
export class EmpOrgOnboardingService {
  private readonly logger = new Logger(EmpOrgOnboardingService.name);

  constructor(private readonly employeeOnboardingHelperService: OrgOnboardPrismaHelperService,
              private readonly orgnizationHelperService: OrganizationPrismaHelperService,
              private readonly employeeHelperService:EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {}

  async createOnboardingInfo(dto: OnboardingDto, orgID: string, email: string) {
    await this.orgnizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    return this.employeeOnboardingHelperService.createOnboardingDocuments(dto, orgID, email);
  }

  async allOnboarding(orgID: string) {
    await this.orgnizationHelperService.findOrgByID(orgID);
    return await this.employeeOnboardingHelperService.findAllOnboarding(orgID)
  }

  async myOnBoarding(email: string) {
   const employee = await this.employeeHelperService.findEmpByEmail(email)
    return await this.employeeOnboardingHelperService.findMyOnboardingDocuments(employee)
  }

  async sendOnboardingToAllEmployees(dto: OnboardingDto, orgID: string, email: string) {
    await this.orgnizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    const onboarding = await this.employeeOnboardingHelperService.findOnboardingByName(dto, orgID)
    return await this.employeeOnboardingHelperService.createOnboardingForALLEmployees(dto, onboarding, email, orgID)
  }

  async sendOnboardingToNewEmployees(dto: OnboardingDto, orgID: string, email: string) {
    await this.orgnizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    const onboarding = await this.employeeOnboardingHelperService.findOnboardingByName(dto, orgID)
    return await this.employeeOnboardingHelperService.createOnboardingForNewEmployees(dto, onboarding, email, orgID)
  }
}
