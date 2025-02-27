import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { Knex } from 'knex';
import { getConnectionToken } from 'nest-knexjs';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let knex: jest.Mocked<Knex>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn(),
    };

    const mockKnex = jest
      .fn()
      .mockImplementation(
        () => mockQueryBuilder,
      ) as unknown as jest.Mocked<Knex>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getConnectionToken(),
          useValue: mockKnex,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    knex = module.get(getConnectionToken()) as jest.Mocked<Knex>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      (
        knex().where({ email: createUserDto.email }).first as jest.Mock
      ).mockResolvedValue(null);

      (knex().insert as jest.Mock).mockResolvedValue([1]);

      const user = await service.create(createUserDto);

      expect(knex().where).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(knex().insert).toHaveBeenCalledWith({
        id: expect.any(String),
        name: createUserDto.name,
        email: createUserDto.email,
      });

      expect(user).toHaveProperty('id');
      expect(user.name).toBe(createUserDto.name);
      expect(user.email).toBe(createUserDto.email);
    });

    it('should throw BadRequestException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      };

      (
        knex().where({ email: createUserDto.email }).first as jest.Mock
      ).mockResolvedValue({
        id: 'existing-user-id',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(knex().where).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(knex().insert).not.toHaveBeenCalled();
    });
  });

  describe('findUser', () => {
    it('should return a user if found', async () => {
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      (
        knex().where({ email: user.email }).first as jest.Mock
      ).mockResolvedValue(user);

      const result = await service.findUser(user.id);

      expect(knex().where).toHaveBeenCalledWith({ id: user.id });
      expect(knex().first).toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      (
        knex().where({ email: user.email }).first as jest.Mock
      ).mockResolvedValue(null);

      const result = await service.findUser('non-existing-id');

      expect(knex().where).toHaveBeenCalledWith({ id: 'non-existing-id' });
      expect(knex().first).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
