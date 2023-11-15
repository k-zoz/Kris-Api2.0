import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { WorkToolsService } from "@organization/work-tools/work-tools.service";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { WorkToolDto } from "@core/dto/global/worktool";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";

@Controller("organization/workTool")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class WorkToolsController extends BaseController {
  constructor(private readonly workToolService: WorkToolsService) {
    super();
  }

  @Post("/:orgID/createTool")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async createWorkTool(@Param("orgID") orgID: string,
                       @GetUser() payload: AuthPayload,
                       @Body(ValidationPipe) request: WorkToolDto
  ) {
    return this.response({ payload: await this.workToolService.createTool(orgID, request, payload.email) });
  }

  @Get("/:orgID/allWorkTools")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allOrgWorkTools(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.workToolService.allOrgWorkTools(orgID) });
  }

  @Post("/:orgID/workTool/:empID/add")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addWorkToolToEmployee(@Param("orgID") orgID: string,
                              @Param("empID") empID: string,
                              @Body(ValidationPipe) request: WorkToolDto
  ) {
    return this.response({ payload: await this.workToolService.giveEmployeeWorkTool(orgID, empID, request) });
  }

  @Get("/:orgID/employeeWorkTools/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allEmployeeWorkTools(@Param("orgID") orgID: string,
                             @Param("empID") empID: string) {
    return this.response({ payload: await this.workToolService.employeeWorkTools(orgID, empID) });
  }

  @Get("myWorkTools")
  async myWorkTools(@GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.workToolService.myWorkTools(payload.email) });
  }

  @Post("comment/:wtID")
  async addCommentToEmployeeWT(@GetUser() payload: AuthPayload,
                               @Param("wtID") wtID: string,
                               @Body(ValidationPipe) request: WorkToolDto
  ) {
    return this.response({ payload: await this.workToolService.addCommentToWT(wtID, payload.email, request) });
  }


}
