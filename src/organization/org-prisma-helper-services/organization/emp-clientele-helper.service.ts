import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateBranchDto, CreateClienteleDto } from "@core/dto/global/branch.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class EmpClienteleHelperService {
  private readonly logger = new Logger(EmpClienteleHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async validateDtoRequest(dto: CreateClienteleDto) {
    await this.checkOrgPropertyExists("clientele_code", dto.clientele_code, "");
  }

  async checkOrgPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.org_Clientele.findUnique({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async createClientele(dto: CreateClienteleDto, orgID: string, email: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const clientele = await tx.org_Clientele.create({
          data: {
            name: dto.name,
            clientele_code: dto.clientele_code,
            city: dto.city,
            country: dto.country,
            location: dto.location,
            state: dto.state,
            createdBy: email,
            organizationId: orgID
          }
        });
        return { clientele };
      });
      this.logger.log(`Created clientele Successfully`);
      return "Created clientele successfully";
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error creating clientele");
    }
  }

  async findAllClients(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [clientele, total] = await this.prismaService.$transaction([
        this.prismaService.org_Clientele.findMany({
          where: {
            organizationId: orgID
          }, include: {
            employees: true
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
      return { total, totalPage, clientele };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findClient(clienteleID: string, orgID: string) {
    const client = await this.prismaService.org_Clientele.findFirst({
      where: {
        id: clienteleID,
        organizationId: orgID
      }
    });

    if (!client) {
      throw  new AppNotFoundException(`Can't find Client with id ${clienteleID} `);
    }
    return client;


  }

  async findClientByName(clienteleName: string, orgID: string) {
    if (!clienteleName) {
    } else {
      const client = await this.prismaService.org_Clientele.findFirst({
        where: {
          name: clienteleName,
          organizationId: orgID
        }
      });

      if (!client) {
        throw  new AppNotFoundException(`Can't find Client with name ${clienteleName} `);
      }
      return client;
    }


  }
}
