import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Knex } from 'knex';
import { getConnectionToken } from 'nest-knexjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let mockKnex: jest.Mocked<Knex>;
  let mockTransaction: jest.Mocked<Knex.Transaction>;

  beforeEach(async () => {
    mockTransaction = {
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue(1),
      insert: jest.fn().mockResolvedValue([1]),
      raw: jest.fn((query, values) => `${query} ${values}`),
      commit: jest.fn(),
      rollback: jest.fn(),
    } as any;

    mockKnex = {
      transaction: jest.fn().mockImplementation((callback) => {
        return callback(mockTransaction);
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getConnectionToken(), useValue: mockKnex },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);

    jest
      .spyOn(service as any, 'getOrCreateWallet')
      .mockResolvedValue({ id: 'wallet123', ledger_balance: 0 });
    jest
      .spyOn(service as any, 'getWallet')
      .mockImplementation(async (userId: string) => {
        if (userId === 'sender123')
          return {
            id: 'walletSender',
            available_balance: 500,
            ledger_balance: 500,
          };
        if (userId === 'receiver123')
          return {
            id: 'walletReceiver',
            available_balance: 200,
            ledger_balance: 200,
          };
        return null;
      });
    jest.spyOn(service as any, 'createTransaction').mockResolvedValue('txn123');
    jest
      .spyOn(service as any, 'updateWalletBalance')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'createCreditLedgerEntry')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'createDebitLedgerEntry')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'updateSenderWalletBalance')
      .mockResolvedValue(undefined);
  });

  describe('fundWallet', () => {
    it('should successfully fund a wallet', async () => {
      const userId = 'user123';
      const amount = 100;

      await service.fundWallet(userId, amount);

      expect(service['getOrCreateWallet']).toHaveBeenCalledWith(
        userId,
        mockTransaction,
      );
      expect(service['createTransaction']).toHaveBeenCalledWith({
        walletId: 'wallet123',
        userId,
        amount,
        trx: mockTransaction,
        type: 'fund',
      });
      expect(service['updateWalletBalance']).toHaveBeenCalledWith(
        'wallet123',
        amount,
        mockTransaction,
      );
      expect(service['createCreditLedgerEntry']).toHaveBeenCalledWith({
        wallet: { id: 'wallet123', ledger_balance: 0 },
        userId,
        transactionId: 'txn123',
        amount,
        trx: mockTransaction,
        direction: 'credit',
        description: `Wallet funded with ${amount}`,
        type: 'fund',
      });
    });
  });

  describe('transferFunds', () => {
    it('should successfully transfer funds between wallets', async () => {
      const senderId = 'sender123';
      const receiverId = 'receiver123';
      const amount = 100;

      await service.transferFunds(senderId, receiverId, amount);

      expect(service['getWallet']).toHaveBeenCalledWith(
        senderId,
        mockTransaction,
      );
      expect(service['getWallet']).toHaveBeenCalledWith(
        receiverId,
        mockTransaction,
      );

      expect(service['createTransaction']).toHaveBeenCalledWith({
        trx: mockTransaction,
        walletId: 'walletSender',
        userId: senderId,
        type: 'transfer',
        amount,
      });
      expect(service['createTransaction']).toHaveBeenCalledWith({
        trx: mockTransaction,
        walletId: 'walletReceiver',
        userId: receiverId,
        type: 'transfer',
        amount,
      });

      expect(service['updateSenderWalletBalance']).toHaveBeenCalledTimes(1);

      expect(service['updateWalletBalance']).toHaveBeenCalledWith(
        'walletReceiver',
        amount,
        mockTransaction,
      );

      expect(service['createDebitLedgerEntry']).toHaveBeenCalledWith({
        trx: mockTransaction,
        wallet: {
          id: 'walletSender',
          available_balance: 500,
          ledger_balance: 500,
        },
        userId: senderId,
        transactionId: 'txn123',
        type: 'transfer',
        amount,
        direction: 'debit',
        description: `Transferred ${amount} to user ${receiverId}`,
      });

      expect(service['createCreditLedgerEntry']).toHaveBeenCalledWith({
        trx: mockTransaction,
        wallet: {
          id: 'walletReceiver',
          available_balance: 200,
          ledger_balance: 200,
        },
        userId: receiverId,
        transactionId: 'txn123',
        type: 'transfer',
        amount,
        direction: 'credit',
        description: `Received ${amount} from user ${senderId}`,
      });
    });

    it('should throw BadRequestException if sender or receiver wallet does not exist', async () => {
      jest.spyOn(service as any, 'getWallet').mockResolvedValueOnce(null);

      await expect(
        service.transferFunds('invalidSender', 'receiver123', 100),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.transferFunds('sender123', 'invalidReceiver', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if sender has insufficient balance', async () => {
      jest.spyOn(service as any, 'getWallet').mockResolvedValueOnce({
        id: 'walletSender',
        available_balance: 50,
        ledger_balance: 50,
      });

      await expect(
        service.transferFunds('sender123', 'receiver123', 100),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdrawFunds', () => {
    const userId = 'user123';
    const amount = 50;
    const mockWallet = {
      id: 'wallet123',
      ledger_balance: 200,
      available_balance: 100,
    };

    it('should successfully withdraw funds', async () => {
      jest.spyOn(service as any, 'getWallet').mockResolvedValue(mockWallet);
      jest
        .spyOn(service as any, 'createTransaction')
        .mockResolvedValue('txn123');
      jest
        .spyOn(service as any, 'createDebitLedgerEntry')
        .mockResolvedValue(undefined);

      await service.withdrawFunds(userId, amount);

      expect(service['getWallet']).toHaveBeenCalledWith(
        userId,
        mockTransaction,
      );
      expect(service['createTransaction']).toHaveBeenCalledWith({
        walletId: mockWallet.id,
        userId,
        amount,
        type: 'withdraw',
        trx: mockTransaction,
      });
      expect(service['createDebitLedgerEntry']).toHaveBeenCalledWith({
        wallet: mockWallet,
        userId,
        type: 'withdraw',
        amount,
        direction: 'debit',
        description: `Withdrawal of ${amount} completed`,
        trx: mockTransaction,
        transactionId: 'txn123',
      });
    });

    it('should throw NotFoundException if wallet does not exist', async () => {
      jest.spyOn(service as any, 'getWallet').mockResolvedValue(null);

      await expect(service.withdrawFunds(userId, amount)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      jest.spyOn(service as any, 'getWallet').mockResolvedValue({
        ...mockWallet,
        available_balance: 30,
      });

      await expect(service.withdrawFunds(userId, amount)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
