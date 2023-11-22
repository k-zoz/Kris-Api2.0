import { Body, Controller, Delete, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ApplyForLeave, CreateLeaveDto, UpdateLeaveDto } from "@core/dto/global/leave.dto";
import { LeaveService } from "@organization/leave/leave.service";
import { SkipThrottle } from "@nestjs/throttler";
import { CloudinaryService } from "@cloudinary/cloudinary.service";


@SkipThrottle()
@Controller("organization/leave")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class LeaveController extends BaseController {
  constructor(private readonly leaveService: LeaveService,
              private readonly cloudinaryService: CloudinaryService
  ) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
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

  @Post("/:orgID/leavePlan/:leavePlanID/update")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async updateOrgLeavePlan(@Param("orgID") orgID: string,
                           @Param("leavePlanID") leavePlanID: string,
                           @Body(ValidationPipe) dto: UpdateLeaveDto,
                           @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.leaveService.updateLeavePlan(orgID, leavePlanID, payload.email, dto) });
  }

  @Get("/:orgID/allPlans")
  async allLeavePlans(@Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.getAllLeavePlans(orgID), status: HttpStatus.OK });
  }

  @Post("/:orgID/apply")
  async applyForLeave(@GetUser() payload: AuthPayload,
                      @Param("orgID") orgID: string,
                      @Body(ValidationPipe) dto: ApplyForLeave
  ) {
    return this.response({
      payload: await this.leaveService.leaveApplication(dto, orgID, payload),
      message: "Applied"
    });
  }

  // TODO leave goes  for approval to someone higher

  // TODO delete employee leave
  @Delete("/:orgID/deleteLeave/:empID")
  async deleteEmployeeLeavePlan(@Param("orgID") orgID: string,
                                @Param("empID") empID: string,
                                @GetUser() payload: AuthPayload
  ) {
    return this.response({
      payload: await this.leaveService.deleteEmployeeLeavePlan(orgID, empID, payload.email),
      message: "Successful"

    });
  }

  //TODO create leave for only one employee
  // TODO all the leave history for all employees


  @Get("/:orgID/history")
  async myLeaveHistory(@GetUser() payload: AuthPayload,
                       @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.leaveHistory(orgID, payload) });
  }

  @Get("/:orgID/employeeHeaveHistory/:empID")
  async employeeLeaveHistory(@Param("orgID") orgID: string,
                             @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.leaveService.employeeLeaveHistory(orgID, empID) });
  }

  @Get("/:orgID/allEmployeesOnLeave")
  async getAllEmployeesOnLeave(@Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.allEmployeesOnLeave(orgID) });
  }

  @Get("/:orgID/:leaveID/leave")
  async getOneLeave(@Param("orgID") orgID: string,
                    @Param("leaveID") leaveID: string,
                    @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.leaveService.findOneLeave(orgID, leaveID, payload.email) });
  }


  @Get("approveLeave/:teamRequestID")
  async approveLeave(@GetUser() payload: AuthPayload,
                     @Param("teamRequestID") teamRequestID: string) {
    return this.response({ payload: await this.leaveService.approveEmployeeLeave(teamRequestID, payload.email) });
  }

  @Get("declineLeave/:teamRequestID")
  async declineLeave(@Param("teamRequestID") teamRequestID: string,
                     @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.leaveService.declineEmployeeLeave(teamRequestID, payload.email) });
  }
}
