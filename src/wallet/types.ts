import { Knex } from 'knex';

export interface Wallet {
  id: string;
  user_id: string;
  ledger_balance: number;
  available_balance: number;
  created_at: Date;
}

export interface WalletLedgerEntry {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_id: string;
  type: 'fund' | 'withdraw' | 'transfer';
  amount: number;
  previous_balance: number;
  new_balance: number;
  status: 'pending' | 'completed' | 'failed';
  direction: 'debit' | 'credit';
  description: string;
  created_at: Date;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'fund' | 'withdraw' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export type CreateLedgerEntryArg = {
  wallet: Wallet;
  userId: string;
  transactionId: string;
  amount: number;
  trx: Knex.Transaction;
  direction: 'debit' | 'credit';
  description: string;
  type: 'fund' | 'withdraw' | 'transfer';
};

export type CreateTransactionArg = {
  walletId: string;
  userId: string;
  amount: number;
  trx: Knex.Transaction;
  type: 'fund' | 'withdraw' | 'transfer';
};
