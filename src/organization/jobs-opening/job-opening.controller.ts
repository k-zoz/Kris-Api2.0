import {
  Body,
  Controller, FileTypeValidator,
  Get, MaxFileSizeValidator,
  Param, ParseFilePipe,
  Post,
  UploadedFile, UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { JobOpeningService } from "@organization/jobs-opening/job-opening.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ApplyForJobDto, CreateNewHireDto, PostJobDto } from "@core/dto/global/Jobs.dto";
import { Express } from "express";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

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


  @Post("uploadCvAndResume")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDetails(@UploadedFile(new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: ".(pdf|doc|docx)" }),
      new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2, message: "File size more than 2 mb" })
    ]
  })) file: Express.Multer.File) {
    return this.response({ payload: await this.jobOpeningService.uploadCredentials(file) });
  }

  @Post("/:orgID/applyForJob/:jobOpeningID")
  async applyForJob(@Param("orgID") orgID: string,
                    @Param("jobOpeningID") jobOpeningID: string,
                    @Body(ValidationPipe) dto: ApplyForJobDto
  ) {
    return this.response({ payload: await this.jobOpeningService.jobApply(dto, orgID, jobOpeningID) });
  }

  @Get("/:orgID/jobOpening/:jobOpeningID")
  async getJobOpening(@Param("orgID") orgID: string,
                      @Param("jobOpeningID") jobOpeningID: string) {
    return this.response({ payload: await this.jobOpeningService.findOneJobOpening(orgID, jobOpeningID) });
  }

}