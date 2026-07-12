const ConfidenceIndicator = ({ confidenceStr }) => {
  // Try to extract percentage if it exists like "High (90%)" or parse text
  let level = 'Medium';
  let color = 'bg-yellow-500';
  let percentage = 70;

  const textLower = confidenceStr?.toLowerCase() || '';
  if (textLower.includes('high')) {
    level = 'High';
    color = 'bg-emerald-500';
    percentage = 90;
  } else if (textLower.includes('low')) {
    level = 'Low';
    color = 'bg-red-500';
    percentage = 40;
  }

  const match = textLower.match(/(\d+)%/);
  if (match) {
    percentage = parseInt(match[1], 10);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Confidence
        </h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full bg-opacity-20 ${color.replace('bg-', 'text-')} ${color.replace('bg-', 'bg-')} text-white`}>
          {confidenceStr}
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-xs text-slate-500 mt-3 italic">
        *Confidence indicates the AI's certainty based on provided medicine data and symptoms.
      </p>
    </div>
  );
};

export default ConfidenceIndicator;
