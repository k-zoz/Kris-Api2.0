import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { prismaExclude } from "@prisma/prisma-utils";
import { RoleToEmployee, Employee } from "@core/dto/global/employee.dto";
import { AuthMsg } from "@core/const/security-msg-const";
import { LocaleService } from "@locale/locale.service";

@Injectable()
export class EmployeeHelperService {
  private readonly logger = new Logger(EmployeeHelperService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly localeService: LocaleService) {
  }

  async findEmpById(id) {
    const found = await this.prismaService.employee.findFirst({ where: { id } });
    if (!found) {
      this.logger.error(AuthMsg.USER_NOT_FOUND);
      throw new AppNotFoundException(AuthMsg.USER_NOT_FOUND);
    }
    return found;
  }

  //For the Employee model in prisma.
  //All the properties to be checked here are unique properties, so it checks to see if these unique properties have already been taken.
  //Property name a.k.a first argument in the checkEmpPropertyExists function must tally with how the name is saved in the Employee model in prisma.
  async validateRequest(dto) {
    await this.checkEmpPropertyExists("email", dto.empEmail, "Email address");
    await this.checkEmpPropertyExists("idNumber", dto.empIDNumber, "ID Number");
    await this.checkEmpPropertyExists("phoneNumber", dto.empPhoneNumber, "Phone Number");
  }

  async checkEmpPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.employee.findUnique({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async createEmployee(orgEmp, orgID) {
    try {
      return await this.prismaService.employee.create({
        data: {
          email: orgEmp.empEmail,
          firstname: orgEmp.empFirstName,
          password: orgEmp.empPassword,
          lastname: orgEmp.empLastName,
          phoneNumber: orgEmp.empPhoneNumber,
          idNumber: orgEmp.empIDNumber,
          role: orgEmp.employee_role,
          createdBy: orgEmp.createdBy,
          Organization: {
            connect: {
              id: orgID
            }
          }
        }
      });
    } catch (e) {
      this.logger.error(AuthMsg.ROLE_NOT_UPDATED);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ROLE_NOT_UPDATED });
    }
  }


  async findAndExcludeFields(user: Employee) {
    return this.prismaService.employee.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("Employee", ["password", "refreshToken"])
    });
  }

  async changeRole(request: RoleToEmployee, empID: string) {
    try {
      await this.prismaService.employee.update({
        where: { id: empID },
        data: {
          role: request.employee_role,
          modifiedBy: request.modifiedBy
        }
      });
      return this.localeService.resolveMessage(AuthMsg.ROLE_UPDATED);
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ROLE_NOT_UPDATED });
    }
  }

  async addRolesToEmployee(request, empID) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employee = await tx.employee.findUnique({
          where: {
            id: empID
          },
          select: {
            role: true
          }
        });
        await tx.employee.update({
          where: {
            id: empID
          },
          data: {
            role: {
              set: [...employee.role, request.employee_role]
            },
            modifiedBy: request.modifiedBy
          }
        });
      });
      return this.localeService.resolveMessage(AuthMsg.ROLE_ADDED);
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ROLE_NOT_UPDATED });
    }
  }

  async removeRole(request, empID) {
    try {
      const employee = await this.prismaService.employee.findUnique({
        where: {
          id: empID
        },
        select: {
          role: true
        }
      });
      const updatedRole = employee.role.filter(role => role !== request.employee_role);
      const [updatedEmployee] = await this.prismaService.$transaction([
        this.prismaService.employee.update({
          where: {
            id: empID
          },
          data: {
            role: {
              set: updatedRole
            }
          }
        })
      ]);
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error);
    }
  }

  async checkMaximumNumOfRoles(employee: Employee) {
    const saved = await this.findEmpById(employee.id);
    if (saved.role.length >= 2) {
      throw new AppConflictException(AuthMsg.CANNOT_ASSIGN_MORE_THAN_TWO_ROLES_TO_ONE_EMPLOYEE);
    }
  }

  async checkIfRoleIsManagement(role: string | string[]) {
    if (typeof role === "string") {
      if (role === "MANAGEMENT") {
        this.logger.error(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
        throw new AppException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }
    if (Array.isArray(role)) {
      if (role.some(r => r === "MANAGEMENT")) {
        this.logger.error(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
        throw new AppException(this.localeService.resolveMessage(AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE));
      }
    }

  }

}




