import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeOrganizationService } from "@organization/employeeOrganization.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { EditOrgDto, MakeAnnouncementsDto } from "@core/dto/global/organization.dto";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { SkipThrottle } from "@nestjs/throttler";
import { HolidayDto } from "@core/dto/global/holiday";

@SkipThrottle()
@Controller("organization")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeOrganizationController extends BaseController {
  constructor(private readonly employeeOrganizationService: EmployeeOrganizationService,
              private readonly organizationService: OrganizationService
  ) {
    super();
  }


  @Get("/:orgID/information")
  async getOrgInfo(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.employeeOrganizationService.findOrgInfo(orgID) });
  }

  @Post("/:orgID/edit")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async updateOrg(@GetUser() payload: AuthPayload,
                  @Param("orgID") orgID: string,
                  @Body(ValidationPipe) request: EditOrgDto
  ) {
    return this.response({
      message: "Changes saved Successfully",
      payload: await this.organizationService.editOrganization(request, orgID, payload.email)
    });
  }

  @Post("/:orgID/makeAnnouncements")
  async postAnnouncement(@GetUser() payload: AuthPayload,
                         @Param("orgID") orgID: string,
                         @Body(ValidationPipe) dto: MakeAnnouncementsDto
  ) {
    return this.response({ payload: await this.organizationService.makeAnnouncements(dto, orgID, payload.email) });
  }

  @Get("/:orgID/employeesCount")
  async getEmployeesCount(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.allEmployeesCount(orgID) });
  }

  @Get("announcements")
  async myAnnouncements(@GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.organizationService.myAnnouncements(payload.email) });
  }

  @Get("/:orgID/birthdays")
  async allEmployeeBirthdays(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.employeeBirthdays(orgID) });
  }

  @Get("/:orgID/holidays")
  async allHolidays(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.allHolidays(orgID) });
  }

  @Get("/:orgID/monthlyBirthdays")
  async birthDayMonth(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.orgMonthlyBirthDays(orgID) });
  }

  @Get("/:orgID/anniversaries")
  async allEmployeeWorkAnniversary(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.employeeWorkAnniversary(orgID) });
  }

  @Get("/:orgID/monthlyAnniversary")
  async anniversariesMonth(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.orgMonthlyWorkAnniversary(orgID) });
  }

  @Get("/:orgID/monthlyHolidays")
  async monthlyHolidays(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.monthHolidays(orgID) });
  }

  @Get("/wiki/todayInHistory")
  async todayInHistory() {
    return this.response({ payload: await this.organizationService.wikiTodayInHistory() });
  }

  @Get("/:orgID/employeeStatistics")
  async employeeStatistics(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.organizationService.employeeStatistics(orgID) });
  }

  @Post("/:orgID/holidayCreate")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async createHoliday(@Param("orgID") orgID: string,
                      @Body(ValidationPipe) dto: HolidayDto,
                      @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.organizationService.createHoliday(orgID, dto, payload.email) });
  }


}
