import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

export interface BackOfficeRole {
  SUPER_ADMIN: string;
  SUPPORT: string;
  STAFF: string;
}

@ValidatorConstraint({ name: 'isValidBackOfficeRole', async: false })
export class IsValidBackOfficeRoleConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const backOfficeRoles: BackOfficeRole = {
      SUPER_ADMIN: 'SUPER_ADMIN',
      SUPPORT: 'SUPPORT',
      STAFF: 'STAFF',
    };

    return Object.values(backOfficeRoles).includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid Back Office Role`;
  }
}

export function IsValidBackOfficeRole(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBackOfficeRoleConstraint,
    });
  };
}
