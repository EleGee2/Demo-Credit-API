import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Unauthorized. Missing or invalid token.',
      );
    }

    const userId = authHeader.replace('Bearer ', '').trim();
    if (!userId) {
      throw new UnauthorizedException('Invalid token format.');
    }

    const currentUser = await this.authService.findUser(userId);
    if (!currentUser) {
      throw new UnauthorizedException(
        'Auth token is invalid, please re-login.',
      );
    }
    (request as Request & { user: { id: string } }).user = { id: userId };

    return true;
  }
}
