import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { CreateLeaveDto } from "@core/dto/global/leave.dto";

@Injectable()
export class LeaveHelperService {
  private readonly logger = new Logger(LeaveHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async createLeavePlanAndEmployeeLeave(dto: CreateLeaveDto, orgID: string, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const leave = await tx.leave.create({
          data: {
            name: dto.leaveName,
            duration: dto.leaveDuration,
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
          remainingDuration: dto.leaveDuration
        }));

        await tx.employeeLeave.createMany({
          data: employeeLeaveData
        });
      });
      return AuthMsg.LEAVE_CREATED;
    } catch (e) {
      this.logger.error(e);
      // throw new AppException(AuthMsg.ERROR_CREATING_LEAVE);
      throw new AppException(e);
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
              name: { contains: dto.leaveName },
              organizationId: orgID
            }
          }
        );

        const employeeLeave = await tx.employeeLeave.findFirst({
          where: {
            employeeId: employee.id,
            leaveId: leave.id
          }
        });

        if (dto.leaveDuration > employeeLeave.remainingDuration) {
          throw  new AppException(AuthMsg.EMPLOYEE_HAS_LESS_LEAVE_DAYS);
        }

        if (employeeLeave.remainingDuration <= 0) {
          throw  new AppException(AuthMsg.EMPLOYEE_HAS_LESS_LEAVE_DAYS);
        }

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
      });
      return "Applied Successfullly"
    } catch (e) {
      this.logger.error(e);
      throw new AppException(AuthMsg.ERROR_APPLYING_LEAVE);
    }
  }

  async getMyLeaveHistory(orgID, employee) {
    try {
      return await this.prismaService.employeeLeave.findMany({
        where: {
          employeeId: employee.id
        }, include: {
          leave: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async findLeaveByName(leaveName, orgID) {
    const leave = await this.prismaService.leave.findFirst({
      where: {
        name: { contains: leaveName },
        organizationId: orgID
      }
    });
    if (!leave) {
      throw  new AppNotFoundException("Leave Plan does not exist");
    }
    return leave;
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
}

