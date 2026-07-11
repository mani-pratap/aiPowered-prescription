import { useState } from 'react';

const MedicineSearch = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form onSubmit={submitHandler} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-slate-900 border border-slate-700 overflow-hidden">
        <div className="grid place-items-center h-full w-12 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          className="peer h-full w-full outline-none text-sm text-slate-100 pr-2 bg-transparent placeholder-slate-500"
          type="text"
          id="search"
          placeholder="Search by medicine, generic name, category, or company..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit" className="px-6 h-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
          Search
        </button>
      </div>
    </form>
  );
};

export default MedicineSearch;
