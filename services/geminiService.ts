import { GoogleGenAI, Type } from "@google/genai";
import type { CustomizationOptions, StoryPage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateStoryPrompt = (options: CustomizationOptions): string => {
  return `You are a master storyteller for children. Create a gentle, soothing, and positive bedtime story suitable for a ${options.age} year old. The story should be exactly ${options.storyLength} pages long.

  **Theme:** ${options.theme}
  **Main Character:** A brave little ${options.mainAnimal} named ${options.mainCharacterName || 'the little ' + options.mainAnimal}.
  **Secondary Character:** A wise old ${options.secondaryAnimal}.
  **Setting:** The story takes place in the world of the theme.
  **Story Type:** ${options.storyType}
  **Core Motivation/Lesson:** The story should subtly teach the lesson of ${options.motivation}.
  **Illustration Style:** ${options.illustrationStyle}
  
  Please provide the story in a JSON array format. Each element in the array represents a page and must have two keys:
  1. "pageText": A string containing the story text for that page (no more than 60 words). The story should flow logically from one page to the next.
  2. "imagePrompt": A detailed, vivid, and imaginative description for an illustration that matches the page's text. The style should be '${options.illustrationStyle}'.
  `;
};

export const regenerateImage = async (imagePrompt: string, illustrationStyle: string): Promise<string> => {
    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `${imagePrompt}, style of ${illustrationStyle}, cute, charming, soft lighting`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("Image generation failed to return an image.");
    } catch (error) {
        console.error("Error regenerating image with Gemini:", error);
        throw new Error("There was an issue creating the new image. Please try again.");
    }
};

export const generateStoryAndImages = async (options: CustomizationOptions): Promise<StoryPage[]> => {
  try {
    const storyPrompt = generateStoryPrompt(options);

    // 1. Generate story text and image prompts
    const storyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: storyPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageText: {
                type: Type.STRING,
                description: 'The story text for a single page.',
              },
              imagePrompt: {
                type: Type.STRING,
                description: 'A detailed prompt for generating an image for this page.',
              },
            },
            required: ["pageText", "imagePrompt"],
          },
        },
      },
    });

    const storyPages: StoryPage[] = JSON.parse(storyResponse.text);

    if (!storyPages || storyPages.length === 0) {
      throw new Error("Failed to generate story content.");
    }
    
    // 2. Generate images for each page in parallel
    const imageGenerationPromises = storyPages.map(async (page) => {
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `${page.imagePrompt}, style of ${options.illustrationStyle}, cute, charming, soft lighting`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
      });

      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      return undefined; // Return undefined if image generation fails for a page
    });

    const imageUrls = await Promise.all(imageGenerationPromises);

    // 3. Combine story text with generated images
    const finalStoryPages: StoryPage[] = storyPages.map((page, index) => ({
      ...page,
      imageUrl: imageUrls[index],
    }));

    // 4. Generate Cover Page
    const title = options.mainCharacterName
        ? `${options.mainCharacterName}'s ${options.theme} Adventure`
        : `The Little ${options.mainAnimal}'s ${options.theme} Adventure`;

    const coverImagePrompt = `A beautiful and enchanting cover illustration for a children's book titled '${title}'. The scene features a brave little ${options.mainAnimal}${options.mainCharacterName ? ` named ${options.mainCharacterName}`: ''} and a wise old ${options.secondaryAnimal} in the magical world of the ${options.theme}. The style is ${options.illustrationStyle}, vibrant, whimsical, and inviting, with a dreamy atmosphere, and a sense of wonder.`;

    const coverImageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: coverImagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    });

    const coverImageUrl = (coverImageResponse.generatedImages && coverImageResponse.generatedImages.length > 0)
        ? `data:image/jpeg;base64,${coverImageResponse.generatedImages[0].image.imageBytes}`
        : undefined;

    const coverPage: StoryPage = {
        pageText: title,
        imagePrompt: coverImagePrompt,
        imageUrl: coverImageUrl,
    };

    // 5. Return story with cover
    return [coverPage, ...finalStoryPages];

  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    throw new Error("There was an issue creating your story. Please try again.");
  }
};