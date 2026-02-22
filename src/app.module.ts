import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PostModule } from './modules/post/post.module';
import { AiModule } from './ai/ai.module';
import { AiService } from './ai/ai.service';
import { DomainMiddleware } from './common/middleware/domain.middleware';
import { WebsocketModule } from './common/socket/websocket.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seeders/seeders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PostModule,
    AiModule,
    WebsocketModule,
    NotificationsModule,
    AuthModule,
    SeedModule,
    
    // AiModule,
  ],
  providers: [AiService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DomainMiddleware)
      .forRoutes('*'); // Se aplica a todas las rutas
  }
}