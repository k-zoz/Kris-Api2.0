import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import * as argon from "argon2";
import {
  CreateSuperUserDto,
  UpdateBackOfficeProfile,
  UpdateBackOfficeUserRole,
  UserDto
} from "@core/dto/auth/user-dto";
import { AppConflictException, AppNotFoundException } from "@core/exception/app-exception";
import { prismaExclude } from "@prisma/prisma-utils";
import { UtilService } from "@core/utils/util.service";
import { AppConst } from "@core/const/app.const";
import { UserRoleEnum } from "@core/enum/user-role-enum";

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly utilService: UtilService
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
        authPayload: { email: "rootadmin@kris.io" }
      } as CreateSuperUserDto;

      await this.saveUser(superUserDTO);
      this.logger.log(`SUPER ADMIN CREATED SUCCESSFULLY<>$$$$$$$`);
    }

  }

  async create(dto: CreateSuperUserDto, creatorEmail?: string) {
    await this.validatePhoneNumberRequest(dto);
    await this.validaEmailRequest(dto);
    dto.createdBy = creatorEmail;
    return this.saveNewUser(dto);
  }

  async updateProfile(requesterMail: string, dto: UpdateBackOfficeProfile) {
    await this.validateChangeProfileRequest(dto);
    const user = await this.editUser(requesterMail, dto);
    return await this.findByEmailAndExcludeFields(user.email);

  }

  async validateChangeProfileRequest(dto) {
    if (dto.email) {
      const result = await this.prismaService.user.findUnique({
        where: { email: dto.email }
      });
      if (result) {
        const errMessage = `Email: ${result.email} already exists `;
        this.logger.error(errMessage);
        throw new AppConflictException(errMessage);
      }
    }

    if (dto.phoneNumber) {
      const result = await this.prismaService.user.findUnique({
        where: { phoneNumber: dto.phoneNumber }
      });
      if (result) {
        const errMessage = `Phone number: ${result.phoneNumber} already exists `;
        this.logger.error(errMessage);
        throw new AppConflictException(errMessage);
      }
    }

  }


  async saveUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          role: user.role,
          password: await argon.hash(user.password),
          createdBy: user.createdBy
        }
      });
      this.logger.log(`User ${user.email} saved successfully`);
      return saved;
    } catch (e) {
      const msg = `Error creating user ${user.email}`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  async validaEmailRequest(user) {
    const { email } = user;
    const result = await this.prismaService.user.findUnique({
      where: { email }
    });
    if (result) {
      const errMessage = `Email: ${result.email} already exists `;
      this.logger.error(errMessage);
      throw new AppConflictException(errMessage);
    }
  }

  async validatePhoneNumberRequest(user) {
    const { phoneNumber } = user;
    const result = await this.prismaService.user.findUnique({
      where: { phoneNumber }
    });
    if (result) {
      const errMessage = `Phone Number: ${result.phoneNumber} already exists `;
      this.logger.error(errMessage);
      throw new AppConflictException(errMessage);
    }
  }

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.user.update({
      where: { email },
      data: {
        refreshToken
      }
    });
  }

  async changeUserRole(modifierMail: string, userMail: string, role: string) {
    const user = await this.findByEmail(userMail);
    const modifier = await this.findByEmail(modifierMail);
    this.utilService.compareEmails(user.email, modifier.email);
    await this.changeRole(user.email, modifier.email, role);
    return `User ${user.email} role is updated successfully`;
  }


  async changeUserPassword(modifierMail: string, userMail: string, newPassword: string) {
    const user = await this.findByEmail(userMail);
    const modifier = await this.findByEmail(modifierMail);
    return await this.changePassword(user.email, modifier.email, newPassword);

  }


  async editUser(email, profile: UpdateBackOfficeProfile) {
    const { authPayload, ...restProfile } = profile;
    try {
      return await this.prismaService.user.update({
        where: { email },
        data: {
          email: profile.email,
          firstname: profile.firstname,
          surname: profile.surname,
          phoneNumber: profile.phoneNumber,
          password: await argon.hash(profile.password)
        }
      });

    } catch (e) {
      const msg = `Error updating profile`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }


  }

  async changeRole(email: string, modifiedBy: string, role) {
    try {
      const saved = await this.prismaService.user.update({
        where: { email },
        data: {
          role,
          modifiedBy,
          version: { increment: 1 }
        }
      });
      this.logger.log(`User ${saved.email} role changed successfully`);
      return `User ${saved.email} role changed successfully`;
    } catch (e) {
      const msg = `Error changing  ${email} password`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }

  }


  async changePassword(email: string, modifiedBy: string, newPassword: string) {
    try {
      const saved = await this.prismaService.user.update({
        where: { email },
        data: {
          password: await argon.hash(newPassword),
          modifiedBy,
          version: { increment: 1 }
        }
      });
      this.logger.log(`User ${saved.email} password changed successfully`);
      return `User ${saved.email} password changed successfully`;
    } catch (e) {
      const msg = `Error changing  ${email} password`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }

  }


  async saveNewUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          role: user.role,
          password: await argon.hash(user.password),
          createdBy: user.createdBy
        }
      });
      this.logger.log(`User ${user.email} saved successfully`);
      return `User ${user.email} saved successfully`;
    } catch (e) {
      const msg = `Error creating user ${user.email}`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
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

  async findByEmailAndExcludeFields(email: string) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { email },
      select: prismaExclude("User", ["password", "refreshToken"])
    });
    if (!user) {
      const errMessage = `Email ${email} not found`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }

  async validatePassword(user, password: string): Promise<boolean> {
    return await argon.verify(user.password, password);
  }

}
