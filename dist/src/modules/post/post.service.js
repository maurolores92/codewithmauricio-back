"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../../ai/ai.service");
let PostService = class PostService {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generatePost(dto) {
        const { topic, tone = 'profesional', length = 'medium', } = dto;
        const autoTopics = [
            'Inteligencia Artificial en negocios',
            'Productividad para desarrolladores',
            'Clean Architecture en backend',
            'El futuro del desarrollo web',
            'Cómo destacar como programador junior',
        ];
        const finalTopic = topic || autoTopics[Math.floor(Math.random() * autoTopics.length)];
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
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], PostService);
//# sourceMappingURL=post.service.js.map