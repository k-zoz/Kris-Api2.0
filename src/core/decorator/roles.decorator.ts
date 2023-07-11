import { SetMetadata } from "@nestjs/common";

import { UserRoleEnum } from "@core/enum/user-role-enum";

export const ROLE_KEY = 'role';
export const Permission = (...roles: UserRoleEnum[]) => SetMetadata(ROLE_KEY, roles);
