import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class PostService {
  constructor(private readonly aiService: AiService) {}

async generatePost(dto: CreatePostDto) {
  const {
    topic,
    tone = 'profesional',
    length = 'medium',
  } = dto;

  const autoTopics = [
    'Inteligencia Artificial en negocios',
    'Productividad para desarrolladores',
    'Clean Architecture en backend',
    'El futuro del desarrollo web',
    'Cómo destacar como programador junior',
  ];

  const finalTopic =
    topic || autoTopics[Math.floor(Math.random() * autoTopics.length)];

  const lengthGuide = {
    short: '100-150 palabras',
    medium: '200-300 palabras',
    long: '400-600 palabras',
  };

  const prompt = `
Crea un post para LinkedIn.

Tema: ${finalTopic}
Tono: ${tone}
Extensión: ${lengthGuide[length]}

Estructura obligatoria:
- Hook fuerte al inicio
- Desarrollo claro
- Cierre con reflexión o llamada a la acción
- Usa emojis estratégicamente
- Párrafos cortos
`;

  const content = await this.aiService.generateText(prompt);
  // Generar hashtags relacionados (15)
  const hashtagsPrompt = `Genera exactamente 15 hashtags populares y relevantes para el siguiente post sobre: "${finalTopic}". Devuélvelos separados por comas, sin explicaciones. Cada hashtag debe empezar con # y no contener espacios.`;

  const hashtagsRaw = await this.aiService.generateText(hashtagsPrompt);

  const hashtags = (hashtagsRaw || '')
    .split(/[,\n]+/)
    .map((h) => h.trim())
    .filter(Boolean)
    .map((h) => (h.startsWith('#') ? h : `#${h.replace(/\s+/g, '')}`))
    .slice(0, 15);

  return {
    success: true,
    topic: finalTopic,
    generatedAt: new Date(),
    content,
    hashtags,
  };
}   
}