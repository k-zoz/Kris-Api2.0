import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeOrgDepartmentsService } from "@organization/department/employee-org-departments.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ModifyOrg } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller('organization/department')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeOrgDepartmentsController extends BaseController{
  constructor(private readonly departmentService:EmployeeOrgDepartmentsService) {
    super();
  }

  @Post("/:orgID/addDepartment")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addDeptToOrganization(@Param("orgID") orgID: string,
                              @GetUser() payload: AuthPayload,
                              @Body(ValidationPipe) dto: ModifyOrg
  ) {
    return this.response({
      message: "Added Successfully",
      payload: await this.departmentService.addDepartment(dto, orgID)
    });
  }


  // TODO  HARD DELETE DEPT-This will also remove the department from its associated organization,
  //  as well as delete any associated Team and Employee records due to cascading delete behavior.
  //  Note that this operation will permanently delete the department and all its associated data,
  //  so it should be used with caution.
  @Post("/:orgID/forceRemoveDepartment/:deptID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async hardRemoveDepartment(@Param("orgID") orgID: string,
                             @Param("deptID") deptID: string,
  ){
    return this.response({payload: await this.departmentService.forceRemoveDept(orgID, deptID)})
  }


  @Post("/:orgID/RemoveDepartment/:deptID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async softRemoveDepartment(@Param("orgID") orgID: string,
                             @Param("deptID") deptID: string,
  ){
    return this.response({payload: await this.departmentService.softRemoveDept(orgID, deptID)})
  }



  @Post("/:orgID/allDept")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllDepartmentsInOrg(@Param("orgID") orgID: string,
                               @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.departmentService.allDepartments(orgID, searchRequest) });
  }

}
