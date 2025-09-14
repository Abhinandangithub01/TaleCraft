
import React from 'react';
import type { CustomizationOptions } from '../types';
import { STORY_THEMES, ANIMAL_CHARACTERS, STORY_TYPES, MOTIVATIONS, AGES, ILLUSTRATION_STYLES, STORY_LENGTHS } from '../constants';
import SelectInput from './common/SelectInput';
import TextInput from './common/TextInput';
import Button from './common/Button';

interface CustomizationPanelProps {
  options: CustomizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const Icon = ({ path }: { path: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, setOptions, onGenerate, isLoading }) => {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'storyLength') {
        setOptions(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
        setOptions(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-serif font-bold text-brand-text text-center">Create Your Story</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput label="Theme" name="theme" value={options.theme} options={STORY_THEMES} onChange={handleChange} icon={<Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />} />
        <SelectInput label="Story Type" name="storyType" value={options.storyType} options={STORY_TYPES} onChange={handleChange} icon={<Icon path="M12 6.253v11.494m-9-5.747h18" />} />
        <SelectInput label="Main Animal" name="mainAnimal" value={options.mainAnimal} options={ANIMAL_CHARACTERS} onChange={handleChange} icon={<Icon path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <SelectInput label="Secondary Animal" name="secondaryAnimal" value={options.secondaryAnimal} options={ANIMAL_CHARACTERS} onChange={handleChange} icon={<Icon path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
        <SelectInput label="Lesson / Motivation" name="motivation" value={options.motivation} options={MOTIVATIONS} onChange={handleChange} icon={<Icon path="M13 10V3L4 14h7v7l9-11h-7z" />} />
        <SelectInput label="Age Group" name="age" value={options.age} options={AGES} onChange={handleChange} icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} />
        <SelectInput 
            label="Story Length (Pages)" 
            name="storyLength" 
            value={String(options.storyLength)} 
            options={STORY_LENGTHS.map(String)} 
            onChange={handleChange} 
            icon={<Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" />} 
        />
        <div className="md:col-span-2">
            <SelectInput label="Illustration Style" name="illustrationStyle" value={options.illustrationStyle} options={ILLUSTRATION_STYLES} onChange={handleChange} icon={<Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />} />
        </div>
      </div>

       <TextInput label="Main Character's Name (Optional)" name="mainCharacterName" value={options.mainCharacterName} placeholder="e.g., Felix the Fox" onChange={handleChange} icon={<Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />} />

      <div className="pt-4 flex justify-center">
        <Button onClick={onGenerate} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Dreaming up your story...' : 'Generate Storybook'}
          {isLoading ? (
            <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <Icon path="M9 5l7 7-7 7" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default CustomizationPanel;