import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'IsEndDateValid', async: false })
export class IsEndDateValidConstraint implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments) {
    const [startDatePropertyName] = args.constraints;
    const startDate = (args.object as any)[startDatePropertyName];
    if (!startDate || !endDate) {
      return true;
    }
    return endDate >= startDate;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be greater than or equal to start date';
  }
}

export function IsEndDateValid(startDatePropertyName: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [startDatePropertyName],
      validator: IsEndDateValidConstraint,
    });
  };
}
