import { GoogleGenAI, Type, Modality } from "@google/genai";
import { type GameTheme } from '../types';

let ai: GoogleGenAI | null = null;
let initializationError: Error | null = null;

// In a browser-only environment like a simple local server, `process.env` is not defined.
// This try-catch block prevents the app from crashing and instead allows us to show a
// user-friendly error message in the UI.
try {
  // Per @google/genai guidelines, API key must be from process.env.API_KEY.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} catch (e) {
  console.error("Failed to initialize GoogleGenAI. This is expected for local development without a build process that injects environment variables.", e);
  initializationError = new Error("Could not initialize the AI service. Make sure the API key is configured in your execution environment.");
}


// Schema for the text-based theme generation
const themeDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        themeName: { type: Type.STRING, description: 'A creative name for the theme.' },
        character: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the character.' },
                description: {
                    type: Type.STRING,
                    description: 'A detailed visual description for a pixel art image generation AI. The character is for a 2D side-scrolling game. It MUST be facing directly to the right. Describe its appearance and flying pose. E.g., "A side-view of a small, pixel art phoenix with fiery wings, flying to the right."'
                },
            },
            required: ['name', 'description']
        },
        obstacle: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the obstacles.' },
                description: { type: Type.STRING, description: 'A short, visually descriptive sentence for the pixel art obstacles.' },
                imagePrompt: { 
                    type: Type.STRING, 
                    description: 'A detailed prompt for generating a pixel art texture for the obstacles. The texture must be vertically tileable. E.g., "Ancient crumbling stone pillar with glowing blue runes, pixel art."' 
                },
            },
            required: ['name', 'description', 'imagePrompt']
        },
        background: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: 'A detailed visual description for a pixel art image generation AI. Describe a vertically scrolling background for a Flappy Bird style game. E.g., "A vibrant, magical forest with glowing mushrooms and tall, whimsical trees, pixel art style."' },
            },
            required: ['description']
        }
    },
    required: ['themeName', 'character', 'obstacle', 'background']
};

const generateImage = async (prompt: string): Promise<string> => {
    if (!ai) {
        throw initializationError || new Error("AI service is not available.");
    }

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
  if (!ai) {
    throw initializationError || new Error("AI service is not available.");
  }
  
  // Per @google/genai guidelines, API key is a hard requirement and no fallback should be implemented.
  try {
    // 1. Generate the theme descriptions and metadata
    const descriptionResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a theme for a "Flappy Bird" style game based on this idea: "${prompt}". All assets must be in a pixel art style. Provide a character, obstacles, and a background. Be creative and descriptive for all generated assets.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: themeDescriptionSchema,
        },
    });

    const jsonText = descriptionResponse.text.trim();
    const themeDescriptions = JSON.parse(jsonText);
    
    // 2. Generate images based on the descriptions
    const characterPrompt = `Side-view profile of ${themeDescriptions.character.description}, facing right. Pixel art style. The character MUST be on a solid, pure green screen background (#00FF00), which will be removed later. No text, no other objects.`;
    const backgroundPrompt = `${themeDescriptions.background.description}. 16-bit pixel art style.`;
    const obstaclePrompt = `${themeDescriptions.obstacle.imagePrompt}. Vertically seamless tileable texture. Pixel art style.`;

    const [characterImageUrl, backgroundImageUrl, obstacleImageUrl] = await Promise.all([
        generateImage(characterPrompt),
        generateImage(backgroundPrompt),
        generateImage(obstaclePrompt)
    ]);

    // 3. Assemble the final theme object
    return {
        prompt,
        themeName: themeDescriptions.themeName,
        character: {
            name: themeDescriptions.character.name,
            description: themeDescriptions.character.description,
            imageUrl: characterImageUrl,
        },
        obstacle: {
            name: themeDescriptions.obstacle.name,
            description: themeDescriptions.obstacle.description,
            imageUrl: obstacleImageUrl,
        },
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