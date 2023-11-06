import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateBranchDto, CreateClienteleDto } from "@core/dto/global/branch.dto";
import { EmpOrgClienteleService } from "@organization/clentele/emp-org-clientele.service";
import { SearchRequest } from "@core/model/search-request";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("organization/clientele")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpOrgClienteleController extends BaseController {
  constructor(private readonly clenteleService: EmpOrgClienteleService) {
    super();
  }

  @Post("/:orgID/addClientele")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addClienteleToOrg(@Param("orgID") orgID: string,
                          @GetUser() payload: AuthPayload,
                          @Body(ValidationPipe) dto: CreateClienteleDto
  ) {
    return this.response({ payload: await this.clenteleService.onboardClienteleToOrg(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allClientele")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async findAllOrgClients(@Body() searchRequest: SearchRequest,
                          @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.clenteleService.allClientele(orgID, searchRequest) });
  }

  @Get("/:orgID/clientele/:clienteleID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async findOneBranch(@Param("orgID") orgID: string,
                      @Param("clienteleID") clienteleID: string
  ) {
    return this.response({ payload: await this.clenteleService.oneClientele(orgID, clienteleID) });
  }

  @Get("/:orgID/clientele/:clienteleID/allEmployees")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllEmployeesInAClient(@Param("orgID") orgID: string,
                                 @Param("clienteleID") clienteleID: string) {
    return this.response({ payload: await this.clenteleService.allEmployeesInClient(orgID, clienteleID) });
  }

  @Get("/:orgID/clientele/:clienteleID/employeeGender")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getEmployeesGender(@Param("orgID") orgID: string,
                           @Param("clienteleID") clienteleID: string) {
    return this.response({ payload: await this.clenteleService.allTheGenderOfEmployeesInClient(orgID, clienteleID) });
  }

}
