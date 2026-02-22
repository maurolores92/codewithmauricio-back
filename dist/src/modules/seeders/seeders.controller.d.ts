import { SeedService } from './seeders.service';
export declare class SeedController {
    private readonly seedService;
    constructor(seedService: SeedService);
    executeSeed(): Promise<{
        message: string;
        results: {
            roles: {
                message: string;
                count: number;
            };
            users: {
                message: string;
                count: number;
            };
        };
    }>;
    seedUsers(): Promise<{
        message: string;
        count: number;
    }>;
    seedRoles(): Promise<{
        message: string;
        count: number;
    }>;
    seedAll(): Promise<{
        message: string;
        results: {
            roles: {
                message: string;
                count: number;
            };
            users: {
                message: string;
                count: number;
            };
        };
    }>;
}
