import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { LoginRequest } from "@auth/model/login-request";
import { EmployeeService } from "@back-office/employee/employee.service";
import { AppUnauthorizedException } from "@core/exception/app-exception";
import { JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { Employee } from "@core/dto/global/employee.dto";

@Injectable()
export class EmployeeAuthService {
  private readonly logger = new Logger(EmployeeAuthService.name);

  constructor(private readonly employeeService: EmployeeService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly tokenService: TokenService
  ) {
  }

  async employeeLogin(request: LoginRequest) {
    const { email, password } = request;
    const employee = await this.employeeHelperService.findFirst(email);
    if (!employee || !(await this.employeeService.validatePassword(employee, password))) {
      this.logger.error(`Login failed ${email}`);
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
    return { token, employee };
  }

}
