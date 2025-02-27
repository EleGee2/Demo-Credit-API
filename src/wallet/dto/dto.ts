import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidationOptions,
} from 'class-validator';

export function IsRequired(options: ValidationOptions = {}) {
  options.message = options.message || '$property is required.';
  return IsNotEmpty(options);
}

export class FundWalletDto {
  @IsNumber()
  @Min(1)
  @IsRequired()
  amount: number;
}

export class TransferFundDto {
  @IsNumber()
  @Min(1)
  @IsRequired()
  amount: number;

  @IsRequired()
  @IsString()
  receiverId: string;
}

export class WithdrawWalletDto {
  @IsNumber()
  @Min(1)
  @IsRequired()
  amount: number;
}
