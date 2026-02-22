import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    generatePost(dto: CreatePostDto): Promise<{
        success: boolean;
        topic: string;
        generatedAt: Date;
        content: string;
        hashtags: string[];
    }>;
}
