import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface IpRecord {
  count: number;
  date: string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests: Record<string, IpRecord> = {};

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    const today = new Date().toISOString().split('T')[0];

    if (!this.requests[ip]) {
      this.requests[ip] = { count: 1, date: today };
      return true;
    }

    if (this.requests[ip].date !== today) {
      this.requests[ip] = { count: 1, date: today };
      return true;
    }

    if (this.requests[ip].count >= 3) {
      throw new HttpException(
        'Has alcanzado el límite diario de 3 requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.requests[ip].count += 1;
    return true;
  }
}