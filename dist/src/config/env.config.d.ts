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
export declare const DBConfig: () => IDbConfig;
export declare const AppConfig: () => IAppConfig;
