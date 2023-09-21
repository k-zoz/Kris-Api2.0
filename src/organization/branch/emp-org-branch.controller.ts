import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import { EmpOrgBranchService } from "@organization/branch/emp-org-branch.service";
import { SearchRequest } from "@core/model/search-request";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("organization/branch")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpOrgBranchController extends BaseController {
  constructor(private readonly branchService: EmpOrgBranchService) {
    super();
  }

  @Post("/:orgID/addBranch")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addBranchToOrg(@Param("orgID") orgID: string,
                       @GetUser() payload: AuthPayload,
                       @Body(ValidationPipe) dto: CreateBranchDto
  ) {
    return this.response({ payload: await this.branchService.onboardBranchToOrg(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allBranchCodes")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allBranchCodes(@Param("orgID") orgID: string,
                       @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.branchService.allBranchCodes(orgID, searchRequest) });
  }

  @Get("/:orgID/allBranchMembers")
  async allMyBranchMembers(@Param("orgID") orgID: string,
                           @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.branchService.myBranchMembers(orgID, payload.email) });
  }

  @Post("/:orgID/allBranches")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async findAllOrgBranches(@Body() searchRequest: SearchRequest,
                           @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.branchService.allBranches(orgID, searchRequest) });
  }


  @Get("/:orgID/branch/:branchID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async findOneBranch(@Param("orgID") orgID: string,
                      @Param("branchID") branchID: string
  ) {
    return this.response({ payload: await this.branchService.oneBranch(orgID, branchID) });
  }


  @Get("/:orgID/branch/:branchID/allEmployees")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allEmployeesInBranch(@Param("orgID") orgID: string,
                             @Param("branchID") branchID: string) {
    return this.response({ payload: await this.branchService.employeesInBranch(orgID, branchID) });
  }

  //TODO branch manager

  @Get("/:orgID/branch/:branchID/branchManager/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async makeBranchManager(@Param("orgID") orgID: string,
                          @Param("branchID") branchID: string,
                          @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.branchService.makeBranchManager(orgID, branchID, empID) });
  }

  @Get("/:orgID/branch/:branchID/removeBranchManager/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeBranchManager(@Param("orgID") orgID: string,
                            @Param("branchID") branchID: string,
                            @Param("empID") empID: string) {
    return this.response({ payload: await this.branchService.removeAsBranchManger(orgID, branchID, empID) });
  }

  @Post("/:orgID/allBranchManagers")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allBranchManagers(@Param("orgID") orgID: string,
                          @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.branchService.allBranchManagers(orgID, searchRequest) });
  }

}
