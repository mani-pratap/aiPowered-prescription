const LanguageSwitcher = ({ currentLanguage, onLanguageChange }) => {
  const languages = ['English', 'Hindi', 'Telugu', 'Tamil'];

  return (
    <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            currentLanguage === lang 
              ? 'bg-indigo-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
