import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FundWalletDto, TransferFundDto } from './dto/dto';
import { SuccessResponseObject } from '@common/utils/http';
import { AuthGuard } from '@src/auth/auth.guard';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('fund')
  async fundWallet(@Req() req: any, @Body() data: FundWalletDto) {
    const userId = req.user.id;
    await this.walletService.fundWallet(userId, data.amount);

    return new SuccessResponseObject('wallet successfully funded', null);
  }

  @Post('transfer')
  async transferFund(@Req() req: any, @Body() data: TransferFundDto) {
    const userId = req.user.id;
    await this.walletService.transferFunds(
      userId,
      data.receiverId,
      data.amount,
    );

    return new SuccessResponseObject('fund successfully transferred', null);
  }

  @Post('withdraw')
  async withdrawWallet(@Req() req: any, @Body() data: FundWalletDto) {
    const userId = req.user.id;
    await this.walletService.withdrawFunds(userId, data.amount);

    return new SuccessResponseObject('funds successfully withdrawn ', null);
  }
}
