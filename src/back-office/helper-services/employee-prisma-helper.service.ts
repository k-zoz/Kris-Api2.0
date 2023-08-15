import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { prismaExclude } from "@prisma/prisma-utils";
import { RoleToEmployee, Employee } from "@core/dto/global/employee.dto";
import { AuthMsg } from "@core/const/security-msg-const";
import { LocaleService } from "@locale/locale.service";
import * as argon from "argon2";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "../../alert/email/email.service";
import { NewEmployeeEvent } from "@core/event/back-office-event";


@Injectable()
export class EmployeePrismaHelperService {
  private readonly logger = new Logger(EmployeePrismaHelperService.name);
  // private readonly resendKey = this.configService.get("resendApiKey")
  // private readonly resend = new Resend(this.resendKey);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;
  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService,
              private readonly localeService: LocaleService) {
    const resendKey = this.configService.get("resendApiKey")
    this.resend = new Resend("re_fDGEEX19_ApMHyit8rirENaRa6R4c7htQ");
  }

  async findFirst(email: string) {
    const user = await this.prismaService.employee.findFirst({ where: { email } });
    if (!user) {
      this.logger.error(AuthMsg.INVALID_EMAIL_OR_PASSWORD);
      throw new AppNotFoundException(AuthMsg.INVALID_EMAIL_OR_PASSWORD);
    }
    return user;
  }

  async findEmpById(id) {
    const found = await this.prismaService.employee.findFirst({ where: { id } });
    if (!found) {
      this.logger.error(AuthMsg.USER_NOT_FOUND);
      throw new AppNotFoundException(AuthMsg.USER_NOT_FOUND);
    }
    return found;
  }

  async editEmployee(email, request) {
    try {
      await this.prismaService.employee.update({
        where: { email },
        data: {
          firstname: request.empFirstName,
          lastname: request.empLastName,
          phoneNumber: request.empPhoneNumber,
          idNumber: request.empIDNumber,
          email: request.empEmail,
          password: request.empPassword
        }
      });
      return AuthMsg.PROFILE_UPDATED;
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AuthMsg.ERROR_UPDATING_EMPLOYEE);
    }

  }

  async findEmpByEmail(email: string) {
    const found = await this.prismaService.employee.findFirst({ where: { email } });
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

  // async createEmployee(orgEmp, orgID) {
  //   try {
  //     return await this.prismaService.employee.create({
  //       data: {
  //         email: orgEmp.empEmail,
  //         firstname: orgEmp.empFirstName,
  //         password:await argon.hash(orgEmp.empPassword),
  //         lastname: orgEmp.empLastName,
  //         phoneNumber: orgEmp.empPhoneNumber,
  //         idNumber: orgEmp.empIDNumber,
  //         role: orgEmp.employee_role,
  //         createdBy: orgEmp.createdBy,
  //         Organization: {
  //           connect: {
  //             id: orgID
  //           }
  //         }
  //       }
  //     });
  //   } catch (e) {
  //     this.logger.error(AuthMsg.ERROR_CREATING_EMPLOYEE);
  //     throw new AppConflictException(AppConst.error, { context: AuthMsg.ERROR_CREATING_EMPLOYEE });
  //   }
  // }


  async createEmployeeAndSendWelcomeEmail(orgEmp, orgID, orgName) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.employee.create({
          data: {
            email: orgEmp.empEmail,
            firstname: orgEmp.empFirstName,
            password: await argon.hash(orgEmp.empPassword),
            lastname: orgEmp.empLastName,
            phoneNumber: orgEmp.empPhoneNumber,
            idNumber: orgEmp.empIDNumber,
            role: orgEmp.employee_role,
            krisID: orgID.krisID,
            createdBy: orgEmp.createdBy,
            Organization: {
              connect: {
                id: orgID
              }
            }
          }
        });
        try {
          const html = await this.emailService.sendWelcomeEmployeeDetailMail({
            email: saved.email,
            password: orgEmp.empPassword,
            firstname: saved.firstname,
            organizationName: orgName
          } as NewEmployeeEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${saved.email}`,
            subject: `Welcome to ${orgName}`,
            html: `${html}`
          });
          this.logger.log(`Employee ${saved.firstname} Saved. Welcome Email successfully sent`);
          return `Employee ${saved.firstname}  Welcome Email successfully sent`;
        } catch (e) {
          this.logger.error(e, "Error sending email");
          throw new AppException(e);
        }
      });
      return `Employee created successfully`;
    } catch (e) {
      this.logger.error(AuthMsg.ERROR_CREATING_EMPLOYEE);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ERROR_CREATING_EMPLOYEE });
    }
  }

  async findAndExcludeFields(user: Employee) {
    return this.prismaService.employee.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("Employee", ["password", "refreshToken", "email", "krisID", "idNumber", "phoneNumber",
        "status", "org_ClienteleId", "org_BranchId", "createdBy", "modifiedBy", "createdDate", "modifiedDate", "departmentId", "teamId", "role"])
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

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.employee.update({
      where: { email },
      data: { refreshToken }
    });
  };

  async findAllEmployeesInOrg(request, orgID) {
    const { skip, take } = request;
    try {
      const [employees, total] = await this.prismaService.$transaction([
          this.prismaService.organization.findFirst({
            where: { id: orgID },
            select: {
              employees: {
                select: {
                  firstname: true,
                  lastname: true,
                  email: true,
                  role: true,
                  id: true,
                  phoneNumber: true,
                  idNumber: true,
                  Team: true,
                  Department: true
                }
              }
            },
            skip,
            take
          }),
          this.prismaService.employee.count({ where: { organizationId: orgID } })
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, employees };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }
  }


}
