import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import diseaseAnalysisService from '../services/diseaseAnalysisService';
import DietCard from '../components/analysis/DietCard';
import LifestyleCard from '../components/analysis/LifestyleCard';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const DietRecommendation = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const reportRef = useRef();

  useEffect(() => {
    fetchAnalysis();
  }, [prescriptionId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const data = await diseaseAnalysisService.getAnalysis(prescriptionId);
      setAnalysisData(data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Analysis not found. Please generate it first.');
        navigate(`/disease-analysis/${prescriptionId}`);
      } else {
        toast.error('Failed to load diet recommendation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `Diet_Lifestyle_${prescriptionId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center items-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading diet plan...</p>
        </div>
      </div>
    );
  }

  let activeView = analysisData?.analyses?.find(a => a.language === currentLanguage);
  if (!activeView && analysisData?.analyses?.length > 0) {
    activeView = analysisData.analyses[0];
  }

  if (!activeView) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-100">Nutrition & Lifestyle</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
          
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 mb-8 max-w-lg">
        <Link 
          to={`/disease-analysis/${prescriptionId}`} 
          className="flex-1 text-center py-2 text-slate-400 hover:text-slate-200 rounded-md text-sm font-medium transition-colors"
        >
          Disease Prediction
        </Link>
        <Link 
          to={`/disease-analysis/${prescriptionId}/diet`} 
          className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow"
        >
          Diet & Lifestyle
        </Link>
        <Link 
          to={`/disease-analysis/${prescriptionId}/generics`} 
          className="flex-1 text-center py-2 text-slate-400 hover:text-slate-200 rounded-md text-sm font-medium transition-colors"
        >
          Generic Alternatives
        </Link>
      </div>

      {/* Report Container */}
      <div ref={reportRef} className="bg-slate-950 p-2 sm:p-4 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DietCard dietData={activeView.dietRecommendation} />
          <LifestyleCard lifestyleData={activeView.lifestyleRecommendation} />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800/50 p-4 rounded-lg">
          <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-semibold mb-2">Important Disclaimer</p>
          <p className="text-sm text-slate-400 text-center italic max-w-4xl mx-auto">
            {activeView.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DietRecommendation;
