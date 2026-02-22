export interface IDbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface IAppConfig {
  port: number;
  openRouterApiKey: string;
}

export const DBConfig = (): IDbConfig => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'ai_lab',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

export const AppConfig = (): IAppConfig => ({
  port: Number(process.env.PORT) || 5000,
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
});