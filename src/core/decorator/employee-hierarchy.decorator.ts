import { SetMetadata } from "@nestjs/common";
import { EmployeeHierarchyEnum } from "@core/enum/employee-role-enum";


export const EMP_HIERARCHY = "EMP_HIERARCHY";
export const EmployeeHierarchyPermission = (...empHierarchy: EmployeeHierarchyEnum[]) => SetMetadata(EMP_HIERARCHY, empHierarchy);
