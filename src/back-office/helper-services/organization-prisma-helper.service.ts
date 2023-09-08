import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { CreateOrgDto } from "@core/dto/global/organization.dto";
import { EmailService } from "../../alert/email/email.service";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { NewEmployeePasswordResetEvent, NewOrganizationEvent } from "@core/event/back-office-event";
import * as argon from "argon2";

@Injectable()
export class OrganizationPrismaHelperService {
  private readonly logger = new Logger(OrganizationPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  // private readonly resendKey = this.configService.get("resendApiKey")
  // private readonly resend = new Resend(this.resendKey);
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly emailService: EmailService,
              private readonly configService: ConfigService
  ) {
    // const resendKey = this.configService.get("resendApiKey")
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async findOrgByKrisId(krisID:string){
    const found = await this.prismaService.organization.findFirst({
      where:{
        orgKrisId:krisID
      }
    })

    if (!found) {
      const msg = `Organization with kris id ${krisID} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async findOrgByID(id) {
    const found = await this.prismaService.organization.findFirst({
      where: { id },
      include: {
        team: true,
        department: true,
        leavePlan: true,
        employees: {
          select: {
            firstname: true,
            role: true,
            email: true,
            Department: true,
            phoneNumber: true,
            id: true,
            Team: true
          }
        }

      }
    });
    if (!found) {
      const msg = `Organization with id ${id} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  // async saveOrganizationAndSendWelcomeEmail(org:CreateOrgDto, creatorEmail:string) {
  //   try {
  //     const saved = await this.prismaService.organization.create({
  //       data: {
  //         orgName: org.orgName,
  //         orgEmail: org.orgEmail,
  //         orgNumber: org.orgNumber,
  //         orgWebsite: org.orgWebsite,
  //         orgRCnumber: org.orgRCnumber,
  //         orgAddress: org.orgAddress,
  //         orgAddress2: org.orgAddress2,
  //         orgZipCode:org.orgZipCode,
  //         orgCity:org.orgCity,
  //         orgDateFounded:org.orgDateFounded,
  //         orgType:org.orgType,
  //         orgState: org.orgState,
  //         orgCountry: org.orgCountry,
  //         orgIndustry: org.orgIndustry,
  //         createdBy: creatorEmail
  //       }
  //     });
  //     this.logger.log(`Organization ${saved.orgName} saved successfully`);
  //     return saved;
  //   } catch (e) {
  //     const msg = `Error creating Organization ${org.orgName}`;
  //     this.logger.error(e);
  //     throw new AppConflictException(AppConst.error, { context: msg });
  //   }
  // }

  async saveOrganizationAndSendWelcomeEmail(org: CreateOrgDto, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.organization.create({
          data: {
            orgName: org.orgName,
            orgEmail: org.orgEmail,
            orgNumber: org.orgNumber,
            orgWebsite: org.orgWebsite,
            orgRCnumber: org.orgRCnumber,
            orgAddress: org.orgAddress,
            orgAddress2: org.orgAddress2,
            orgZipCode: org.orgZipCode,
            orgCity: org.orgCity,
            orgKrisId: org.orgKrisId,
            orgDateFounded: org.orgDateFounded,
            orgType: org.orgType,
            orgState: org.orgState,
            orgCountry: org.orgCountry,
            orgIndustry: org.orgIndustry,
            createdBy: creatorEmail
          }
        });
        try {
          const html = await this.emailService.sendWelcomeOrganizationDetailsMail({ organizationName: saved.orgName } as NewOrganizationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${saved.orgEmail}`,
            subject: "Welcome to KRIS",
            html: `${html}`
          });
          this.logger.log(`Organization ${saved.orgName}  Welcome Email successfully sent`);
          return `Organization ${saved.orgName}  Welcome Email successfully sent`;
        } catch (e) {
          this.logger.error("Error sending email");
          throw new AppException(e);
        }
      });
      this.logger.log("Organization created successfully");
      return "Organization created successfully";
    } catch (e) {
      const msg = `Error creating Organization ${org.orgName}`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  async updateOrg(id, org) {
    try {
      return await this.prismaService.organization.update({
        where: { id },
        data: {
          ...org
        }
      });
    } catch (e) {
      const msg = `Error updating Organization ${org.orgName}`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  //For the Organization model in prisma.
  //All the properties to be checked here are unique properties, so it checks to see if these unique properties have already been taken.
  //Property name a.k.a first argument in the checkEmpPropertyExists function must tally with how the name is saved in the Organization model in prisma.
  async validateDtoRequest(dto) {
    await this.checkOrgPropertyExists("orgName", dto.orgName, "");
    await this.checkOrgPropertyExists("orgWebsite", dto.orgWebsite, "Website");
    await this.checkOrgPropertyExists("orgEmail", dto.orgEmail, "Email address");
    await this.checkOrgPropertyExists("orgNumber", dto.orgNumber, "Phone number");
    await this.checkOrgPropertyExists("orgRCnumber", dto.orgRCnumber, "RC Number");
  }

  async checkOrgPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.organization.findUnique({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async findAllOrganizations(request) {
    const { skip, take } = request;
    try {
      const [organizations, total] = await this.prismaService.$transaction([
          this.prismaService.organization.findMany({
            select: {
              id: true,
              orgName: true,
              orgEmail: true,
              orgWebsite: true,
              orgAddress: true,
              orgRCnumber: true
            },
            skip,
            take
          }),
          this.prismaService.organization.count()
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, organizations };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }
  }

  async resetEmpPasswordAndSendResetMail(empID, modifierEmail, newPassword: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employee = await tx.employee.update({
          where: { id: empID },
          data: {
            password: await argon.hash(newPassword),
            modifiedBy: modifierEmail
          }
        });

        try {
          const html = await this.emailService.sendResetPasswordDetailsMail({
            email: employee.email,
            password: newPassword,
            firstname: employee.firstname
          } as NewEmployeePasswordResetEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            subject: "Password Reset",
            html: `${html}`
          });
          this.logger.log(`New Password Email Successfully sent to ${employee.email}`);
          this.logger.log(`User ${employee.email} password changed successfully`);
          return `User ${employee.email} password changed successfully`;
        } catch (e) {
          this.logger.error("Error sending email");
          throw new AppException(e);
        }
      });
      return `New Password Email Successfully sent`;
    } catch (e) {
      const msg = `Error resetting password`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }

  }
}
