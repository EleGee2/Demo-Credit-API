import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ProviderService } from '@src/provider/provider.service';
import { UserService } from '@src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let providerService: ProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findUser: jest.fn(),
          },
        },
        {
          provide: ProviderService,
          useValue: {
            checkBlackListedEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    providerService = module.get<ProviderService>(ProviderService);
  });

  describe('createUser', () => {
    it('should successfully create a user if email is not blacklisted', async () => {
      const userDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      jest
        .spyOn(providerService, 'checkBlackListedEmail')
        .mockResolvedValue({ reason: null });
      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
      });

      const result = await authService.createUser(userDto);

      expect(providerService.checkBlackListedEmail).toHaveBeenCalledWith(
        userDto.email,
      );
      expect(userService.create).toHaveBeenCalledWith(userDto);
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
      });
    });

    it('should throw an error if the email is blacklisted', async () => {
      const userDto: CreateUserDto = {
        email: 'blacklisted@example.com',
        name: 'John Doe',
      };

      jest
        .spyOn(providerService, 'checkBlackListedEmail')
        .mockResolvedValue({ reason: 'fraud' });

      await expect(authService.createUser(userDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.createUser(userDto)).rejects.toThrow(
        'user email is blacklisted',
      );

      expect(providerService.checkBlackListedEmail).toHaveBeenCalledWith(
        userDto.email,
      );
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('findUser', () => {
    it('should return user details if user exists', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'John Doe',
      };

      jest.spyOn(userService, 'findUser').mockResolvedValue(mockUser);

      const result = await authService.findUser('123');

      expect(userService.findUser).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(userService, 'findUser').mockResolvedValue(null);

      const result = await authService.findUser('999');

      expect(userService.findUser).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });
});
