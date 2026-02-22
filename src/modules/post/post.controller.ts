import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@Controller('generate-post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(RateLimitGuard)
  @Post()
  async generatePost(@Body() dto: CreatePostDto) {
    return this.postService.generatePost(dto);
  }
}