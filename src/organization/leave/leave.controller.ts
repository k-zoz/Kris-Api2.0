import {
  Body,
  Controller,
  Delete, FileTypeValidator,
  Get,
  HttpStatus, MaxFileSizeValidator,
  Param, ParseFilePipe,
  Post, UploadedFile, UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ApplyForLeave, CreateLeaveDto } from "@core/dto/global/leave.dto";
import { LeaveService } from "@organization/leave/leave.service";
import { SkipThrottle } from "@nestjs/throttler";
import { Express } from "express";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
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

  // @Get("/:orgID/history/allEmployees")
  // async allEmployeesLeaveHistory(@Param("orgID") orgID: string){
  //   return this.response({payload:await this.leaveService.allEmployeesLeave(orgID)})
  // }

  @Get("/:orgID/history")
  async myLeaveHistory(@GetUser() payload: AuthPayload,
                       @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.leaveService.leaveHistory(orgID, payload) });
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

  Testing;

  // @Post("onboarders")
  // @UseInterceptors(FilesInterceptor("files"))
  // async getOnboard(@GetUser() payload: AuthPayload,
  //                  @UploadedFiles(new ParseFilePipe({
  //                    validators: [
  //                      new FileTypeValidator({ fileType: ".(pdf|doc|docx)" }),
  //                      new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2, message: "File size more than 2 mb" })
  //                    ]
  //                  })) files: Array<Express.Multer.File>
  // ) {
  //   // console.log(payload, files);
  //   try {
  //     const url = await this.cloudinaryService.uploadManyFiles(files);
  //     return this.response({ payload: url });
  //   } catch (e) {
  //     return this.response({ payload: e });
  //   }
  // }


  // @Get("onboarders/delete/:public_id")
  // async deleteFileUploaded(@Param("public_id") public_id: string) {
  //   try {
  //     const msg = await this.cloudinaryService.deleteImage(public_id);
  //     return this.response({ payload: msg });
  //   } catch (e) {
  //     return this.response({ payload: e });
  //   }
  //
  // }
}
