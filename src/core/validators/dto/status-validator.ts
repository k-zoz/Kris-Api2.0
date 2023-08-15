import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

export interface EmploymentStatus {
  ACTIVE: string;
  LEAVE: string;
  TERMINATED: string;
  DECEASED: string;
  RESIGNED: string;
  PROBATION: string;
  NOTICE_PERIOD: string;
}

@ValidatorConstraint({ name: 'isValidEmploymentStatus', async: false })
export class IsValidEmploymentStatusConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const employmentStatuses: EmploymentStatus = {
      ACTIVE: 'ACTIVE',
      LEAVE: 'LEAVE',
      TERMINATED: 'TERMINATED',
      DECEASED: 'DECEASED',
      RESIGNED: 'RESIGNED',
      PROBATION: 'PROBATION',
      NOTICE_PERIOD: 'NOTICE_PERIOD',
    };

    return Object.values(employmentStatuses).includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid Employment Status`;
  }
}

export function IsValidEmploymentStatus(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEmploymentStatusConstraint,
    });
  };
}
