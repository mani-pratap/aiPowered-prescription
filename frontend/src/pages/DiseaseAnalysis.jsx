import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import diseaseAnalysisService from '../services/diseaseAnalysisService';
import DiseaseCard from '../components/analysis/DiseaseCard';
import VisualEducation from '../components/analysis/VisualEducation';
import ConfidenceIndicator from '../components/analysis/ConfidenceIndicator';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const DiseaseAnalysis = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
        // Not generated yet
        setAnalysisData(null);
      } else {
        toast.error('Failed to load analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await diseaseAnalysisService.generateAnalysis(prescriptionId);
      setAnalysisData(data);
      toast.success('Analysis generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate analysis');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `Disease_Analysis_${prescriptionId}.pdf`,
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
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12">
          <svg className="w-20 h-20 text-indigo-500/50 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">AI Disease Prediction</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Our AI can analyze your prescription and prescribed medicines to predict the likely medical condition, explain the treatment, and offer customized recommendations.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center mx-auto"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Prescription...
              </>
            ) : (
              'Generate Analysis Report'
            )}
          </button>
          <div className="mt-8">
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-300">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure current language data exists, fallback to first if not
  let activeView = analysisData.analyses?.find(a => a.language === currentLanguage);
  if (!activeView && analysisData.analyses?.length > 0) {
    activeView = analysisData.analyses[0];
  }

  if (!activeView) {
    return <div className="text-center py-10 text-red-500">Error: No analysis data found in response.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-100">Analysis Dashboard</h1>
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
          className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow"
        >
          Disease Prediction
        </Link>
        <Link 
          to={`/disease-analysis/${prescriptionId}/diet`} 
          className="flex-1 text-center py-2 text-slate-400 hover:text-slate-200 rounded-md text-sm font-medium transition-colors"
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

      {/* Report Container (Target for PDF) */}
      <div ref={reportRef} className="bg-slate-950 p-2 sm:p-4 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DiseaseCard analysisData={activeView} />
          </div>
          <div className="lg:col-span-1">
            <ConfidenceIndicator confidenceStr={activeView.confidence} />
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Recovery Advice
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {activeView.recoveryAdvice}
              </p>
            </div>
          </div>
        </div>
        
        {/* Visual Disease Education Section */}
        <VisualEducation predictedDisease={activeView.predictedDisease} />

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

export default DiseaseAnalysis;
