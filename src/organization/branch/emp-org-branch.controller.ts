import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import { EmpOrgBranchService } from "@organization/branch/emp-org-branch.service";

@Controller('organization/branch')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpOrgBranchController extends BaseController{
  constructor(private readonly branchService:EmpOrgBranchService) {
    super();
  }

  @Post("/:orgID/addBranch")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addBranchToOrg(@Param("orgID") orgID: string,
                       @GetUser() payload: AuthPayload,
                       @Body(ValidationPipe) dto:CreateBranchDto
  ){
return this.response({payload: await this.branchService.onboardBranchToOrg(dto, orgID, payload.email)})
  }
}
