"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = exports.DBConfig = void 0;
const DBConfig = () => ({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'ai_lab',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
});
exports.DBConfig = DBConfig;
const AppConfig = () => ({
    port: Number(process.env.PORT) || 5000,
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
});
exports.AppConfig = AppConfig;
//# sourceMappingURL=env.config.js.map