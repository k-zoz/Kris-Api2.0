import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ApplyForLeave, CreateLeaveDto, MockLeaveDto } from "@core/dto/global/leave.dto";
import { LeaveService } from "@organization/leave/leave.service";


@Controller("leave")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class LeaveController extends BaseController {
  constructor(private readonly leaveService: LeaveService) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE)
  async createLeave(@GetUser() payload: AuthPayload,
                    @Param("orgID") orgID: string,
                    @Body(ValidationPipe) dto: CreateLeaveDto
  ) {
    return this.response(
      {
        payload: await this.leaveService.createLeavePlan(dto, orgID, payload.email),
        message: "Created Successfully",
        status: HttpStatus.CREATED
      });
  }

  @Get("/:orgID/allPlans")
  async allLeavePlans(@Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.getAllLeavePlans(orgID), status: HttpStatus.OK });
  }

  @Post("/:orgID/apply")
  async applyForLeave(@GetUser() payload: AuthPayload,
                      @Param("orgID") orgID: string,
                      @Body(new ValidationPipe({ whitelist: true })) dto: ApplyForLeave
  ) {
    return this.response({
      payload: await this.leaveService.leaveApplication(dto, orgID, payload),
      message: "Applied"
    });
  }

  //TODO leave goes  for approval to someone higher
  //TODO email notifs
  // TODO delete employee leave

  @Get("/:orgID/history")
  async myLeaveHistory(@GetUser() payload: AuthPayload,
                       @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.leaveHistory(orgID, payload) });
  }


  //Testing
  // @Get("onboarders")
  // async getOnboarders(@GetUser() payload: AuthPayload,
  //                     @Body(ValidationPipe) dto: MockLeaveDto
  // ) {
  //   console.log(payload, dto,);
  // }


}
