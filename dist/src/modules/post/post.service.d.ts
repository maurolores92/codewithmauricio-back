import { CreatePostDto } from './dto/create-post.dto';
import { AiService } from '../../ai/ai.service';
export declare class PostService {
    private readonly aiService;
    constructor(aiService: AiService);
    generatePost(dto: CreatePostDto): Promise<{
        success: boolean;
        topic: string;
        generatedAt: Date;
        content: string;
        hashtags: string[];
    }>;
}
