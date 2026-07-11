const DiseaseCard = ({ analysisData }) => {
  if (!analysisData) return null;
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Predicted Condition
        </h3>
      </div>
      
      <div className="flex-grow">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          {analysisData.predictedDisease}
        </h2>
        
        <div className="mt-4">
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-1">Reasoning</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{analysisData.reason}</p>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">Common Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {analysisData.symptoms?.map((symptom, idx) => (
              <span key={idx} className="bg-slate-800 text-indigo-300 px-3 py-1 rounded-full text-xs border border-slate-700">
                {symptom}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">Medicine Relationship</h4>
          <ul className="space-y-3">
            {analysisData.medicineRelationship?.map((rel, idx) => (
              <li key={idx} className="bg-slate-800/50 p-3 rounded-lg text-sm border border-slate-700/50">
                <span className="font-bold text-slate-200 block mb-1">{rel.medicineName}</span>
                <span className="text-slate-400">{rel.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;
