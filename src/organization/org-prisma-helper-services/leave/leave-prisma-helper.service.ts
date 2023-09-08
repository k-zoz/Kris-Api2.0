import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { CreateLeaveDto } from "@core/dto/global/leave.dto";
import { LeaveApprovalEvent, PasswordChangeEvent } from "@core/event/back-office-event";
import { EmailService } from "@alert/email/email.service";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LeavePrismaHelperService {
  private readonly logger = new Logger(LeavePrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async createLeavePlanAndEmployeeLeave(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const leave = await tx.leave.create({
          data: {
            name: dto.leaveName,
            duration: dto.leaveDuration,
            type: dto.leaveType,
            createdBy: creatorEmail,
            Organization: {
              connect: { id: orgID }
            }
          }
        });

        const employees = await tx.employee.findMany({
          where: {
            organizationId: orgID
          }
        });

        const employeeLeaveData = employees.map((employee) => ({
          employeeId: employee.id,
          leaveId: leave.id,
          remainingDuration: dto.leaveDuration,
          leaveName: dto.leaveName
        }));

        await tx.employeeLeave.createMany({
          data: employeeLeaveData
        });
      }, { maxWait: 5000, timeout: 10000 });
      return AuthMsg.LEAVE_CREATED;
    } catch (e) {
      this.logger.error(e);
      throw new AppException(AuthMsg.ERROR_CREATING_LEAVE);
    }
  }

  async findLeaveDuplicates(dto, orgID) {
    const existingLeave = await this.prismaService.leave.findFirst({
      where: {
        name: { contains: dto.leaveName },
        organizationId: orgID
      }
    });
    if (existingLeave) {
      throw new AppConflictException("Leave plan already exists");
    }
  }

  async applyLeave(dto, orgID, employee) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const leave = await tx.leave.findFirst(
          {
            where: {
              name: dto.leaveName,
              organizationId: orgID
            }
          }
        );

        //Employee's instance of his own leave
        const employeeLeave = await tx.employeeLeave.findFirst({
          where: {
            employeeId: employee.id,
            leaveId: leave.id
          }
        });

        const leaveApplication = await tx.leaveApplication.create({
          data: {
            leaveName: dto.leaveName,
            duration: dto.leaveDuration,
            startDate: dto.leaveStartDate,
            endDate: dto.leaveEndDate,
            employeeId: employee.id,
            leaveId: leave.id
          }
        });

        const updatedEmployeeLeave = await tx.employeeLeave.update({
          where: {
            employeeId_leaveId: {
              employeeId: employee.id,
              leaveId: leave.id
            }
          },
          data: {
            remainingDuration: {
              decrement: dto.leaveDuration
            }
          }
        });

        try {
          const html = await this.emailService.sendLeaveApprovalEmail({
            employeeName: employee.firstname,
            leaveEndDate: dto.leaveEndDate,
            leaveStartDate: dto.leaveStartDate
          } as LeaveApprovalEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            subject: "Leave Status",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      });
      return "Applied Successfullly";
    } catch (e) {
      this.logger.error(e);
      throw new AppException(AuthMsg.ERROR_APPLYING_LEAVE);
    }
  }

  async leaveDurationRequest(employee, dto) {
    const employeeLeave = await this.findEmpLeaveByName(dto.leaveName, employee);
    if (dto.leaveDuration > employeeLeave.remainingDuration) {
      throw  new AppException(AuthMsg.EMPLOYEE_HAS_LESS_LEAVE_DAYS);
    }
    if (employeeLeave.remainingDuration <= 0) {
      throw  new AppException(AuthMsg.EMPLOYEE_HAS_LESS_LEAVE_DAYS);
    }
  }

  async getMyLeaveHistory(orgID, employee) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const employeeLeave = await tx.employeeLeave.findMany({
          where: {
            employeeId: employee.id
          }, include: {
            leave: true
          }
        });

        const leaveApplications = await tx.leaveApplication.findMany({
          where: {
            employeeId: employee.id
          }
        });
        return { employeeLeave, leaveApplications };
      });

    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async findOrgLeaveByName(leaveName, orgID) {
    const leave = await this.prismaService.leave.findFirst({
      where: {
        name: leaveName
      }
    });

    if (!leave) {
      throw  new AppNotFoundException("Leave Plan does not exist");
    }
    return leave;
  }

  async findEmpLeaveByName(leaveName, employee) {
    const employeeLeave = await this.prismaService.employeeLeave.findFirst({
      where: {
        employeeId: employee.id,
        leaveName: leaveName
      }
    });

    if (!employeeLeave) {
      throw  new AppNotFoundException("Employee Leave Plan does not exist");
    }
    return employeeLeave;
  }

  async leaveOnboarding(orgID, employee) {
    const leaves = await this.findAllLeavePlansForOrg(orgID);
    try {
      await this.prismaService.$transaction(async (tx) => {
        const leavesForOrg = await tx.leave.findMany({
          where: {
            organizationId: orgID
          }
        });

        const employeeLeaveDate = leaves.map((leave) => ({
          employeeId: employee.id,
          leaveId: leave.id,
          remainingDuration: leave.duration,
          leaveName: leave.name
        }));
        await tx.employeeLeave.createMany({
          data: employeeLeaveDate
        });

      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllLeavePlansForOrg(orgID) {
    try {
      return await this.prismaService.leave.findMany({
        where: { Organization: { id: orgID } }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async deleteEmpLeavePlans(orgID: string, empID: string) {
    try {
      const [leaveApplications, employeeLeave] = await this.prismaService.$transaction([
        this.prismaService.leaveApplication.deleteMany({
          where: {
            employeeId: empID
          }
        }),

        this.prismaService.employeeLeave.deleteMany({
          where: {
            employeeId: empID
          }
        })
      ]);
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  // async findAllEmpLeaveHistory(orgID: string) {
  //   try {
  //     const [leaveApplications]= await this.prismaService.organization.findMany({
  //       where:{ }
  //     })
  //   }catch (e) {
  //
  //   }
  // }

  async allEmployeeLeaveStatus(orgID: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const currentDate = new Date();
        const leaveApp = await tx.leaveApplication.findMany({
          where: {
            startDate: { lte: currentDate },
            endDate: { gte: currentDate },
            employee: {
              organizationId: orgID
            }
          },
          select: {
            employee: {
              select: {
                firstname: true,
                lastname: true
              }
            },
            leaveStatus: true,
            duration: true,
            endDate: true
          }
          // include: { employee: { select: { firstname: true, lastname: true } } }
        });
        // return leaveApp.map((applications) => applications.employee);
        return leaveApp;
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findOneLeave(orgID: string, leaveID: string, employee) {
    try {
      return await this.prismaService.employeeLeave.findFirst({
        where: {
          id: leaveID,
          employeeId: employee.id
        }
      });
    } catch (e) {
      this.logger.error("Leave does not exist");
      throw new AppException();
    }
  }
}

