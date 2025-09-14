export interface CustomizationOptions {
  theme: string;
  mainAnimal: string;
  secondaryAnimal: string;
  storyType: string;
  motivation: string;
  age: string;
  mainCharacterName: string;
  illustrationStyle: string;
  storyLength: number;
}

export interface StoryPage {
  pageText: string;
  imagePrompt: string;
  imageUrl?: string;
  isImageLoading?: boolean;
}