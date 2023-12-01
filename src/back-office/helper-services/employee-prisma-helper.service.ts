import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { prismaExclude } from "@prisma/prisma-utils";
import {
  RoleToEmployee,
  Employee,
  EmployeeOnboardRequest,
  EmployeeWork,
  UpdateEmployeeWork, ClientEmployeeOnboardRequest, UpdateCertificateDto
} from "@core/dto/global/employee.dto";
import { AuthMsg } from "@core/const/security-msg-const";
import { LocaleService } from "@locale/locale.service";
import * as argon from "argon2";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@alert/email/email.service";
import { NewEmployeeEvent } from "@core/event/back-office-event";
import { Employee_Role, Organization } from "@prisma/client";
import { SearchRequest } from "@core/model/search-request";


@Injectable()
export class EmployeePrismaHelperService {
  private readonly logger = new Logger(EmployeePrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService,
              private readonly localeService: LocaleService) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
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
    const found = await this.prismaService.employee.findFirst({
      where: { id }
    });
    if (!found) {
      this.logger.error(AuthMsg.USER_NOT_FOUND);
      throw new AppNotFoundException(AuthMsg.USER_NOT_FOUND);
    }
    return found;
  }

  async findOneEmpAndExclude(empID) {
    try {
      const employee = await this.prismaService.employee.findFirst({
        where: { id: empID },
        include: {
          Organization: true,
          Team: true,
          Department: true,
          org_Branch: true,
          managedBranch: true,
          Org_Clientele: true,
          PayGroup: true,
          EmployeeCertificate: true,
          Employee_Appraisal: true,
          EmployeePayroll: true

        }
      });

      const { password, refreshToken, ...rest } = employee;
      return rest;
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException(AuthMsg.USER_NOT_FOUND);
    }
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


  async createEmployeeAndSendWelcomeEmail(dto, orgID, orgName) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.employee.create({
          data: {
            email: dto.empEmail,
            firstname: dto.empFirstName,
            password: await argon.hash(dto.empPassword),
            lastname: dto.empLastName,
            workPhoneNumber: dto.empPhoneNumber,
            idNumber: dto.empIDNumber,
            role: dto.employee_role,
            krisID: orgID.krisID,
            createdBy: dto.createdBy,
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
            password: dto.empPassword,
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
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      });
      return `Employee created successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ERROR_CREATING_EMPLOYEE });
    }
  }

  async findAndExcludeFields(user: Employee) {
    return this.prismaService.employee.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("Employee", ["password", "refreshToken", "email", "krisID", "idNumber", "phoneNumber",
        "status", "org_ClienteleId", "org_BranchId", "createdBy",
        "modifiedBy", "createdDate", "modifiedDate", "departmentId",
        "dateOfConfirmation", "dateOfJoining", "designation", "employment_type", "personalEmail", "personalPhoneNumber2", "workPhoneNumber",
        "payroll_PreviewId", "bonuses", "deduction", "gross_pay", "isEdit", "isSelected", "net_pay", "payGradeId", "payGroupId", "taxes",
        "dateOfBirth", "gender", "maritalStatus", "address1", "address2", "country", "state", "city", "zipCode", "accountName", "bankName", "accountNmumber", "pensionManager",
        "pensionNumber", "nok_address", "nok_legalName", "nok_relationship", "nok_occupation", "nok_phoneNumber", "nok_email", "gua_phoneNumber", "gua_legalName", "gua_address",
        "gua_occupation", "gua_email", "gua_relationship",
        "teamId"])
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

  async checkIfEmployeeAlreadyHaveRole(newRole: Employee_Role, employee: Employee) {
    const saved = await this.findEmpById(employee.id);
    if (saved.role.includes(newRole)) {
      throw new AppConflictException(`Employee already has ${newRole}`);
    }
  }

  async checkMinimumNumOfRoles(employee: Employee) {
    const saved = await this.findEmpById(employee.id);
    if (saved.role.length === 1) {
      throw new AppConflictException("Employee must have one role");
    }
  }

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.employee.update({
      where: { email },
      data: { refreshToken }
    });
  };

  async findAllEmployeesInOrg(request, orgID) {
    const { take, pageSize, pageIndex } = request;
    const skip = (pageIndex - 1) * pageSize;
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
                  krisID: true,
                  workPhoneNumber: true,
                  dateOfConfirmation: true,
                  dateOfJoining: true,
                  org_Branch: true,
                  Organization: true,
                  designation: true,
                  employment_type: true,
                  middleName: true,
                  Org_Clientele: true,
                  personalEmail: true,
                  personalPhoneNumber2: true,
                  managedBranch: true,
                  status: true,
                  phoneNumber: true,
                  idNumber: true,
                  Team: true,
                  Department: true
                }
              }
            }
            // skip,
            // take: pageSize
          }),
          this.prismaService.employee.count({ where: { organizationId: orgID } })
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, employees };
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Something went wrong, please try again.");
    }
  }


  async createNewEmployeeAndSendWelcomeMail(request: EmployeeOnboardRequest, newPassword: string, creatorMail: string, orgName) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        if (!request.work.employeeBranch) {
        }
        const branch = await tx.org_Branch.findFirst({
          where: {
            organizationId: orgName.id,
            name: request.work.employeeBranch
          }
        });

        if (!request.work.department) {
        }
        const department = await tx.department.findFirst({
          where: {
            organizationId: orgName.id,
            org_BranchId: branch.id,
            name: request.work.department
          }
        });

        // if (!request.work.empTeam) {
        // }
        // const team = await tx.team.findFirst({
        //   where: {
        //     organizationId: orgName.id,
        //     departmentId: department.id,
        //     name: request.work.empTeam
        //   }
        // });


        const saved = await tx.employee.create({
          data: {
            email: request.basic.email,
            password: await argon.hash(newPassword),
            lastname: request.basic.lastName,
            firstname: request.basic.firstName,
            idNumber: request.basic.employeeID,
            krisID: request.basic.krisID,
            phoneNumber: request.contact.personalPhoneNumber,
            workPhoneNumber: request.contact.workPhoneNumber,
            personalPhoneNumber2: request.contact.personalPhoneNumber2,
            personalEmail: request.contact.personalEmail,
            dateOfConfirmation: request.work.dateOfConfirmation,
            dateOfJoining: request.work.dateOfJoining,
            departmentId: department.id,
            designation: request.work.designation,
            //  teamId: team.id,
            org_BranchId: branch.id,
            role: request.work.employeeKrisRole,
            status: request.work.employeeStatus,
            employment_type: request.work.employmentType,
            createdBy: creatorMail,
            middleName: request.basic.middleName,
            organizationId: orgName.id
          }
        });

        try {
          const html = await this.emailService.sendWelcomeEmployeeDetailMail({
            email: saved.email,
            password: newPassword,
            firstname: saved.firstname,
            organizationName: orgName.orgName
          } as NewEmployeeEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${saved.email}`,
            subject: `Welcome to ${orgName.orgName}`,
            html: `${html}`
          });
          this.logger.log(`Employee ${saved.firstname} Saved. Welcome Email successfully sent`);
          return saved;
        } catch (e) {
          this.logger.error(e, "Error sending email");
          throw new AppException(e);
        }
      }, { maxWait: 5000, timeout: 10000 });

    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ERROR_CREATING_EMPLOYEE });
    }
  }

  async updateEmployeeWorkDetails(dto: UpdateEmployeeWork, employee:Employee, orgName, modifierMail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        if (!dto.employeeBranch) {
        }
        const branch = await tx.org_Branch.findFirst({
          where: {
            organizationId: orgName.id,
            name: dto.employeeBranch
          }
        });

        if (!dto.department) {
        }
        const department = await tx.department.findFirst({
          where: {
            organizationId: orgName.id,
            org_BranchId: branch.id,
            name: dto.department
          }
        });

        if (!dto.empTeam) {
        }
        const team = await tx.team.findFirst({
          where: {
            organizationId: orgName.id,
            departmentId: department.id,
            name: dto.empTeam
          }
        });

        // if (!dto.payGroup) {
        // }
        // const payGroup = await tx.payGroup.findFirst({
        //   where: {
        //     organizationId: orgName.id,
        //     name: dto.payGroup
        //   }
        // });


        const saved = await tx.employee.update({
          where: {
            id: employee.id
          }, data: {
            idNumber: dto.idNumber,
            email: dto.email,
            workPhoneNumber: dto.workPhoneNumber,
            designation: dto.designation,
            employment_type: dto.employmentType,
            status: dto.employeeStatus,
            dateOfJoining: dto.dateOfJoining,
            dateOfConfirmation: dto.dateOfConfirmation,
            org_BranchId: branch.id,
            departmentId: department.id,
            teamId: team.id,
            // payGroupId: payGroup.id
          }
        });
      }, { maxWait: 5000, timeout: 10000 });
      return "Profile updated successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error updating employee profile");
    }
  }

  async createNewEmployeeForClient(request: ClientEmployeeOnboardRequest, newPassword: string, email: string, orgName, client) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.employee.create({
          data: {
            email: request.basic.email,
            password: await argon.hash(newPassword),
            lastname: request.basic.lastName,
            firstname: request.basic.firstName,
            idNumber: request.basic.employeeID,
            krisID: request.basic.krisID,
            phoneNumber: request.contact.personalPhoneNumber,
            workPhoneNumber: request.contact.workPhoneNumber,
            personalPhoneNumber2: request.contact.personalPhoneNumber2,
            personalEmail: request.contact.personalEmail,
            dateOfConfirmation: request.clientWork.dateOfConfirmation,
            dateOfJoining: request.clientWork.dateOfJoining,
            role: request.clientWork.employeeKrisRole,
            status: request.clientWork.employeeStatus,
            employment_type: request.clientWork.employmentType,
            org_ClienteleId: client.id,
            createdBy: email,
            middleName: request.basic.middleName,
            organizationId: orgName.id
          }
        });
        try {
          const html = await this.emailService.sendWelcomeEmployeeDetailMail({
            email: saved.email,
            password: newPassword,
            firstname: saved.firstname,
            organizationName: orgName.orgName
          } as NewEmployeeEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${saved.email}`,
            subject: `Welcome to ${orgName.orgName}`,
            html: `${html}`
          });
          this.logger.log(`Employee ${saved.firstname} Saved. Welcome Email successfully sent`);
          return `Employee ${saved.firstname}  Welcome Email successfully sent`;
        } catch (e) {
          this.logger.error(e, "Error sending email");
          throw new AppException(e);
        }
      }, { maxWait: 5000, timeout: 10000 });
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: AuthMsg.ERROR_CREATING_EMPLOYEE });
    }
  }

  async createManyEmployees(employeeObj: any[], employeeUploads: any[], organization: Organization) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.employee.createMany({
          data: employeeObj
        });
      }, { maxWait: 5000, timeout: 10000 });

      await this.sendBulkEmails(employeeUploads, organization);

    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error adding bulk employees");
    }
  }


  async sendBulkEmails(employeeUploads, organization) {
    const emailPromises = employeeUploads.map(employee => {
      return this.resend.emails.send({
        from: `${this.mailSource}`,
        to: `${employee.email}`,
        subject: `Welcome to ${organization.orgName}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
    }

    .content {
      padding: 20px;
    }

    .footer {
      background-color: #4CAF50;
      color: white;
      padding: 10px;
    }

    .button {
      background-color: blue;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 15px;
    }
  </style>
  <meta charset="UTF-8">
  <title>Welcome</title>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Welcome to ${organization.orgName}</h1>
  </div>
  <div class="content">
    <p>Dear ${employee.firstname},</p>
    <p>We are thrilled to welcome you to ${organization.orgName}. We are excited to have you on board and look forward to
      working with you.</p>
    <p>As a new employee, you will have access to our online platform where you can find important information and
      resources. To log in, please use the following credentials:</p>
    <ul>
      <li>Email: ${employee.email}</li>
      <li>Password:</li>
      <li style="font-weight: bold;"> ${employee.password}</li>
    </ul>
    <p>For security reasons, we recommend that you change your password after logging in for the first time.</p>
    <p>If you have any questions or need assistance, please do not hesitate to contact us. We are here to support you
      and help you succeed in your new role.</p>
    <a href="https://kris-1d979.web.app/#/auth" target="_blank" class="button">Log In!</a>
    <p>Once again, welcome to ${organization.orgName}. We are delighted to have you on our team!</p>
    <p>Sincerely,</p>
    <p>The ${organization.orgName} Team</p>
  </div>
  <div class="footer">

    <p style="text-align:center;font-size:12px;font-family:arial,sans-serif;color:#ffffff">
      Sent to you by
      <a href="javascript:void(0);" style="color:#ffffff" target="_blank">kris.io</a>
      <br>
      <a href="javascript:void(0);" style="color:#ffffff" target="_blank">Privacy Policy</a> |
      <a href="javascript:void(0);" style="color:#ffffff" target="_blank">FAQs</a> |
      <a href="javascript:void(0);" style="color:#ffffff" target="_blank">support@kris.io</a>
    </p>
    <br>
    <div style="text-align:center;">
      <a href="javascript:void(0);" style="text-decoration: none; padding-right: 10px" target="_blank">
        <img src="https://res.cloudinary.com/doughflip/image/upload/v1641723181/logo/Facebook_h7mtr1.png"
             alt="Facebook" width="35">
      </a>
      <a href="javascript:void(0);" style="text-decoration: none; padding-right: 10px" target="_blank">
        <img src="https://res.cloudinary.com/doughflip/image/upload/v1641723181/logo/Linkedin_eb8qkh.png"
             alt="Linkedin" width="35">
      </a>
      <a href="javascript:void(0);" style="text-decoration: none; padding-right: 10px" target="_blank">
        <img src="https://res.cloudinary.com/doughflip/image/upload/v1641723181/logo/Instagram_lcbyme.png"
             alt="Instagram" width="35">
      </a>
      <a href="javascript:void(0);" style="text-decoration: none" target="_blank">
        <img src=https://res.cloudinary.com/doughflip/image/upload/v1641723181/logo/Twitter_pyepek.png"
             alt="Twitter" width="35">
      </a>
    </div>
  </div>
</div>

</body>

</html>`
      }).then(() => {
        this.logger.log(`Welcome email successfully sent to ${employee.email}`);
      }).catch(e => {
        this.logger.error(`Error sending email to ${employee.email}`);
        throw new AppException(e);
      });
    });

    await Promise.all(emailPromises);
  }

  async allBulkCreatedEmployees(organization: Organization, dto: SearchRequest) {
    const today = new Date();
    const { skip, take } = dto;
    try {

      const [employees, total] = await this.prismaService.$transaction([
        this.prismaService.employee.findMany({
          where: {
            organizationId: organization.id,
            createdDate: today
          }, select: {
            email: true,
            firstname: true,
            lastname: true,
            role: true,
            idNumber: true
          },
          skip,
          take
        }),
        this.prismaService.employee.count({
          where: {
            organizationId: organization.id
          }
        })
      ]);
      return { employees, total };
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting statistics. Contact Support");
    }
  }

  async hrEmployees(organization: Organization) {
    try {
      return await this.prismaService.employee.findMany({
        where: {
          organizationId: organization.id,
          role: {
            hasSome: ["HUMAN_RESOURCE", "MANAGEMENT"]
          }
        },
        select: {
          role: true,
          lastname: true,
          firstname: true,
          email: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw  new AppException();
    }
  }

  async uploadCert(employee: Employee, dto: UpdateCertificateDto) {
    try {
      return await this.prismaService.employeeCertificate.create({
        data: {
          employeeId: employee.id,
          certUrl: dto.certUrl,
          certName: dto.certName
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw  new AppException("Unable to save upload. Try again!");
    }
  }

  async certificatesAll(employee: Employee) {
    try {
      return await this.prismaService.employeeCertificate.findMany({
        where: {
          employeeId: employee.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw  new AppException("Unable to save upload. Try again!");
    }
  }

  async deleteCert(certificateID: string) {
    try {
      return await this.prismaService.employeeCertificate.delete({
        where: { id: certificateID }
      });
    } catch (e) {
      this.logger.error(e);
      throw  new AppException("Unable to save upload. Try again!");
    }
  }
}
