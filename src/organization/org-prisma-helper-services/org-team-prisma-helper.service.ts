import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";

@Injectable()
export class OrgTeamPrismaHelperService {
  private readonly logger = new Logger(OrgTeamPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async addTeamToDepss(dto, orgID, department) {
    try {
      return await this.prismaService.$transaction(async (tx) => {

        const team = await tx.team.create({
          data: {
            name: dto.teamName,
            organizationId: orgID,
            departmentId: department.id
          }
        });
        return "Successfully added team to department"
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating team");
    }
  }

  async findTeamDuplicates(dto, department) {
    const existingTeam = await this.prismaService.team.findFirst({
      where: {
        name: { equals: dto.teamName },
        departmentId: department.id
      }
    });
    if (existingTeam) {
      throw new AppConflictException(`Department  ${dto.teamName} exists`);
    }
  }

  async findAllTeams(orgID, request) {
    const { skip, take } = request;
    try {
      const [teams, total] = await this.prismaService.$transaction([
        this.prismaService.team.findMany({
          where: {
            organizationId: orgID,
          },

          skip,
          take

        }),
        this.prismaService.team.count({
          where: {
            organizationId: orgID
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, teams };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
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

  // async findAllTeamLeads(orgID, request) {
  //   const { skip, take } = request;
  //
  //   try {
  //     const [teamLeads, total] = await this.prismaService.$transaction([
  //       this.prismaService.teamLead.findMany({
  //         where: {
  //           organizationId: orgID
  //         },
  //         skip,
  //         take
  //
  //       }),
  //       this.prismaService.teamLead.count({
  //         where: {
  //           organizationId: orgID
  //         }
  //       })
  //     ]);
  //     const totalPage = Math.ceil(total / take) || 1;
  //     return { total, totalPage, teamLeads };
  //   } catch (e) {
  //     this.logger.error(e);
  //     throw new AppException();
  //   }
  // }

}
