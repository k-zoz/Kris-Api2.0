import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AuthMsg } from "@core/const/security-msg-const";

@Injectable()
export class EmployeeOrganizationHelperService {
  private readonly logger = new Logger(EmployeeOrganizationHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async addDepartmentToOrg(dto, orgID) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        await tx.organization.findUnique({
          where: {
            id: orgID
          }
        });

        const department = await tx.department.create({
          data: {
            name: dto.deptName,
            organizationId: orgID
          }
        });

        return { department };
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
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

  async addTeamToOrg(dto, orgID, department) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        await tx.organization.findUnique({
          where: {
            id: orgID
          }
        });
        const team = await tx.team.create({
          data: {
            name: dto.teamName,
            organizationId: orgID,
            departmentId: department.id
          }
        });
        return { team };
      });
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
      return "Action Successful"
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async makeEmpTeamLead(empID, teamID) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const teamLead = await tx.teamLead.create({
          data: {
            teamId: teamID,
            employeeId: empID
          }
        });


        await tx.team.update({
          where: {
            id: teamID
          },
          data: {
            teamLeadId: teamLead.id,
          }
        });
      });
      return "Action Successful"
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async isEmployeeTeamLead(empID, teamID) {
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


  async findDeptDuplicates(dto, orgID) {
    const existingDept = await this.prismaService.department.findFirst({
      where: {
        name: { contains: dto.deptName },
        organizationId: orgID
      }
    });
    if (existingDept) {
      throw new AppConflictException(`Department  ${dto.deptName} exists`);
    }
  }

  async findTeamDuplicates(dto, orgID) {
    const existingTeam = await this.prismaService.team.findFirst({
      where: {
        name: { contains: dto.teamName },
        organizationId: orgID
      }
    });
    if (existingTeam) {
      throw new AppConflictException(`Department  ${dto.teamName} exists`);
    }
  }

  async findDept(deptId, orgID) {
    const department = await this.prismaService.department.findFirst({
      where: {
        id: deptId,
        organizationId: orgID
      }
    });

    if (!department) {
      throw  new AppNotFoundException(`Can't find department with id ${deptId} `);
    }
    return department;
  }

  async findTeam(deptId, orgID, teamID) {
    const team = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
        organizationId: orgID,
        departmentId: deptId
      }
    });

    if (!team) {
      throw  new AppNotFoundException(`Can't find team with id ${teamID} `);
    }
    return team;
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

  async findTeamDept(teamID, deptID) {
    const teamDept = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
        departmentId: deptID
      }
    });

    if (!teamDept) {
      throw  new AppNotFoundException(`Team with id ${teamID} does not belong to department `);
    }
    return teamDept;
  }
}
