import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SuccessResponseObject } from '@common/utils/http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createAccount(@Body() data: CreateUserDto) {
    const user = await this.authService.createUser(data);

    return new SuccessResponseObject('user created successfully', user);
  }
}
