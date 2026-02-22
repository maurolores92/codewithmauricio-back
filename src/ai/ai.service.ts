import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AiService {
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'Eres un experto creador de contenido profesional.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message);
      }

      return data.choices[0].message.content;
    } catch (error) {
      throw new HttpException(
        'Error generando contenido con IA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}