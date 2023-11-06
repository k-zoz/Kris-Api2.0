import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import {
  AppConflictException,
  AppException,
  AppNotFoundException,
  AppUnauthorizedException
} from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";
import { AuthMsg } from "@core/const/security-msg-const";
import { Employee, Org_Branch } from "@prisma/client";


@Injectable()
export class OrgBranchPrismaHelperService {
  private readonly logger = new Logger(OrgBranchPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async createBranch(dto: CreateBranchDto, orgID: string, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const branch = await tx.org_Branch.create({
          data: {
            name: dto.name,
            branch_code: dto.branch_code,
            city: dto.city,
            country: dto.country,
            location: dto.location,
            state: dto.state,
            createdBy: creatorEmail,
            organizationId: orgID
          }
        });
        return { branch };
      });
      this.logger.log(`Created branch Successfully`);
      return "Created branch successfully";
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error creating branch");
    }

  }


  async findBranch(branchID, orgID) {
    const department = await this.prismaService.org_Branch.findFirst({
      where: {
        id: branchID,
        organizationId: orgID
      },
      include: {
        department: {
          include: {
            employees: true,
            teams: true
          }
        }
      }
    });

    if (!department) {
      throw  new AppNotFoundException(`Can't find Branch with id ${branchID} `);
    }
    return department;
  }


  async findBranchByName(branchName, orgID) {
    if (!branchName) {
    } else {
      const branch = await this.prismaService.org_Branch.findFirst({
        where: {
          name: branchName,
          organizationId: orgID
        }
      });

      if (!branch) {
        throw  new AppNotFoundException(`Can't find Branch with name ${branchName} `);
      }
      return branch;
    }

  }

  async findBranchByCode(branchCode, orgID) {
    const department = await this.prismaService.org_Branch.findFirst({
      where: {
        branch_code: branchCode,
        organizationId: orgID
      }
    });

    if (!department) {
      throw  new AppNotFoundException(`Can't find Branch with code ${branchCode} `);
    }
    return department;
  }

  async findBranchBranchCode(branchName, orgID) {
    const branch = await this.prismaService.org_Branch.findFirst({
      where: {
        branch_code: branchName,
        organizationId: orgID
      }
    });
    if (!branch) {
      throw new AppNotFoundException(`Can't find Branch with code ${branchName} `);
    }
  }

  async validateDtoRequest(dto: CreateBranchDto, orgID) {
    await this.checkOrgPropertyExists("branch_code", dto.branch_code, "", orgID);
    await this.checkOrgPropertyExists("name", dto.name, "", orgID);
  }

  async checkOrgPropertyExists(propertyName, propertyValue, propertyDescription, orgID?: string) {
    if (propertyValue) {
      const result = await this.prismaService.org_Branch.findFirst({
        where: {
          [propertyName]: propertyValue,
          organizationId: orgID
        }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }


  async findAllBranches(orgId, request) {
    const { skip, take } = request;
    try {
      const [branches, total] = await this.prismaService.$transaction([
        this.prismaService.org_Branch.findMany({
          where: {
            organizationId: orgId
          }, include: {
            department: true,
            employees: true,
            branchManager: true
          },
          skip,
          take

        }),
        this.prismaService.org_Branch.count({
          where: {
            organizationId: orgId
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, branches };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllBranchCodes(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [branches, total] = await this.prismaService.$transaction([
        this.prismaService.org_Branch.findMany({
          where: {
            organizationId: orgID
          }, select: {
            branch_code: true
          },
          skip,
          take

        }),
        this.prismaService.org_Branch.count({
          where: {
            organizationId: orgID
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, branches };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllEmployees(branchID: string) {
    try {
      return await this.prismaService.employee.findMany({
        where: { org_BranchId: branchID },
        select: {
          firstname: true,
          lastname: true,
          email: true,
          idNumber: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async isEmployeeABranchMember(employee: Employee, branchID: string, orgID: string) {
    if (employee.org_BranchId !== branchID) {
      throw new AppNotFoundException("Employee does not belong to branch!");
    }
  }

  async makeEmployeeBranchManager(employee: Employee, branch: Org_Branch, orgID: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {

        this.prismaService.org_Branch.update({
          where: { id: branch.id },
          data: {
            branchManagerId: employee.id
          }
        });
      });

      return `${employee.firstname} is now the branch manager`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error making employee branch manager");
    }
  }

  async confirmIfEmployeeIsBranchManager(employee: Employee, branch: Org_Branch) {
    if (branch.branchManagerId !== employee.id) {
      throw new AppUnauthorizedException("Not the branch manager!");
    }
  }

  async removeEmployeeAsBranchManager(employee: Employee, branch: Org_Branch) {

    try {
      await this.prismaService.$transaction(async (tx) => {
        // Update the employee to remove their managed branch
        await this.prismaService.employee.update({
          where: { id: employee.id },
          data: {
            hierarchy_position: null,
            managedBranch: {
              disconnect: true
            }
          }
        });

        // Update the branch to remove its branch manager
        await this.prismaService.org_Branch.update({
          where: { id: branch.id },
          data: {
            branchManagerId: null
          }
        });
      });

      return `${employee.firstname} is no longer the branch manager`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error removing employee as branch manager");
    }
  }

  async allBranchManagers(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [branchManagers, total] = await this.prismaService.$transaction([
        this.prismaService.org_Branch.findMany({
          where: {
            branchManagerId: {
              not: null
            }
          },
          select: {
            branchManager: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
                designation: true,
                idNumber: true,
                workPhoneNumber: true
              }
            }
          },

          skip,
          take

        }),
        this.prismaService.org_Branch.count({
          where: {
            branchManagerId: {
              not: null
            }
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, branchManagers };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async checkIfEmployeeBelongsToAnyBranch(employee: Employee) {
    if (!employee.org_BranchId) {
      throw new AppNotFoundException("Employee does not belong to any branch!");
    }
  }

  async allBranchRequests(branch: Org_Branch) {
    try {
      return await this.prismaService.branchRequestsAndApproval.findMany({
        where: {
          branch: {
            id: branch.id
          }
        },
        include: {
          leaveApprovalRequest: true
        },
        orderBy: {
          createdDate: "desc"
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting all branch requests");
    }
  }
}
