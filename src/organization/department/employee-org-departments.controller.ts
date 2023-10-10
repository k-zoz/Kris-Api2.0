import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeOrgDepartmentsService } from "@organization/department/employee-org-departments.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import {
  CreateDepartmentInBranchDto,
  DepartmentNameSearchDto, HeadOFDepartmentDto,
  ModifyOrg,
  SearchBranchNameOrCodeDto
} from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("organization/department")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeOrgDepartmentsController extends BaseController {
  constructor(private readonly departmentService: EmployeeOrgDepartmentsService) {
    super();
  }


  


  @Get("myDepartmentRequests")
  async  getMyDepartmentRequests(@GetUser() payload: AuthPayload){
    return this.response({payload:await this.departmentService.departmentRequests(payload.email)})
  }

  @Post("/:orgID/addDepartment/:branchID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addDeptToBranch(@Param("branchID") branchID: string,
                        @Param("orgID") orgID: string,
                        @GetUser() payload: AuthPayload,
                        @Body(ValidationPipe) dto: CreateDepartmentInBranchDto
  ) {
    return this.response({
      message: "Added Successfully",
      payload: await this.departmentService.addDepartment(dto, orgID, branchID, payload.email)
    });
  }




  @Post("/:orgID/RemoveDepartment/:deptID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async softRemoveDepartment(@Param("orgID") orgID: string,
                             @Param("deptID") deptID: string
  ) {
    return this.response({ payload: await this.departmentService.softRemoveDept(orgID, deptID) });
  }


  @Post("/:orgID/allDept")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllDepartmentsInOrg(@Param("orgID") orgID: string,
                               @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.departmentService.allDepartments(orgID, searchRequest) });
  }


  //search with branch name or code
  @Post("/:orgID/allDeptInBranch")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllDepartmentsInBranch(@Param("orgID") orgID: string,
                                  @Body() searchRequest: SearchBranchNameOrCodeDto
  ) {
    return this.response({ payload: await this.departmentService.allDepartmentsInBranch(orgID, searchRequest) });
  }

  @Get("/:orgID/allDeptInBranch/:branchID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllDepartmentsInBranchID(@Param("orgID") orgID: string,
                                    @Param("branchID") branchID: string
  ) {
    return this.response({ payload: await this.departmentService.allDepartmentsInBranchWithID(orgID, branchID) });
  }

  @Get("/:orgID/allEmployees/:deptID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allEmployeesInDepartment(@Param("orgID") orgID: string,
                                 @Param("deptID") deptID: string
  ) {
    return this.response({ payload: await this.departmentService.employeesInDepartment(orgID, deptID) });
  }


  @Get("/:orgID/headOfDepartment/:deptID/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async makeEmployeeHeadOfDepartment(@Param("orgID") orgID: string,
                                     @Param("deptID") deptID: string,
                                     @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.departmentService.employeeHeadOfDepartment(orgID, deptID, empID) });
  }

  @Post("/:orgID/headOfDepartment/:deptID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async headOfDepartment(@Param("orgID") orgID: string,
                         @Param("deptID") deptID: string,
                         @Body() dto: HeadOFDepartmentDto
  ) {
    return this.response({ payload: await this.departmentService.headOfDepartment(dto, orgID, deptID) });
  }


  @Get("/:orgID/headOfDepartment/:deptID/:empID/removeEmployee")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeEmployeeAsHeadOfDepartment(@Param("orgID") orgID: string,
                                         @Param("deptID") deptID: string,
                                         @Param("empID") empID: string) {
    return this.response({ payload: await this.departmentService.removeEmployeeAsHeadOfDept(orgID, empID, deptID) });
  }

  @Post("/:orgID/allHeadOfDepartments")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allHeadOfDepartments(@Param("orgID") orgID: string,
                             @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.departmentService.allHODs(orgID, searchRequest) });
  }
}
