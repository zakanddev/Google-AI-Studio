import { GoogleGenAI, Type } from "@google/genai";
import { type GameTheme } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("Gemini API key not found. Using a placeholder. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        themeName: { type: Type.STRING, description: 'A creative name for the theme.' },
        character: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the character.' },
                description: { type: Type.STRING, description: 'A short, visually descriptive sentence for the character.' },
                imageUrl: { type: Type.STRING, description: 'A placeholder image URL from `https://picsum.photos/200`.' },
            },
            required: ['name', 'description', 'imageUrl']
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
                description: { type: Type.STRING, description: 'A short, visually descriptive sentence for the background.' },
                imageUrl: { type: Type.STRING, description: 'A placeholder image URL from `https://picsum.photos/400/600`.' },
            },
            required: ['description', 'imageUrl']
        }
    },
    required: ['themeName', 'character', 'obstacle', 'background']
};


export const generateTheme = async (prompt: string): Promise<GameTheme> => {
  if (!API_KEY) {
    // Fallback for developers without an API key
    return {
      themeName: "Developer Mode",
      character: { name: "Debug Duck", description: "A classic rubber duck, but its pixels are showing.", imageUrl: "https://picsum.photos/200" },
      obstacle: { name: "Code Brackets", description: "Giant, menacing curly braces that threaten to encapsulate you.", color: "#4ade80" },
      background: { description: "A scrolling background of binary code and digital rain.", imageUrl: "https://picsum.photos/400/600" }
    };
  }

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a theme for a "Flappy Bird" style game based on this idea: "${prompt}". Provide a character, obstacles, and a background. Ensure all image URLs are valid placeholders.`,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const theme = JSON.parse(jsonText);
    
    // Ensure placeholder URLs are valid
    theme.character.imageUrl = `https://picsum.photos/seed/${Math.random()}/200`;
    theme.background.imageUrl = `https://picsum.photos/seed/${Math.random()}/400/600`;

    return theme as GameTheme;
  } catch (error) {
    console.error("Error generating theme with Gemini:", error);
    throw new Error("Failed to generate game theme. The AI might be busy, please try again.");
  }
};
