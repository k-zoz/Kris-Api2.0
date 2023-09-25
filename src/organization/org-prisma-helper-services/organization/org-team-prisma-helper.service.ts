import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { Department, Employee, Org_Branch, Organization, Team } from "@prisma/client";
import { HODConfirmationEvent, TeamLeadConfirmationEvent } from "@core/event/back-office-event";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@alert/email/email.service";

@Injectable()
export class OrgTeamPrismaHelperService {
  private readonly logger = new Logger(OrgTeamPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }


  async addTeamToDepartment(dto, orgID, department, branch, creatorEmail) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.team.create({
          data: {
            name: dto.teamName,
            organizationId: orgID,
            departmentId: department.id,
            org_BranchId: branch.id,
            createdBy: creatorEmail
          }
        });

        return "Successfully added team to department";
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
      throw new AppConflictException(`Team  ${dto.teamName} exists in ${department.name}`);
    }
  }

  async findAllTeams(orgID, branchID, request) {
    const { skip, take } = request;
    try {
      const [teams, total] = await this.prismaService.$transaction([
        this.prismaService.team.findMany({
          where: {
            organizationId: orgID,
            org_BranchId: branchID
          },
          include: {
            Department: {
              select: {
                name: true
              }
            },
            teamLeader: {
              select: {
                email: true
              }
            }
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


  async findTeamByID(orgID, teamID) {
    const team = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
        organizationId: orgID
      }
    });

    if (!team) {
      throw  new AppNotFoundException(`Can't find team with id ${teamID} `);
    }
    return team;
  }

  async findTeamByName(deptId, orgID, teamName) {
    if (!teamName) {
    } else {
      const team = await this.prismaService.team.findFirst({
        where: {
          name: teamName,
          organizationId: orgID,
          departmentId: deptId
        }
      });

      if (!team) {
        throw  new AppNotFoundException(`Can't find team with name ${teamName} `);
      }
      return team;
    }

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

  async findAllTeamLeads(orgID, request) {
    const { skip, take } = request;
    try {
      const [teamLeads, total] = await this.prismaService.$transaction([
        this.prismaService.team.findMany({
          where: {
            teamLeaderId: {
              not: null
            }
          },
          select: {
            teamLeader: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
                designation: true,
                idNumber: true,
                workPhoneNumber: true
              }
            },
            Department: {
              select: {
                name: true
              }
            }
          },

          skip,
          take

        }),
        this.prismaService.team.count({
          where: {
            teamLeaderId: {
              not: null
            }
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, teamLeads };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllTeamsInADepartment(orgID: string, department, searchRequest) {
    const { skip, take } = searchRequest;

    try {
      const [teams, total] = await this.prismaService.$transaction([
        this.prismaService.team.findMany({
          where: {
            organizationId: orgID,
            departmentId: department.id
          },
          skip,
          take

        }),
        this.prismaService.team.count({
          where: {
            organizationId: orgID,
            departmentId: department.id
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

  async allEmployeesInTeam(orgID: string, teamID: string) {
    try {
      return await this.prismaService.employee.findMany({
        where: { teamId: teamID },
        select: {
          firstname: true,
          lastname: true,
          designation: true,
          email: true,
          workPhoneNumber: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async checkIfEmployeeIsInTeam(team: Team, employee: Employee) {
    if (employee.teamId !== team.id) {
      throw new AppNotFoundException("Employee does not belong to team!");
    }
  }

  async checkIfEmployeeBelongsToAnyTeam(employee: Employee) {
    if (!employee.teamId) {
      throw new AppNotFoundException("Employee does not belong to any team!");
    }
  }

  async makeEmployeeTeamLead(team: Team, employee: Employee, organization?: Organization) {
    try {
      await this.prismaService.$transaction(async (tx) => {

        await tx.team.update({
          where: { id: team.id },
          data: {
            teamLeader: {
              connect: {
                id: employee.id
              }
            }

          }
        });

        try {
          const html = await this.emailService.sendTeamLeadConfirmationEmail({
            organizationName: organization.orgName,
            teamName: team.name,
            employeeFirstName: employee.firstname
          } as TeamLeadConfirmationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            subject: "Team Lead Confirmation",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      }, { maxWait: 5000, timeout: 10000 });
      return `${employee.firstname} is now the team lead`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error making employee team lead");
    }
  }

  async confirmIfEmployeeIsTeamLead(team: Team, employee: Employee) {
    if (team.teamLeaderId !== employee.id) {
      throw new AppException("Employee is not the team lead");
    }
  }

  async removeTeamLead(team: Team, employee: Employee) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        this.prismaService.employee.update({
          where: { id: employee.id },
          data: {
            hierarchy_position: null,
            teamEmployeeLeads: {
              disconnect: true
            }
          }
        });
        this.prismaService.team.update({
          where: { id: team.id },
          data: { teamLeaderId: null }
        });
      });
      return `${employee.firstname} is no longer the team leader`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error removing employee as team leader");
    }
  }

  async checkIfTeamLeadBelongsToTeam(employee: Employee, team: Team) {
    if (employee.teamId !== team.id) {
      throw new AppNotFoundException("Employee does not belong to team!");
    }
  }

  async checkIfEmployeeHasATeam(employee: Employee) {
    if (!employee.teamId) {
      throw new AppNotFoundException("Employee does not belong to team!");
    }
  }

  async allTeamRequests(employee: Employee, team: Team) {
    try {
      return await this.prismaService.teamRequestsAndApproval.findMany({
        where: {
          Team: {
            id: team.id
          }
        },
        orderBy:{
          createdDate:'desc'
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting all team requests");
    }
  }
}
