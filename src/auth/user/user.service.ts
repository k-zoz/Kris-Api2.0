import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import * as argon from "argon2";
import { CreateSuperUserDto, UpdateBackOfficeProfile} from "@core/dto/auth/user.dto";
import {  AppException, AppNotFoundException } from "@core/exception/app-exception";
import { prismaExclude } from "@prisma/prisma-utils";
import { UtilService } from "@core/utils/util.service";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { SearchRequest } from "@core/model/search-request";
import { CodeValue } from "@core/dto/global/code-value";
import { EnumValues } from "enum-values";
import { UserHelperService } from "@auth/helper-services/user-helper.service";

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly utilService: UtilService,
              private readonly userHelperService:UserHelperService
  ) {
  }

  async onModuleInit(): Promise<void> {
    await this.createSuperUser();
  }

  async createSuperUser() {
    const superUserExists = await this.prismaService.user.findUnique({ where: { email: "rootadmin@kris.io" } });
    if (!superUserExists) {
      const superUserDTO = {
        email: "rootadmin@kris.io",
        firstname: "Root",
        surname: "Admin",
        phoneNumber: "01001111111",
        password: "root.admin@2023",
        role: "SUPER_ADMIN",
        createdBy: "rootadmin@kris.io",
        authPayload: { email: "rootadmin@kris.io", role: "SUPER_ADMIN" }
      } as CreateSuperUserDto;
      await this.userHelperService.saveUser(superUserDTO);
      this.logger.log(`SUPER ADMIN CREATED SUCCESSFULLY<>$$$$$$$`);
    }
  }

  async create(dto: CreateSuperUserDto, creatorEmail?: string) {
    await this.userHelperService.validateRequest(dto);
    dto.createdBy = creatorEmail;
    return this.userHelperService.saveNewUser(dto);
  }

  async editProfile(requesterMail: string, dto: UpdateBackOfficeProfile) {
    await this.userHelperService.validateRequest(dto);
    return this.userHelperService.editUser(requesterMail, dto);
  }


  async findUserById(id: string) {
    const found = await this.prismaService.user.findFirst({ where: { id } });
    if (!found) {
      const msg = `User with id ${id} not found`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return this.findAndExcludeFields(found);
  }


  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.user.update({
      where: { email },
      data: {
        refreshToken
      }
    });
  }

  async changeUserRole(modifierMail: string, id: string, role: string) {
    const user = await this.findUserById(id);
    const modifier = await this.findByEmail(modifierMail);
    await this.utilService.compareEmails(user.email, modifier.email);
    await this.userHelperService.changeRole(user.email, modifier.email, role);
    return `User ${user.email} role is updated successfully`;
  }


  async changeUserPassword(modifierMail: string, id: string, newPassword: string) {
    const user = await this.findUserById(id);
    const modifier = await this.findByEmail(modifierMail);
    return await this.userHelperService.changePassword(user.email, modifier.email, newPassword);
  }


  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      const errMessage = `Email ${email} not found`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }

  async findFirst(email: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) {
      const errMessage = `Invalid email or password`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }

  async findAndExcludeFields(user) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("User", ["password", "refreshToken"])
    });
  }

  async validatePassword(user, password: string): Promise<boolean> {
    return await argon.verify(user.password, password);
  }

  async findAllUsers(request: SearchRequest) {
    const { skip, take } = request;

    try {
      const [users, total] = await this.prismaService.$transaction([
          this.prismaService.user.findMany({
            select: {
              id: true,
              surname: true,
              firstname: true,
              phoneNumber: true,
              email: true,
              role: true
            },
            skip,
            take
          }),
          this.prismaService.user.count()
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, users };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(UserRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }
}
