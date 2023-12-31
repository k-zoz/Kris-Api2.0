import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { CreateLeaveDto, UpdateLeaveDto } from "@core/dto/global/leave.dto";
import { LeaveApplicationEvent, PasswordChangeEvent } from "@core/event/back-office-event";
import { EmailService } from "@alert/email/email.service";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { Employee, Leave, LeaveApplication, Organization, TeamRequestsAndApproval } from "@prisma/client";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class LeavePrismaHelperService {
  private readonly logger = new Logger(LeavePrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService,
              private readonly utilService: UtilService
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async updateLeavePlan(dto: UpdateLeaveDto, organization: Organization, leavePlan: Leave, modifierEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.leave.update({
          where: {
            id: leavePlan.id
          },
          data: {
            name: dto.leaveName,
            duration: dto.leaveDuration,
            type: dto.leaveType,
            leaveDocUrl: dto.leaveDocUrl,
            createdBy: modifierEmail
          }
        });

        await tx.employeeLeave.updateMany({
          where: {
            leaveId: leavePlan.id
          },
          data: {
            leaveName: dto.leaveName,
            leaveDocUrl: dto.leaveDocUrl,
            remainingDuration: dto.leaveDuration,
            createdBy: modifierEmail
          }
        });
      }, { maxWait: 5000, timeout: 10000 });

    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error updating leave");
    }
  }

  async createLeavePlanAndEmployeeLeave(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const leave = await tx.leave.create({
          data: {
            name: dto.leaveName,
            duration: dto.leaveDuration,
            type: dto.leaveType,
            leaveDocUrl: dto.leaveDocUrl,
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
          leaveName: dto.leaveName,
          leaveDocUrl: dto.leaveDocUrl
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

  async applyLeave(dto, orgID, employee: Employee, leave: Leave) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const leaveApplication = await tx.leaveApplication.create({
          data: {
            leaveName: dto.leaveName,
            duration: dto.leaveDuration,
            startDate: dto.leaveStartDate,
            endDate: dto.leaveEndDate,
            employeeId: employee.id,
            leaveStatus: "PENDING",
            reliefOfficer: dto.reliefOfficer,
            supervisorEmail: dto.supervisorEmail,
            leaveDocs: dto.leaveDocs,
            leaveId: leave.id,
            createdBy: employee.email
          }
        });


        await tx.employeeLeave.update({
          where: {
            employeeId_leaveId: {
              employeeId: employee.id,
              leaveId: leave.id
            }
          },
          data: {
            remainingDuration: {
              decrement: 0
            }
          }
        });

        try {
          let ccEmail = [];
          if (dto.reliefOfficer) {
            ccEmail.push(dto.reliefOfficer);
          }

          if (dto.supervisorEmail) {
            ccEmail.push(dto.supervisorEmail);
          }
          const html = await this.emailService.sendLeaveApplicationEmail({
            employeeName: employee.firstname,
            leaveEndDate: dto.leaveEndDate,
            leaveStartDate: dto.leaveStartDate
          } as LeaveApplicationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            cc: ccEmail,
            subject: "Leave Status",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
          return leaveApplication;
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      }, { maxWait: 5000, timeout: 10000 });
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

  async getMyLeaveHistory(organization: Organization, employee: Employee) {
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
        name: leaveName,
        organizationId: orgID
      }
    });

    if (!leave) {
      throw  new AppNotFoundException("Leave Plan does not exist");
    }
    return leave;
  }

  async findOrgLeaveByID(leaveID, organization: Organization) {
    const leavePlan = await this.prismaService.leave.findFirst({
      where: {
        id: leaveID,
        organizationId: organization.id
      }
    });

    if (!leavePlan) {
      throw  new AppNotFoundException("Leave Plan does not exist");
    }
    return leavePlan;
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


  async allEmployeeLeaveStatus(orgID: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const currentDate = new Date();
        const leaveApp = await tx.leaveApplication.findMany({
          where: {
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
        });
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

  async approveLeaveAndSendApprovalMail(leaveApplication: LeaveApplication, employee: Employee, request: TeamRequestsAndApproval, approveMail: string) {
    try {
      const leaveEndDate = this.utilService.convertDateAgain(leaveApplication.endDate);
      const leaveStartDate = this.utilService.convertDateAgain(leaveApplication.startDate);
      const leaveDuration = this.utilService.countWeekdays(leaveStartDate, leaveEndDate);
      await this.prismaService.$transaction(async (tx) => {
        await tx.leaveApplication.update({
          where: { id: leaveApplication.id },
          data: {
            leaveStatus: "APPROVED",
            modifiedBy: approveMail,
            duration: leaveDuration
          }

        });

        await tx.teamRequestsAndApproval.update({
          where: { id: request.id },
          data: { decision: "APPROVED", modifiedBy: approveMail }
        });

        await tx.employeeLeave.update({
          where: {
            employeeId_leaveId: {
              employeeId: employee.id,
              leaveId: leaveApplication.leaveId
            }
          },
          data: {
            remainingDuration: {
              decrement: leaveDuration
            }
          }
        });

        try {
          let ccEmail = [];
          if (leaveApplication.reliefOfficer) {
            ccEmail.push(leaveApplication.reliefOfficer);
          }
          if (leaveApplication.supervisorEmail) {
            ccEmail.push(leaveApplication.supervisorEmail);
          }
          const html = await this.emailService.sendLeaveApprovalEmail({
            employeeName: employee.firstname,
            leaveEndDate: leaveApplication.endDate,
            leaveStartDate: leaveApplication.startDate
          } as LeaveApplicationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            cc: ccEmail,
            subject: "Leave Status",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      }, { maxWait: 5000, timeout: 10000 });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error approving leave");
    }
  }

  async declineLeaveAndSendDeclineMail(leaveApplication: LeaveApplication, employee: Employee, request: TeamRequestsAndApproval, approveMail) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.teamRequestsAndApproval.update({
          where: { id: request.id },
          data: { decision: "DECLINED", modifiedBy: approveMail }
        });

        await tx.leaveApplication.update({
          where: { id: leaveApplication.id },
          data: { leaveStatus: "DECLINED", modifiedBy: approveMail }
        });

        try {
          let ccEmail = [];
          if (leaveApplication.reliefOfficer) {
            ccEmail.push(leaveApplication.reliefOfficer);
          }
          if (leaveApplication.supervisorEmail) {
            ccEmail.push(leaveApplication.supervisorEmail);
          }
          const html = await this.emailService.sendLeaveApprovalEmail({
            employeeName: employee.firstname,
            leaveEndDate: leaveApplication.endDate,
            leaveStartDate: leaveApplication.startDate
          } as LeaveApplicationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            cc: ccEmail,
            subject: "Leave Status",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      }, { maxWait: 5000, timeout: 10000 });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error declining leave");
    }
  }

  async findTeamRequest(teamRequestID: string) {
    const teamReq = await this.prismaService.teamRequestsAndApproval.findFirst({
      where: {
        id: teamRequestID
      },
      include: {
        leaveApprovalRequest: true
      }
    });

    if (!teamReq) {
      throw  new AppNotFoundException("Request does not exist");
    }
    return teamReq;
  }

  async findLeaveApplication(leaveAppID) {
    const leaveApplication = await this.prismaService.leaveApplication.findFirst({
      where: {
        id: leaveAppID
      }
    });

    if (!leaveApplication) {
      throw  new AppNotFoundException("Leave application does not exist");
    }
    return leaveApplication;
  }

  async updateRequests(employee: Employee, leaveApplication: LeaveApplication) {
    try {
      await this.prismaService.teamRequestsAndApproval.create({
        data: {
          Team: {
            connect: {
              id: employee.teamId
            }
          },
          leaveApprovalRequest: {
            connect: {
              id: leaveApplication.id
            }
          },
          name: "Leave Application",
          viewedRequest: false,
          createdBy: employee.email
        }
      });

      await this.prismaService.branchRequestsAndApproval.create({
        data: {
          branch: {
            connect: {
              id: employee.org_BranchId
            }
          },
          leaveApprovalRequest: {
            connect: {
              id: leaveApplication.id
            }
          },
          name: "Leave Application",
          createdBy: employee.email
        }
      });

      await this.prismaService.deptRequestsAndApproval.create({
        data: {
          department: {
            connect: {
              id: employee.departmentId
            }
          },
          leaveApprovalRequest: {
            connect: {
              id: leaveApplication.id
            }
          },
          name: "Leave Application",
          createdBy: employee.email
        }
      });
      return "Operation successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error applying for leave");
    }

  }


}

