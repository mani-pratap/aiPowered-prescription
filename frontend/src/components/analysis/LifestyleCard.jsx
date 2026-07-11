const LifestyleCard = ({ lifestyleData }) => {
  if (!lifestyleData) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center border-b border-slate-800 pb-4">
        <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lifestyle & Recovery
      </h3>
      
      <div className="space-y-5 flex-grow">
        <div>
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-1">Daily Routine</h4>
          <p className="text-slate-300 text-sm">{lifestyleData.dailyRoutine}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Exercise</h4>
            <p className="text-sm text-slate-200">{lifestyleData.exerciseSuggestions}</p>
          </div>
          <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Hydration</h4>
            <p className="text-sm text-slate-200">{lifestyleData.waterIntake}</p>
          </div>
        </div>
        
        <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
          <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">Sleep</h4>
          <p className="text-sm text-slate-200">{lifestyleData.sleepRecommendation}</p>
        </div>
        
        <div>
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">Home Care Tips</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            {lifestyleData.homeCareTips?.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">General Wellness</h4>
        <p className="text-sm text-slate-400 italic">{lifestyleData.generalWellness}</p>
      </div>
    </div>
  );
};

export default LifestyleCard;
