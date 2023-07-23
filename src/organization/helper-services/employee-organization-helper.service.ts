import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";

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
}
