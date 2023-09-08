import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { JobOpeningService } from "@organization/jobs-opening/job-opening.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateNewHireDto, PostJobDto } from "@core/dto/global/Jobs.dto";

@Controller("organization/jobOpening")
export class JobOpeningController extends BaseController {
  constructor(private readonly jobOpeningService: JobOpeningService) {
    super();
  }

  @UseGuards(AuthGuard())
  @UseGuards(EmployeeRoleGuard)
  @Post("/:orgID/postJob")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async postJobOpening(@GetUser() payload: AuthPayload,
                       @Param("orgID") orgID: string,
                       @Body(ValidationPipe) dto: PostJobDto) {
    return this.response({ payload: await this.jobOpeningService.postAJob(dto, orgID, payload.email) });
  }

  @Get("/:orgID/allJobs")
  async allOrgJobOpening(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.jobOpeningService.allOrgJobsOpening(orgID) });
  }

  @Get("/:orgID/allJobs/:orgKrisID")
  async allOrgJobs(@Param("orgID") orgID: string,
                   @Param("orgKrisID") orgKrisID: string
  ) {
    return this.response({ payload: await this.jobOpeningService.allOrgJobs(orgID, orgKrisID) });
  }


}
