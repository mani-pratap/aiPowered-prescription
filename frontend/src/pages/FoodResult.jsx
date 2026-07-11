import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Leaf, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import foodAnalysisService from '../services/foodAnalysisService';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const FoodResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await foodAnalysisService.getFoodAnalysisDetails(id);
        setAnalysis(data);
      } catch (error) {
        toast.error('Failed to load food analysis');
        navigate('/food-history');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!analysis) return null;

  // Render Recommendation Icon/Color
  let recIcon, recColor, recBg;
  if (analysis.recommendation === 'Eat') {
    recIcon = <CheckCircle className="w-8 h-8 text-emerald-500" />;
    recColor = 'text-emerald-500';
    recBg = 'bg-emerald-500/10 border-emerald-500/30';
  } else if (analysis.recommendation === 'Eat in Moderation') {
    recIcon = <AlertTriangle className="w-8 h-8 text-amber-500" />;
    recColor = 'text-amber-500';
    recBg = 'bg-amber-500/10 border-amber-500/30';
  } else {
    recIcon = <XCircle className="w-8 h-8 text-rose-500" />;
    recColor = 'text-rose-500';
    recBg = 'bg-rose-500/10 border-rose-500/30';
  }

  // Get localized tip
  const tipKey = currentLanguage.toLowerCase();
  const localizedTip = analysis.tips?.[tipKey] || analysis.tips?.english || 'No tip available.';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Food Analysis Result</h1>
        </div>
        <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Image */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24">
            <div className="rounded-2xl overflow-hidden bg-black mb-6">
              <img src={analysis.imageUrl} alt={analysis.foodName} className="w-full h-auto max-h-[50vh] object-contain" />
            </div>
            
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-2">{analysis.foodName}</h2>
              <div className="inline-flex items-center px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-semibold mb-4">
                <Leaf className="w-4 h-4 mr-2 text-emerald-400" />
                {analysis.foodCategory}
              </div>
              <p className="text-sm text-slate-500">AI Confidence: {analysis.confidence}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recommendation Card */}
          <div className={`border rounded-3xl p-8 ${recBg}`}>
            <div className="flex items-center mb-4">
              {recIcon}
              <h3 className={`text-2xl font-bold ml-3 ${recColor}`}>
                {analysis.recommendation}
              </h3>
            </div>
            <p className="text-lg text-slate-200 leading-relaxed mb-6">
              {analysis.reason}
            </p>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
              <p className="text-sm font-semibold text-slate-400 mb-1">Nutrition Tip ({currentLanguage})</p>
              <p className="text-slate-300 italic">"{localizedTip}"</p>
            </div>
          </div>

          {/* Medicine Interaction */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <ShieldAlert className="w-6 h-6 mr-2 text-rose-400" />
              Medicine Interactions
            </h3>
            {analysis.medicineInteraction && analysis.medicineInteraction.toLowerCase() !== 'none found' ? (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-200 leading-relaxed">
                {analysis.medicineInteraction}
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 font-medium">
                No negative interactions found with your current prescribed medicines.
              </div>
            )}
          </div>

          {/* Alternatives */}
          {analysis.healthierAlternatives && analysis.healthierAlternatives.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Leaf className="w-6 h-6 mr-2 text-emerald-400" />
                Healthier Alternatives
              </h3>
              <ul className="space-y-3">
                {analysis.healthierAlternatives.map((alt, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <Link 
              to="/food-scanner"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Scan Another Food
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodResult;
