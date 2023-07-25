import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";

@Injectable()
export class OrgEmpPrismaHelperService {
  private readonly logger = new  Logger(OrgEmpPrismaHelperService.name)

  constructor(private readonly prismaService:PrismaService) {
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

  async isEmployeeTeamLeadVerification(empID, teamID) {
    const teamLead = await this.prismaService.teamLead.findFirst({
      where: {
        employeeId: empID,
        teamId: teamID
      }
    });
    if (!teamLead) {
      throw  new AppNotFoundException(`Can't find team lead ${empID} for team  ${teamID} `);
    }
    return teamLead;
  }


  async removeEmpTeamLead(empID, teamID, orgID) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.teamLead.deleteMany({
          where: {
            employeeId: empID,
            teamId: teamID
          }
        });

        await tx.team.update({
          where: {
            id: teamID
          },
          data: {
            teamLeadId: null
          }
        });
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }
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

  async isEmployeeTeamLeadValidation(empID, teamID) {
    const teamLead = await this.prismaService.teamLead.findFirst({
      where: {
        employeeId: empID,
        teamId: teamID
      }
    });

    if (teamLead) {
      throw new Error("Employee is already a team lead for this team");
    }
  }

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

  async makeEmpTeamLead(empID, teamID, orgID) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const teamLead = await tx.teamLead.create({
          data: {
            teamId: teamID,
            employeeId: empID,
            organizationId: orgID
          }
        });


        await tx.team.update({
          where: {
            id: teamID
          },
          data: {
            teamLeadId: teamLead.id
          }
        });
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }
}
