import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const GetUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    console.log('[GetUser Decorator] User from request:', {
      hasUser: !!request.user,
      userId: request.user?.id,
      userEmail: request.user?.email,
      isAdmin: request.user?.isAdmin,
      role: request.user?.role
    });
    
    if (!request.user) {
       throw new InternalServerErrorException('User not found'); 
    }
    if (data) {
      return request.user[data];
    }
    return request.user;
});