import { Injectable, Logger } from "@nestjs/common";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class OrgDeptPrismaHelperService {
  private readonly logger = new Logger(OrgDeptPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
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

  async hardRemoveDeptFromOrg(orgID, deptID) {
    try {
      await this.prismaService.department.delete({
        where: {
          id: deptID
        }
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async softRemoveDeptFromOrg(orgID, deptID) {
    try {
      await this.prismaService.department.update({
        where: {
          id: deptID
        },
        data: {
          organizationId: orgID
        }
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllDepts(orgID, request) {
    const { skip, take } = request;
    try {
      const [departments, total] = await this.prismaService.$transaction([
        this.prismaService.department.findMany({
          where: {
            organizationId: orgID
          }, include: {
            teams: true
          },
          skip,
          take

        }),
        this.prismaService.department.count({
          where: {
            organizationId: orgID
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, departments };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

}
