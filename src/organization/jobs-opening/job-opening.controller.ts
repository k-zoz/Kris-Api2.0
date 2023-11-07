import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
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
import { JobApplicationRequestAndResponse, PostJobDto, QuestionDto, SearchEmail } from "@core/dto/global/Jobs.dto";
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "@cloudinary/cloudinary.service";

@Controller("organization/jobOpening")
export class JobOpeningController extends BaseController {
  constructor(private readonly jobOpeningService: JobOpeningService,
              private readonly cloudinaryService: CloudinaryService
  ) {
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

  @Post("/:jobOpeningID/updateJob/:orgID")
  async updateJob(@Param("jobOpeningID") jobOpeningID: string,
                  @Param("orgID") orgID: string,
                  @Body(ValidationPipe) dto: PostJobDto) {
    return this.response({ payload: await this.jobOpeningService.updateJob(jobOpeningID, orgID, dto) });
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
                    @Body(ValidationPipe) dto: JobApplicationRequestAndResponse
  ) {
    return this.response({ payload: await this.jobOpeningService.jobApply(dto, orgID, jobOpeningID) });
  }

  @Get("/:orgID/jobOpening/:jobOpeningID")
  async getJobOpening(@Param("orgID") orgID: string,
                      @Param("jobOpeningID") jobOpeningID: string) {
    return this.response({ payload: await this.jobOpeningService.findOneJobOpening(orgID, jobOpeningID) });
  }

  @Get("/:orgID/oneJobOpening/:jobOpeningID")
  async getAJobOpening(@Param("orgID") orgID: string,
                       @Param("jobOpeningID") jobOpeningID: string) {
    return this.response({ payload: await this.jobOpeningService.getOneJobOpening(orgID, jobOpeningID) });
  }

  @Post("/:jobOpeningID/addQuestion/:orgID")
  async addQuestionToJob(@Param("jobOpeningID") jobOpeningID: string,
                         @Param("orgID") orgID: string,
                         @Body(ValidationPipe) dto: QuestionDto
  ) {
    return this.response({ payload: await this.jobOpeningService.addQuestionToJobOpening(orgID, jobOpeningID, dto) });
  }

  @Delete("/:jobQuestionID/removeQuestion")
  async removeQuestion(@Param("jobQuestionID") jobQuestionID: string) {
    return this.response({ payload: await this.jobOpeningService.removeQuestion(jobQuestionID) });
  }

  @Post("/:orgID/jobOpeningsByPoster")
  async jobOpeningByPoster(@Body() dto: SearchEmail,
                           @Param("orgID") orgID: string) {
    return this.response({ payload: await this.jobOpeningService.jobOpeningByPoster(orgID, dto) });
  }


  @Get("/:orgID/:jobOpeningID/downloadExcelFile")
  async downloadJobResponsesInExcel(@Param("orgID") orgID: string,
                                    @Param("jobOpeningID") jobOpeningID: string
  ) {
    return this.response({ payload: await this.jobOpeningService.startExcelProcess(orgID, jobOpeningID) });
  }


}
