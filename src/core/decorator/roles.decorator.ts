import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";
import { UserRoleEnum } from "@core/enum/user-role-enum";

export const ROLE_KEY = 'role';
export const Permission = (...roles: UserRoleEnum[]) => SetMetadata(ROLE_KEY, roles);
