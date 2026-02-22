import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RateLimitGuard implements CanActivate {
    private requests;
    canActivate(context: ExecutionContext): boolean;
}
