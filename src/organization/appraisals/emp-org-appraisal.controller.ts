import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpOrgAppraisalService } from "@organization/appraisals/emp-org-appraisal.service";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import {
  AppraisalResponseDto,
  CreateAppraisalDto,
  CreateSectionsForAppraisal,
  QuestionsDto
} from "@core/dto/global/appraisal";
import { Appraisal } from "@prisma/client";


@Controller("organization/appraisal")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpOrgAppraisalController extends BaseController {
  constructor(private readonly appraisalService: EmpOrgAppraisalService) {
    super();
  }


  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async createAnAppraisal(@GetUser() payload: AuthPayload,
                          @Param("orgID") orgID: string,
                          @Body(ValidationPipe) dto: CreateAppraisalDto
  ) {
    return this.response({ payload: await this.appraisalService.createAppraisal(dto, orgID, payload.email) });
  }


  @Post("/:orgID/:appraisalID/createSection")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async createSectionForAppraisal(@GetUser() payload: AuthPayload,
                                  @Param("orgID") orgID: string,
                                  @Param("appraisalID") appraisalID: string,
                                  @Body(ValidationPipe) dto: CreateSectionsForAppraisal
  ) {
    return this.response({ payload: await this.appraisalService.createSectionsInAppraisal(dto, orgID, appraisalID, payload.email) });
  }

  @Delete("/:orgID/:appraisalID/removeSection/:sectionID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeSectionFromAppraisal(@Param("orgID") orgID: string,
                                   @Param("appraisalID") appraisalID: string,
                                   @Param("sectionID") sectionID: string
  ) {
    return this.response({ payload: await this.appraisalService.removeSectionFromAppraisal(orgID, appraisalID, sectionID) });
  }

  @Delete("/:orgID/:appraisalID/removeSection")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeSectionFomAppraisalByNameOfSection(@Param("orgID") orgID: string,
                                                 @Param("appraisalID") appraisalID: string,
                                                 @Body(ValidationPipe) dto: CreateSectionsForAppraisal
  ) {
    return this.response({ payload: await this.appraisalService.removeSectionFromAppraisalWithName(dto, orgID, appraisalID) });
  }

  @Get("/:orgID/:appraisalID/appraisal")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAppraisalAndAllSections(@Param("orgID") orgID: string,
                                   @Param("appraisalID") appraisalID: string
  ) {
    return this.response({ payload: await this.appraisalService.findAppraisalAndSections(orgID, appraisalID) });
  }

  @Post("/:orgID/:appraisalID/addSection/:sectionID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addQuestionsToAppraisalSection(@Param("orgID") orgID: string,
                                       @Param("appraisalID") appraisalID: string,
                                       @Param("sectionID") sectionID: string,
                                       @Body(ValidationPipe) dto: QuestionsDto
  ) {
    return this.response({ payload: await this.appraisalService.addQuestionsToAppraisal(dto, orgID, appraisalID, sectionID) });
  }


  @Get("/:orgID/allAppraisals")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllAppraisals(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.appraisalService.allOrgAppraisals(orgID) });
  }


  @Delete("/:orgID/:appraisalID/:sectionID/removeQuestion/:questionID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeQuestionFromAppraisal(@Param("orgID") orgID: string,
                                    @Param("appraisalID") appraisalID: string,
                                    @Param("sectionID") sectionID: string,
                                    @Param("questionID") questionID: string
  ) {
    return this.response({ payload: await this.appraisalService.removeQuestionFromAppraisal(orgID, appraisalID, sectionID, questionID) });
  }

  @Delete("/:orgID/:appraisalID/deleteAppraisal")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeAppraisal(@Param("orgID") orgID: string,
                        @Param("appraisalID") appraisalID: string) {
    return this.appraisalService.deleteAppraisal(orgID, appraisalID);
  }

  @Post("/:orgID/:appraisalID/sendToAllEmployees")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async shareAppraisalToAllEmployees(@Param("orgID") orgID: string,
                                     @Param("appraisalID") appraisalID: string,
                                     @Body(ValidationPipe) dto: Appraisal,
                                     @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.sendToAllEmployees(dto, orgID, appraisalID, payload.email) });
  }

  @Get("/myAppraisal")
  async getMyAppraisal(@GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.myAppraisal(payload.email) });
  }


  @Post("/:sectionID/:questionID/answerMyAppraisal/:myAppraisalID")
  async appraiseMySelf(@Param("myAppraisalID") myAppraisalID: string,
                       @Param("sectionID") sectionID: string,
                       @Param("questionID") questionID: string,
                       @Body(ValidationPipe) dto: AppraisalResponseDto,
                       @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.answerAppraisal(dto, myAppraisalID, sectionID, questionID, payload.email) });
  }

  @Post("/:sectionID/commentsToMyAppraisal/:myAppraisalID")
  async addCommentsToAppraisal(@Param("myAppraisalID") myAppraisalID: string,
                               @Param("sectionID") sectionID: string,
                               @Body(ValidationPipe) dto: AppraisalResponseDto,
                               @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.commentAppraisal(dto, myAppraisalID, sectionID, payload.email) });
  }

  @Get("/complete/:myAppraisalID")
  async completeAppraisal(@Param("myAppraisalID") myAppraisalID: string,
                          @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.completeAppraisal(myAppraisalID, payload.email) });
  }


  @Get("/:orgID/myAppraisalAndSections/:myAppraisalID")
  async getMyAppraisalAndSections(@GetUser() payload: AuthPayload,
                                  @Param("orgID") orgID: string,
                                  @Param("myAppraisalID") myAppraisalID: string
  ) {
    return this.response({ payload: await this.appraisalService.allMyAppraisal(orgID, myAppraisalID, payload.email) });
  }

  @Get(":appraisalID/responses/:myAppraisalID")
  async myAppraisalResponses(@Param("myAppraisalID") myAppraisalID: string,
                             @Param("appraisalID") appraisalID: string,
                             @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.appraisalService.allMyAppraisalResponses(myAppraisalID, appraisalID, payload.email) });
  }


  //TODO dont answer same question and add comment twice
}
