import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { SetMetadata } from "@nestjs/common";

export const EMP_ROLE_KEY = "emp_role";
export const EmpPermission = (...empRoles: EmployeeRoleEnum[]) => SetMetadata(EMP_ROLE_KEY, empRoles);
