import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { CreateOrgDto, MakeAnnouncementsDto } from "@core/dto/global/organization.dto";
import { EmailService } from "@alert/email/email.service";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { NewEmployeePasswordResetEvent, NewOrganizationEvent } from "@core/event/back-office-event";
import * as argon from "argon2";
import { Employee, Organization, Prisma } from "@prisma/client";
import { EmployeeStatistics } from "@core/dto/global/employee.dto";
import { PaginatedResult, PaginateFunction, paginator } from "@prisma/pagination";
import { SearchRequest } from "@core/model/search-request";

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()


export class OrganizationPrismaHelperService {
  private readonly logger = new Logger(OrganizationPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly emailService: EmailService,
              private readonly configService: ConfigService
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async findOrgByKrisId(krisID: string) {
    const found = await this.prismaService.organization.findFirst({
      where: {
        orgKrisId: krisID
      }
    });

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

  async makeAnnouncementPost(announcer: Employee, dto: MakeAnnouncementsDto) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const announcement = await tx.organizationAnnouncement.create({
          data: {
            title: dto.title,
            content: dto.content,
            organization: {
              connect: {
                id: announcer.organizationId
              }
            },
            createdBy: announcer.email
          }
        });

        const employees = await tx.employee.findMany({
          where: {
            organizationId: announcer.organizationId
          }
        });

        const employeeAnnouncementData = employees.map((employee) => ({
          employeeId: employee.id,
          orgAnnouncementID: announcement.id,
          content: dto.content,
          title: dto.title,
          createdBy: announcer.email
        }));

        await tx.employeeAnnouncement.createMany({
          data: employeeAnnouncementData
        });
        return "Successfully posted";
      }, { maxWait: 5000, timeout: 10000 });

    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error making announcement. Contact Support");
    }
  }

  async allMyOrganizationAnnouncements(employee: Employee, organization: Organization) {
    try {
      return await this.prismaService.employeeAnnouncement.findMany({
        where: {
          employeeId: employee.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting my announcements. Contact Support");
    }
  }

  async employeesCount(organization: Organization) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    try {
      const [employees, newEmployees] = await this.prismaService.$transaction([
        this.prismaService.employee.count({
          where: { organizationId: organization.id }
        }),

        this.prismaService.employee.count({
          where: {
            organizationId: organization.id, createdDate: {
              gte: oneMonthAgo
            }
          }
        })
      ]);
      return { employees, newEmployees };
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting employees. Contact Support");
    }
  }

  async birthdays(organization: Organization) {
    try {
      const employeesBirthDateData = {};
      const today = new Date();
      const employees = await this.prismaService.employee.findMany({
        where: { organizationId: organization.id },
        select: {
          firstname: true,
          lastname: true,
          middleName: true,
          email: true,
          dateOfBirth: true
        }
      });

      employees.forEach(employee => {
        if (employee.dateOfBirth) {
          const month = employee.dateOfBirth.getMonth() + 1; // months are zero-based in JavaScript
          const date = employee.dateOfBirth.getDate();

          if (!employeesBirthDateData[`${month}-${date}`]) {
            employeesBirthDateData[`${month}-${date}`] = [];
          }
          const type = (employee.dateOfBirth.getMonth() < today.getMonth() ||
            (employee.dateOfBirth.getMonth() === today.getMonth() && date < today.getDate())) ? "success" : "warning";

          employeesBirthDateData[`${month}-${date}`].push({
            type: type,
            content: `${employee.firstname} ${employee.lastname} ${employee.middleName}'s Birthday`
          });
        }
      });

      return employeesBirthDateData;

    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting birthdays. Contact Support");
    }
  }


  async birthdaysInTheMonth(organization: Organization) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    try {
      return await this.prismaService.employee.findMany({
        where: {
          organizationId: organization.id,
          dateOfBirth: {
            gte: new Date(currentYear, currentMonth, 1), // start of the current month
            lt: new Date(currentYear, currentMonth + 1, 1) // start of the next month
          }
        },
        select: { firstname: true, lastname: true, email: true, dateOfBirth: true }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting birthdays. Contact Support");
    }
  }

  async anniversaryInTheMonth(organization: Organization) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    try {
      return await this.prismaService.employee.findMany({
        where: {
          organizationId: organization.id,
          dateOfJoining: {
            gte: new Date(currentYear, currentMonth, 1), // start of the current month
            lt: new Date(currentYear, currentMonth + 1, 1) // start of the next month
          }
        },
        select: { firstname: true, lastname: true, email: true, dateOfJoining: true }
      });

    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting work anniversaries. Contact Support");
    }
  }

  async anniversaries(organization: Organization) {
    try {
      const employeesWorkAnniversaryData = {};
      const today = new Date();
      const employees = await this.prismaService.employee.findMany({
        where: { organizationId: organization.id },
        select: {
          firstname: true,
          lastname: true,
          middleName: true,
          email: true,
          dateOfJoining: true
        }
      });
      employees.forEach(employee => {
        if (employee.dateOfJoining) {
          const month = employee.dateOfJoining.getMonth() + 1; // months are zero-based in JavaScript
          const date = employee.dateOfJoining.getDate();

          if (!employeesWorkAnniversaryData[`${month}-${date}`]) {
            employeesWorkAnniversaryData[`${month}-${date}`] = [];
          }
          const type = (employee.dateOfJoining.getMonth() < today.getMonth() ||
            (employee.dateOfJoining.getMonth() === today.getMonth() && date < today.getDate())) ? "success" : "warning";

          employeesWorkAnniversaryData[`${month}-${date}`].push({
            type: type,
            content: `${employee.firstname} ${employee.lastname} ${employee.middleName}'s work anniversary`
          });
        }
      });

      return employeesWorkAnniversaryData;

    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting work anniversaries. Contact Support");
    }
  }

  async employeeStatistics(organization: Organization) {
    try {
      const [male, female, others] = await this.prismaService.$transaction([
        this.prismaService.employee.count({
          where: {
            organizationId: organization.id,
            gender: "Male"
          }
        }),

        this.prismaService.employee.count({
          where: {
            organizationId: organization.id,
            gender: "Female"
          }
        }),

        this.prismaService.employee.count({
          where: {
            organizationId: organization.id,
            gender: "Others"
          }
        })
      ]);
      return { male, female, others } as EmployeeStatistics;
    } catch (e) {
      this.logger.error(e);
      throw new AppConflictException("Error getting statistics. Contact Support");
    }
  }



  // async findMany({ where, orderBy, page, select }:{ where?: Prisma.UserWhereInput, orderBy?: Prisma.UserOrderByWithRelationInput, page?: number, select?:Prisma.DeductionSelect }): Promise<PaginatedResult<Employee>> {
  //   return paginate(
  //     this.prismaService.employee,
  //     {
  //       where,
  //       orderBy,
  //     },
  //     {
  //       page,
  //     },
  //   );
  // }
}
