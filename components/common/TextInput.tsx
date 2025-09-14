import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({ label, name, value, placeholder, onChange, icon }) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-brand-text mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</div>}
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-white text-brand-text border border-gray-200 rounded-md shadow-sm placeholder-brand-light-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent sm:text-sm transition duration-150 ease-in-out`}
        />
      </div>
    </div>
  );
};

export default TextInput;