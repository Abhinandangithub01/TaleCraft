import React from 'react';

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ReactNode;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, name, value, options, onChange, icon }) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-brand-text mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</div>}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-10 py-2 text-base bg-white text-brand-text border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent sm:text-sm rounded-md shadow-sm transition duration-150 ease-in-out`}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectInput;