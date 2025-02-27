import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateLedgerEntryArg,
  CreateTransactionArg,
  Transaction,
  Wallet,
  WalletLedgerEntry,
} from './types';

@Injectable()
export class WalletService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async fundWallet(userId: string, amount: number) {
    return this.knex.transaction(async (trx) => {
      const wallet = await this.getOrCreateWallet(userId, trx);

      const transactionId = await this.createTransaction({
        walletId: wallet.id,
        userId,
        amount,
        trx,
        type: 'fund',
      });
      await this.updateWalletBalance(wallet.id, amount, trx);
      await this.createCreditLedgerEntry({
        wallet,
        userId,
        transactionId,
        amount,
        trx,
        direction: 'credit',
        description: `Wallet funded with ${amount}`,
        type: 'fund',
      });

      return wallet;
    });
  }

  private async getOrCreateWallet(
    userId: string,
    trx: Knex.Transaction,
  ): Promise<Wallet> {
    const wallet = await trx('wallets').where('user_id', userId).first();

    if (!wallet) {
      const walletId = uuidv4();
      const newWallet: Wallet = {
        id: walletId,
        user_id: userId,
        ledger_balance: 0,
        available_balance: 0,
        created_at: new Date(),
      };

      await trx('wallets').insert(newWallet);
      return newWallet;
    }

    return wallet;
  }

  private async createTransaction(data: CreateTransactionArg): Promise<string> {
    const { walletId, userId, amount, trx, type } = data;
    const transactionId = uuidv4();
    const transaction: Transaction = {
      id: transactionId,
      wallet_id: walletId,
      user_id: userId,
      type,
      amount,
      status: 'completed',
      created_at: new Date(),
    };

    await trx('transactions').insert(transaction);
    return transactionId;
  }

  private async updateWalletBalance(
    walletId: string,
    amount: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('wallets')
      .where('id', walletId)
      .update({
        ledger_balance: this.knex.raw('ledger_balance + ?', [amount]),
        available_balance: this.knex.raw('available_balance + ?', [amount]),
      })
      .returning('*');
  }

  private async createCreditLedgerEntry(
    data: CreateLedgerEntryArg,
  ): Promise<void> {
    const {
      wallet,
      userId,
      transactionId,
      amount,
      trx,
      direction,
      description,
      type,
    } = data;
    const ledgerEntry: WalletLedgerEntry = {
      id: uuidv4(),
      wallet_id: wallet.id,
      user_id: userId,
      transaction_id: transactionId,
      type,
      amount,
      previous_balance: Number(wallet.ledger_balance),
      new_balance: Number(wallet.ledger_balance) + amount,
      status: 'completed',
      direction,
      description,
      created_at: new Date(),
    };

    await trx('wallet_ledger').insert(ledgerEntry);
  }

  private async createDebitLedgerEntry(
    data: CreateLedgerEntryArg,
  ): Promise<void> {
    const {
      wallet,
      userId,
      transactionId,
      amount,
      trx,
      direction,
      description,
      type,
    } = data;
    const ledgerEntry: WalletLedgerEntry = {
      id: uuidv4(),
      wallet_id: wallet.id,
      user_id: userId,
      transaction_id: transactionId,
      type,
      amount,
      previous_balance: Number(wallet.ledger_balance),
      new_balance: Number(wallet.ledger_balance) - amount,
      status: 'completed',
      direction,
      description,
      created_at: new Date(),
    };

    await trx('wallet_ledger').insert(ledgerEntry);
  }

  async getWallet(
    userId: string,
    trx: Knex.Transaction,
  ): Promise<Wallet | null> {
    return trx('wallets').where('user_id', userId).first();
  }

  private async updateSenderWalletBalance(
    trx: Knex.Transaction,
    walletId: string,
    amount: number,
  ) {
    await trx('wallets')
      .where('id', walletId)
      .update({
        ledger_balance: trx.raw('ledger_balance - ?', [amount]),
        available_balance: trx.raw('available_balance - ?', [amount]),
      });
  }

  async transferFunds(senderId: string, receiverId: string, amount: number) {
    return this.knex.transaction(async (trx) => {
      const senderWallet = await this.getWallet(senderId, trx);
      const receiverWallet = await this.getWallet(receiverId, trx);

      if (!senderWallet || !receiverWallet)
        throw new BadRequestException('Invalid sender or receiver');
      if (senderWallet.available_balance < amount)
        throw new BadRequestException('Insufficient available balance');

      const senderTransactionId = await this.createTransaction({
        trx,
        walletId: senderWallet.id,
        userId: senderId,
        type: 'transfer',
        amount,
      });
      const receiverTransactionId = await this.createTransaction({
        trx,
        walletId: receiverWallet.id,
        userId: receiverId,
        type: 'transfer',
        amount,
      });

      await this.updateSenderWalletBalance(trx, senderWallet.id, amount);
      await this.updateWalletBalance(receiverWallet.id, amount, trx);

      await this.createDebitLedgerEntry({
        trx,
        wallet: senderWallet,
        userId: senderId,
        transactionId: senderTransactionId,
        type: 'transfer',
        amount,
        direction: 'debit',
        description: `Transferred ${amount} to user ${receiverId}`,
      });

      await this.createCreditLedgerEntry({
        trx,
        wallet: receiverWallet,
        userId: receiverId,
        transactionId: receiverTransactionId,
        type: 'transfer',
        amount,
        direction: 'credit',
        description: `Received ${amount} from user ${senderId}`,
      });
    });
  }

  async withdrawFunds(userId: string, amount: number) {
    return this.knex.transaction(async (trx) => {
      const wallet = await this.getWallet(userId, trx);
      if (!wallet) {
        throw new NotFoundException('wallet not found');
      }

      if (wallet.available_balance < amount) {
        throw new BadRequestException('Insufficient available balance');
      }
      await this.updateSenderWalletBalance(trx, wallet.id, amount);

      const transactionId = await this.createTransaction({
        walletId: wallet.id,
        userId,
        amount,
        type: 'withdraw',
        trx,
      });

      await this.createDebitLedgerEntry({
        wallet,
        userId,
        type: 'withdraw',
        amount,
        direction: 'debit',
        description: `Withdrawal of ${amount} completed`,
        trx,
        transactionId,
      });
    });
  }
}
