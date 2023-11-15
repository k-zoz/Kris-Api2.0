import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Employee, EmployeeWorkTools, Organization, WorkTools } from "@prisma/client";
import { WorkToolDto } from "@core/dto/global/worktool";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AuthMsg } from "@core/const/security-msg-const";

@Injectable()
export class WorkToolsPrismaHelperService {
  private readonly logger = new Logger(WorkToolsPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }


  async createWorkTool(request: WorkToolDto, organization: Organization, creatorEmail: string) {
    try {
      return await this.prismaService.workTools.create({
        data: {
          name: request.name,
          description: request.description,
          organizationID: organization.id,
          createdBy: creatorEmail
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllWorkTools(organization: Organization) {
    try {
      return await this.prismaService.workTools.findMany({
        where: {
          organizationID: organization.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async getWorkToolByName(name: string) {
    const workTool = await this.prismaService.workTools.findFirst({
      where: {
        name: {
          equals: name
        }
      }
    });
    if (!workTool) {
      this.logger.error("Work tool not found by name");
      throw new AppNotFoundException();
    }
    return workTool;
  }

  async getEmpWorkToolID(id: string) {
    const workTool = await this.prismaService.employeeWorkTools.findUnique({
      where: {
        id
      }
    });
    if (!workTool) {
      this.logger.error(`Work tool not found by ${id}`);
      throw new AppNotFoundException();
    }
    return workTool;
  }

  async addWorkToolToEmployee(organization: Organization, employee: Employee, workTool: WorkTools, request: WorkToolDto) {
    try {
      return await this.prismaService.employeeWorkTools.create({
        data: {
          name: workTool.name,
          description: request.description,
          comments: request.comments,
          tagNumber: request.tagNumber,
          employeeID: employee.id,
          workToolID: workTool.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async allEmployeeOwnedWorktool(employee: Employee, organization?: Organization) {
    try {
      return await this.prismaService.employeeWorkTools.findMany({
        where: {
          employeeID: employee.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }

  }


  async addCommentToWorkTool(employee: Employee, workTool: EmployeeWorkTools, request: WorkToolDto) {
    try {
      return await this.prismaService.employeeWorkTools.update({
        where: {
          id: workTool.id
        },
        data: {
          comments: request.comments
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

}
