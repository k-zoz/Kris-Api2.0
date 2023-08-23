import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateBranchDto } from "@core/dto/global/branch.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";


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

  async validateDtoRequest(dto: CreateBranchDto) {
    await this.checkOrgPropertyExists("branch_code", dto.branch_code, "");
    await this.checkOrgPropertyExists("name", dto.name, "");
  }

  async checkOrgPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.org_Branch.findUnique({
        where: { [propertyName]: propertyValue }
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
}
