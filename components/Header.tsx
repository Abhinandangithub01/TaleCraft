
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md rounded-xl max-w-4xl mx-auto w-full p-4 text-center my-6">
       <h1 className="text-4xl font-serif font-bold text-brand-primary">
        TaleCraft
       </h1>
       <p className="text-brand-light-text mt-2 font-sans">
        Craft magical, AI-powered stories for your little ones.
       </p>
    </header>
  );
};

export default Header;