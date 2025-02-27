import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user successfully', async () => {
    const createUserDto = { name: 'John Doe', email: 'john.doe@example.com' };
    const user = await service.create(createUserDto);

    expect(user).toHaveProperty('id');
    expect(user.name).toBe(createUserDto.name);
    expect(user.email).toBe(createUserDto.email);
  });

  it('should throw BadRequestException if user already exists', async () => {
    const createUserDto = { name: 'Jane Doe', email: 'jane.doe@example.com' };
    await service.create(createUserDto);

    await expect(service.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
