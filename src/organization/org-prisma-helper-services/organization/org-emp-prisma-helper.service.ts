import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { ConfirmInputPasswordDto } from "@core/dto/auth/user.dto";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@alert/email/email.service";
import { AppConst } from "@core/const/app.const";
import { Employee } from "@prisma/client";
import * as argon from "argon2";
import { PasswordChangeEvent } from "@core/event/back-office-event";
import { EmployeeUpdateRequest } from "@core/dto/global/employee.dto";


@Injectable()
export class OrgEmpPrismaHelperService {
  private readonly logger = new Logger(OrgEmpPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  //For the Employee model in prisma.
  //All the properties to be checked here are unique properties, so it checks to see if these unique properties have already been taken.
  //Property name a.k.a first argument in the checkEmpPropertyExists function must tally with how the name is saved in the Employee model in prisma.
  async validateRequest(dto) {
    await this.checkEmpPropertyExists("email", dto.basic.email, "Email address");
    await this.checkEmpPropertyExists("idNumber", dto.basic.employeeID, "ID Number");
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

  async findEmpTeam(teamID, empID) {
    const empTeam = await this.prismaService.employee.findFirst({
      where: {
        id: empID,
        teamId: teamID
      }
    });
    if (!empTeam) {
      throw  new AppNotFoundException(`Employee with id ${empID} does not belong to team `);
    }
    return empTeam;
  }

  // async isEmployeeTeamLeadVerification(empID, teamID) {
  //   const teamLead = await this.prismaService.teamLead.findFirst({
  //     where: {
  //       employeeId: empID,
  //       teamId: teamID
  //     }
  //   });
  //   if (!teamLead) {
  //     throw  new AppNotFoundException(`Can't find team lead ${empID} for team  ${teamID} `);
  //   }
  //   return teamLead;
  // }


  // async removeEmpTeamLead(empID, teamID, orgID) {
  //   try {
  //     await this.prismaService.$transaction(async (tx) => {
  //       await tx.teamLead.deleteMany({
  //         where: {
  //           employeeId: empID,
  //           teamId: teamID
  //         }
  //       });
  //
  //       await tx.team.update({
  //         where: {
  //           id: teamID
  //         },
  //         data: {
  //           teamLeadId: null
  //         }
  //       });
  //     });
  //     return "Action Successful";
  //   } catch (e) {
  //     this.logger.error(e);
  //     throw new AppException();
  //   }
  // }
  async findEmpDept(empID, deptID) {
    const empDept = await this.prismaService.employee.findFirst({
      where: {
        id: empID,
        departmentId: deptID
      }
    });
    if (!empDept) {
      throw  new AppNotFoundException(`Employee with id ${empID} does not belong to department `);
    }
    return empDept;
  }

  // async isEmployeeTeamLeadValidation(empID, teamID) {
  //   const teamLead = await this.prismaService.teamLead.findFirst({
  //     where: {
  //       employeeId: empID,
  //       teamId: teamID
  //     }
  //   });
  //
  //   if (teamLead) {
  //     throw new Error("Employee is already a team lead for this team");
  //   }
  // }

  async addEmpToDept(empID, deptID) {
    try {
      await this.prismaService.employee.update({
        where: {
          id: empID
        },
        data: {
          departmentId: deptID
        }
      });
      return "Employee Added Successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }


  async checkIfEmpIsAlreadyTeamMember(empID, teamID) {
    const teamMember = await this.prismaService.employee.findFirst({
      where: {
        id: empID,
        teamId: teamID
      }
    });

    if (teamMember) {
      throw new AppConflictException(`Employee ${empID} is already a member of team`);
    }
  }


  async checkIfEmpIsAlreadyInDept(empID, deptID) {
    const deptMember = await this.prismaService.employee.findFirst({
      where: {
        id: empID,
        departmentId: deptID
      }
    });
    if (deptMember) {
      throw new AppConflictException(`Employee ${empID} is already a member of department`);
    }
  }

  async addEmpToTeam(empID, teamID) {
    try {
      await this.prismaService.employee.update({
        where: {
          id: empID
        }, data: {
          teamId: teamID
        }
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  // async makeEmpTeamLead(empID, teamID, orgID) {
  //   try {
  //     await this.prismaService.$transaction(async (tx) => {
  //       const teamLead = await tx.teamLead.create({
  //         data: {
  //           teamId: teamID,
  //           employeeId: empID,
  //           organizationId: orgID
  //         }
  //       });
  //
  //
  //       await tx.team.update({
  //         where: {
  //           id: teamID
  //         },
  //         data: {
  //           teamLeadId: teamLead.id
  //         }
  //       });
  //     });
  //     return "Action Successful";
  //   } catch (e) {
  //     this.logger.error(e);
  //     throw new AppException();
  //   }
  // }
  async changeMyPasswordAndSendEmail(dto: ConfirmInputPasswordDto, employee: Employee) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.employee.update({
          where: {
            email: employee.email
          }, data: {
            password: await argon.hash(dto.newPassword)
          }
        });

        try {
          const html = await this.emailService.sendPasswordChangeSuccessfulEmail({ firstName: employee.firstname } as PasswordChangeEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            subject: "Password Change Successful",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${saved.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      });
      this.logger.log(`User ${employee.email} password changed successfully`);
      return `Password changed successfully`;
    } catch (e) {
      const msg = `Error changing  ${employee.email} password`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async updateMyProfile(dto: EmployeeUpdateRequest, employee: Employee) {
    try {
      await this.prismaService.employee.update({
        where: { id: employee.id },
        data: {
          firstname: dto.basic.firstName,
          lastname: dto.basic.lastName,
          middleName: dto.basic.middleName,
          personalEmail: dto.basic.personalEmail,
          phoneNumber: dto.basic.phoneNumber,
          personalPhoneNumber2: dto.basic.personalPhoneNumber2,
          dateOfBirth: dto.personal.dateOfBirth,
          gender: dto.personal.gender,
          maritalStatus: dto.personal.maritalStatus,
          address1: dto.residential.address1,
          address2: dto.residential.address2,
          country: dto.residential.country,
          state: dto.residential.state,
          city: dto.residential.city,
          zipCode: dto.residential.zipCode,
          nok_legalName: dto.nok.nok_legalName,
          nok_address: dto.nok.nok_address,
          nok_occupation: dto.nok.nok_occupation,
          nok_phoneNumber: dto.nok.nok_phoneNumber,
          nok_relationship: dto.nok.nok_relationship,
          nok_email: dto.nok.nok_email,
          gua_legalName: dto.gua.gua_legalName,
          gua_address: dto.gua.gua_address,
          gua_occupation: dto.gua.gua_occupation,
          gua_phoneNumber: dto.gua.gua_phoneNumber,
          gua_relationship: dto.gua.gua_relationship,
          gua_email: dto.gua.gua_email,
          accountNmumber: dto.financial.accountNumber,
          accountName: dto.financial.accountName,
          bankName: dto.financial.bankName,
          pensionManager: dto.financial.pensionManager,
          pensionNumber: dto.financial.pensionNumber
        }
      });
      return "Updated successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error updating profile");
    }
  }
}
