import { GoogleGenAI, Type, Modality } from "@google/genai";
import { type GameTheme } from '../types';

// Per @google/genai guidelines, API key must be from process.env.API_KEY and assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Schema for the text-based theme generation
const themeDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        themeName: { type: Type.STRING, description: 'A creative name for the theme.' },
        character: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the character.' },
                description: { type: Type.STRING, description: 'A detailed visual description for an image generation AI. Describe the character, its appearance, and its pose as if it is the character in a Flappy Bird style game. E.g., "A cute, round, cartoon baby dragon with small wings, seen from the side, flying forward."' },
            },
            required: ['name', 'description']
        },
        obstacle: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the obstacles.' },
                description: { type: Type.STRING, description: 'A short, visually descriptive sentence for the obstacles.' },
                color: { type: Type.STRING, description: 'A hex color code for the obstacles (e.g., #4ade80 for green).' },
            },
            required: ['name', 'description', 'color']
        },
        background: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: 'A detailed visual description for an image generation AI. Describe a vertically scrolling background for a Flappy Bird style game. E.g., "A vibrant, magical forest with glowing mushrooms and tall, whimsical trees, cartoon style."' },
            },
            required: ['description']
        }
    },
    required: ['themeName', 'character', 'obstacle', 'background']
};

const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error('Image generation failed to return an image.');
};


export const generateTheme = async (prompt: string): Promise<GameTheme> => {
  // Per @google/genai guidelines, API key is a hard requirement and no fallback should be implemented.
  try {
    // 1. Generate the theme descriptions and metadata
    const descriptionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a theme for a "Flappy Bird" style game based on this idea: "${prompt}". Provide a character, obstacles, and a background. Be creative and descriptive for the image generation prompts.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: themeDescriptionSchema,
        },
    });

    const jsonText = descriptionResponse.text.trim();
    const themeDescriptions = JSON.parse(jsonText);
    
    // 2. Generate images based on the descriptions
    const [characterImageUrl, backgroundImageUrl] = await Promise.all([
        generateImage(themeDescriptions.character.description),
        generateImage(themeDescriptions.background.description)
    ]);

    // 3. Assemble the final theme object
    return {
        themeName: themeDescriptions.themeName,
        character: {
            name: themeDescriptions.character.name,
            description: themeDescriptions.character.description,
            imageUrl: characterImageUrl,
        },
        obstacle: themeDescriptions.obstacle,
        background: {
            description: themeDescriptions.background.description,
            imageUrl: backgroundImageUrl,
        },
    };
  } catch (error) {
    console.error("Error generating theme with Gemini:", error);
    throw new Error("Failed to generate game theme. The AI might be busy, please try again.");
  }
};
