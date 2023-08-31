import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpJobsService } from "@organization/jobs/emp-jobs.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateNewHireDto } from "@core/dto/global/Jobs.dto";
import { SearchRequest } from "@core/model/search-request";

@SkipThrottle()
@Controller("organization/jobs")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpJobsController extends BaseController {
  constructor(private readonly jobsService: EmpJobsService) {
    super();
  }

  @Post("/:orgID/requestHire")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async makeAJobRequest(@GetUser() payload: AuthPayload,
                        @Param("orgID") orgID: string,
                        @Body(ValidationPipe) dto: CreateNewHireDto
  ) {
    return this.response({ payload: await this.jobsService.makeANewHireRequest(dto, orgID, payload.email) });
  }

  @Post("/:orgID/myHireRequests")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async myHireRequest(@GetUser() payload: AuthPayload,
                      @Param("orgID") orgID: string,
                      @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.jobsService.allMyHireRequests(searchRequest, orgID, payload.email) });
  }

}
