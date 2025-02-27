import { BadRequestException, Injectable } from '@nestjs/common';
import { ProviderService } from '@src/provider/provider.service';
import { UserService } from '@src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private providerService: ProviderService,
  ) {}

  async createUser(data: CreateUserDto) {
    const blackListed = await this.providerService.checkBlackListedEmail(
      data.email,
    );

    if (blackListed?.reason !== null) {
      throw new BadRequestException('user email is blacklisted');
    }

    return this.userService.create(data);
  }

  async findUser(id: string) {
    return this.userService.findUser(id);
  }
}
