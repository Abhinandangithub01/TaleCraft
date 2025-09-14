import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import CustomizationPanel from './components/CustomizationPanel';
import StoryDisplay from './components/StoryDisplay';
import BackgroundMusic from './components/BackgroundMusic';
import type { CustomizationOptions, StoryPage } from './types';
import { STORY_THEMES, ANIMAL_CHARACTERS, STORY_TYPES, MOTIVATIONS, AGES, ILLUSTRATION_STYLES, STORY_LENGTHS } from './constants';
import { generateStoryAndImages, regenerateImage } from './services/geminiService';

const App: React.FC = () => {
  const [options, setOptions] = useState<CustomizationOptions>({
    theme: STORY_THEMES[0],
    mainAnimal: ANIMAL_CHARACTERS[0],
    secondaryAnimal: ANIMAL_CHARACTERS[1],
    storyType: STORY_TYPES[0],
    motivation: MOTIVATIONS[0],
    age: AGES[1],
    mainCharacterName: '',
    illustrationStyle: ILLUSTRATION_STYLES[0],
    storyLength: STORY_LENGTHS[1],
  });

  const [story, setStory] = useState<StoryPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStory([]);

    try {
      const generatedStory = await generateStoryAndImages(options);
      setStory(generatedStory);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const handleRegenerateImage = useCallback(async (pageIndex: number) => {
    const pageToUpdate = story[pageIndex];
    if (!pageToUpdate || pageToUpdate.isImageLoading) return;

    // Set loading state for the specific page
    setStory(currentStory =>
      currentStory.map((page, index) =>
        index === pageIndex ? { ...page, isImageLoading: true } : page
      )
    );

    try {
      const newImageUrl = await regenerateImage(pageToUpdate.imagePrompt, options.illustrationStyle);
      
      // Update story with the new image
      setStory(currentStory =>
        currentStory.map((page, index) =>
          index === pageIndex ? { ...page, imageUrl: newImageUrl, isImageLoading: false } : page
        )
      );
    } catch (err) {
      console.error("Failed to regenerate image:", err);
      alert("Sorry, we couldn't create a new image. Please try again.");
       // Reset loading state on error
      setStory(currentStory =>
        currentStory.map((page, index) =>
          index === pageIndex ? { ...page, isImageLoading: false } : page
        )
      );
    }
  }, [story, options.illustrationStyle]);

  return (
    <div className="min-h-screen font-sans text-brand-text p-4 md:p-6">
      <BackgroundMusic />
      <main className="max-w-7xl mx-auto">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <CustomizationPanel
            options={options}
            setOptions={setOptions}
            onGenerate={handleGenerateStory}
            isLoading={isLoading}
          />
          <StoryDisplay
            story={story}
            isLoading={isLoading}
            error={error}
            onRegenerateImage={handleRegenerateImage}
          />
        </div>
        <footer className="text-center py-8 mt-8 text-brand-light-text">
          <p>Powered by Google Gemini. Created with imagination.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;