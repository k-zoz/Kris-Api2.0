import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "@core/guard/roles.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { GetUser } from "@auth/model/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateOrgDto, EditOrgDto } from "@core/dto/back-office/organization.dto";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { SearchRequest } from "@core/model/search-request";

@Controller('organization')
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class OrganizationController extends BaseController{
  constructor(private readonly organizationService:OrganizationService) {
    super();
  }

  @Post("onboard")
  @Permission(UserRoleEnum.SUPPORT)
  async onboardOrganization(@GetUser() payload:AuthPayload,
                            @Body(ValidationPipe) request:CreateOrgDto
  ){
    console.log(request);
    return this.response({
      message:"Created successfully",
      payload: await this.organizationService.onboardOrganization(request, payload.email),
      status:HttpStatus.CREATED
    })
  }


  @Post()
  @Permission(UserRoleEnum.SUPPORT)
  async allOrganizations(@Body(ValidationPipe) searchRequest: SearchRequest){
    return this.response({payload:await this.organizationService.findAllOrg(searchRequest)})
  }


  @Get("/:ID")
  @Permission(UserRoleEnum.SUPPORT)
  async findOrgByID (@Param("ID") id: string){
    return this.response({payload:await this.organizationService.findOrgByID(id)})
  }


  @Post("edit/:ID")
  @Permission(UserRoleEnum.SUPPORT)
  async updateOrg(@GetUser() payload:AuthPayload,
                  @Param("ID") id :string,
                  @Body(ValidationPipe) request:EditOrgDto
  ){
    return this.response({
      message:'Changes saved Successfully',
      payload:await this.organizationService.editOrganization(request, id, payload.email)
    })
  }


  //Testing
  @Get("onboarders")
  @Permission(UserRoleEnum.SUPPORT)
  async getOnboarders(@GetUser() payload: AuthPayload) {
    console.log(payload);
  }
}
