import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

@Injectable()
export class UserService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.knex('users')
      .where({ email: createUserDto.email })
      .first();

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = {
      id: uuidv4(),
      name: createUserDto.name,
      email: createUserDto.email,
    };
    await this.knex('users').insert(user);

    return user;
  }

  async findUser(id: string): Promise<User | null> {
    return this.knex('users').where({ id }).first();
  }
}
