import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpOrgOnboardingService } from "@organization/onboarding/emp-org-onboarding.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { Onboarding } from "@prisma/client";
import { OnboardingDto } from "@core/dto/global/onboarding";

@SkipThrottle()
@Controller("organization/onboarding")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpOrgOnboardingController extends BaseController {
  constructor(private readonly empOnboardingService: EmpOrgOnboardingService) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async createOnboarding(@GetUser() payload: AuthPayload,
                         @Param("orgID") orgID: string,
                         @Body() dto: OnboardingDto
  ) {
    return this.response({ payload: await this.empOnboardingService.createOnboardingInfo(dto, orgID, payload.email) });
  }

  @Get("/:orgID/allOnboarding")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllOnboarding(@Param("orgID") orgID: string,){
    return this.response({payload: await this.empOnboardingService.allOnboarding(orgID)})
  }


  @Get("myOnboarding")
  async getMyOnboarding(@GetUser()payload: AuthPayload){
    return this.response({payload:await this.empOnboardingService.myOnBoarding(payload.email)})
  }

  @Post("/:orgID/sendAllEmployees")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async sendOnboardingToAllEmployees(@GetUser()payload: AuthPayload,
                                     @Param("orgID") orgID: string,
                                     @Body() dto: OnboardingDto
  ){
    return this.response({payload:await this.empOnboardingService.sendOnboardingToAllEmployees(dto, orgID, payload.email)})
  }

@Post("/:orgID/sendNewEmployees")
@EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
async sendOnboardingToNewEmployees(@GetUser()payload: AuthPayload,
                                   @Param("orgID") orgID: string,
                                   @Body() dto: OnboardingDto
){
  return this.response({payload:await this.empOnboardingService.sendOnboardingToNewEmployees(dto, orgID, payload.email)})
}



}
