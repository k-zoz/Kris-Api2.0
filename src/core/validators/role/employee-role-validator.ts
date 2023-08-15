import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

export interface EmployeeRole {
  MANAGEMENT: string;
  HUMAN_RESOURCE: string;
  FINANCE: string;
  REGULAR: string;
}

@ValidatorConstraint({ name: "isValidEmployeeRole", async: false })
export class IsValidEmployeeRoleConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const employeeRole: EmployeeRole = {
      MANAGEMENT: "MANAGEMENT",
      HUMAN_RESOURCE: "HUMAN_RESOURCE",
      FINANCE: "FINANCE",
      REGULAR: "REGULAR"
    };

    return Object.values(employeeRole).includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid Employee Role`;
  }
}

export function IsValidEmployeeRole(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEmployeeRoleConstraint
    });
  };
}
