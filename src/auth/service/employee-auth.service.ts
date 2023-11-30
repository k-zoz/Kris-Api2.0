import { Injectable, Logger } from "@nestjs/common";
import { LoginRequest } from "@auth/model/login-request";
import { EmployeeService } from "@back-office/employee/employee.service";
import { AppUnauthorizedException } from "@core/exception/app-exception";
import { JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { Employee } from "@core/dto/global/employee.dto";
import {
  OrgActivityLogPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-activity-log-prisma-helper.service";
import { ActivityLogDto } from "@core/dto/global/activity-log.dto";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class EmployeeAuthService {
  private readonly logger = new Logger(EmployeeAuthService.name);

  constructor(private readonly employeeService: EmployeeService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly activityLogService: OrgActivityLogPrismaHelperService,
              private readonly tokenService: TokenService,
              private readonly utilService: UtilService
  ) {}

  async employeeLogin(request: LoginRequest) {
    const { email, password } = request;
  //  request.email = this.utilService.toLowerCase(request.email)
    const employee = await this.employeeHelperService.findFirst(request.email);
    if (!employee || !(await this.employeeService.validatePassword(employee, request.password))) {
      this.logger.error(`Login failed ${request.email}`);
      throw new AppUnauthorizedException("Invalid email or password");
    }
    return this.authenticateEmployee(employee);
  }

  private async authenticateEmployee(employeeOrg: Employee) {
    const { email, role } = employeeOrg;
    const payload: JwtPayload = { email: email, role: role };
    const token = await this.tokenService.generateEmployeeAccessToken(payload);
    // const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.employeeHelperService.setUserRefreshToken(email, token);
    const employee = await this.employeeHelperService.findAndExcludeFields(employeeOrg);
    await this.activityLogService.createActivityLog({ description: `${employee.firstname} ${employee.lastname} logged in` } as ActivityLogDto, employee.organizationId);

    return { token, employee };
  }

}
