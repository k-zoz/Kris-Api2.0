import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAllowanceDto {
  @IsNotEmpty({ message: "Name of allowance is required!" })
  name: string;
  @IsOptional()
  description: string;
  @IsNotEmpty({ message: "Amount of allowance is required!" })
  amount: any;
  @IsNotEmpty({ message: "Type is required!" })
  type: string;
  @IsNotEmpty({ message: "Frequency is required!" })
  frequency: string;
  @IsNotEmpty({ message: "Taxable is required!" })
  taxable: string;
}

export class EditAllowanceDto {
  @IsOptional()
  name: string;
  @IsOptional()
  description: string;
  @IsOptional()
  amount: any;
  @IsOptional()
  type: string;
  @IsOptional()
  frequency: string;
  @IsOptional()
  taxable: string;
}


export class AllowanceDto {
  @IsNotEmpty({ message: "Name of allowance is required!" })
  name: string;
}


export class CreateDeductionsDto {
  @IsNotEmpty({ message: "Name of allowance is required!" })
  name: string;
  @IsOptional()
  description: string;
  @IsNotEmpty()
  relief: string;
  @IsNotEmpty()
  groupBy: string;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  amount: any;
}

export class DeductionDto {
  @IsNotEmpty({ message: "Name of allowance is required!" })
  name: string;
}


export class EditDeductionDto {
  @IsOptional()
  name: string;
  @IsOptional()
  description: string;
  @IsOptional()
  relief: string;
  @IsOptional()
  groupBy: string;
  @IsOptional()
  type: string;
  @IsOptional()
  amount: any;
}


export class CreateBonusDto {
  @IsNotEmpty()
  name: string;
  @IsOptional()
  description: string;
  @IsNotEmpty()
  frequency: string;
  @IsNotEmpty()
  taxable: string;
  @IsNotEmpty()
  amount: any;
}


export class BonusDto {
  @IsNotEmpty({ message: "Name of allowance is required!" })
  name: string;
}

export class EditBonusDto {
  @IsOptional()
  name: string;
  @IsOptional()
  description: string;
  @IsOptional()
  frequency: string;
  @IsOptional()
  taxable: string;
  @IsOptional()
  amount: any;
}


export class CreatePayGroupDto {
  @IsNotEmpty()
  name: string;
  @IsOptional()
  description: string;
}

export class PayGroupDto {
  @IsNotEmpty()
  name: string;
}

export class CreatePayrollPreviewDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  startDate: any;
  @IsNotEmpty()
  endDate: any;
  @IsOptional()
  date: any;
}


export class EmployeePayrollPreviewDto {
  id:string
  @IsOptional()
  taxes: any;
  @IsOptional()
  bonuses: any;
  @IsOptional()
  deduction: any;
  @IsOptional()
  gross_pay: any;
}
