import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import * as argon from "argon2";
import { CreateSuperUserDto, UserDto } from "@core/dto/auth/user-dto";
import { AppConflictException, AppNotFoundException } from "@core/exception/app-exception";
import { prismaExclude } from "@prisma/prisma-utils";
import { UtilService } from "@core/utils/util.service";
import { AppConst } from "@core/const/app.const";

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
        role: 'SUPER_ADMIN',
        authPayload: { email: "rootadmin@kris.io" }
      } as CreateSuperUserDto;

      await this.saveSuperUser(superUserDTO);
      this.logger.log(`SUPER ADMIN CREATED SUCCESSFULLY<>$$$$$$$`);
    }

  }


  async saveSuperUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          password: await argon.hash(user.password),
          role: user.role
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

  async create(dto: CreateSuperUserDto) {
    await this.validatePhoneNumberRequest(dto);
    await this.validaEmailRequest(dto);
    // dto.phoneNumber = this.utilService.getPhoneNumber(dto.phoneNumber);
    return this.saveUser(dto);
  }



  async saveUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          password: await argon.hash(user.password)
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


  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      const errMessage = `Email ${email} not found`;
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

  async updateUser(email: string, refreshToken) {
    await this.prismaService.user.update({
      where: { email },
      data: {
        refreshToken,
        createdBy: email
      }
    });
  }

  async updateNewUser(email: string,  creatorMail) {
    await this.prismaService.user.update({
      where: { email },
      data: {
        createdBy: creatorMail
      }
    });
  }


}
