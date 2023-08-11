import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as argon from "argon2";
import { CreateSuperUserDto, UpdateBackOfficeProfile} from "@core/dto/auth/user.dto";
import { UtilService } from "@core/utils/util.service";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { SearchRequest } from "@core/model/search-request";
import { CodeValue } from "@core/dto/global/code-value";
import { EnumValues } from "enum-values";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly utilService: UtilService,
              private readonly userHelperService:UserPrismaHelperService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.createSuperUser();
  }

  async createSuperUser() {
    const superUserExists = await this.userHelperService.findSuperUserUser("rootadmin@kris.io")
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
      await this.userHelperService.saveSuperUser(superUserDTO);
      this.logger.log(`SUPER ADMIN CREATED SUCCESSFULLY<>$$$$$$$`);
    }
  }

  async onboardBackOfficeUser(dto: CreateSuperUserDto, creatorEmail?: string) {
    await this.userHelperService.validateRequest(dto);
    dto.createdBy = creatorEmail;
    dto.password =this.utilService.generateRandomPassword()
    return this.userHelperService.saveNewUserndSendEmail(dto);
  }

  //TODO generate random password
  //TODO get the email from the created profile and the generated password and send as mail

  async editProfile(requesterMail: string, dto: UpdateBackOfficeProfile) {
    await this.userHelperService.validateRequest(dto);
    return this.userHelperService.editUser(requesterMail, dto);
    //TODO make change password different
    //TODO remove change email, make it different
    //TODO change response
  }

  async changeUserRole(modifierMail: string, id: string, role: string) {
    const user = await this.userHelperService.findUserById(id);
    const modifier = await this.userHelperService.findByEmail(modifierMail);
    await this.utilService.compareEmails(user.email, modifier.email);
    await this.userHelperService.changeRole(user.email, modifier.email, role);
    return `User ${user.email} role is updated successfully`;
  }

  async changeUserPassword(modifierMail: string, id: string, newPassword: string) {
    const user = await this.userHelperService.findUserById(id);
    const modifier = await this.userHelperService.findByEmail(modifierMail);
    return await this.userHelperService.changePassword(user.email, modifier.email, newPassword);
  }

  async validatePassword(user, password: string): Promise<boolean> {
    return await argon.verify(user.password, password);
  }

  async findAllUsers(request: SearchRequest) {
    return  await this.userHelperService.findAllBackOfficeUsers(request)
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(UserRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }
}
