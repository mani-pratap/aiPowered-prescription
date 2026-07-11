const DietCard = ({ dietData }) => {
  if (!dietData) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-full">
      <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center border-b border-slate-800 pb-4">
        <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Personalized Diet Plan
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded inline-block text-sm mb-3">
            ✓ Foods to Eat
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {dietData.foodsToEat?.map((food, i) => (
              <li key={i} className="flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                {food}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-red-400 bg-red-400/10 px-3 py-1 rounded inline-block text-sm mb-3">
            ✗ Foods to Avoid
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {dietData.foodsToAvoid?.map((food, i) => (
              <li key={i} className="flex items-start">
                <span className="text-red-400 mr-2">•</span>
                {food}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Fruits</h4>
          <p className="text-sm text-slate-200">{dietData.recommendedFruits?.join(', ')}</p>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Vegetables</h4>
          <p className="text-sm text-slate-200">{dietData.recommendedVegetables?.join(', ')}</p>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Drinks</h4>
          <p className="text-sm text-slate-200">{dietData.recommendedDrinks?.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

export default DietCard;
