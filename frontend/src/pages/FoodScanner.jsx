import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Upload, Apple, AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const FoodScanner = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('foodScanHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset previous result
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/food/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const analysisData = response.data.data;
      setResult(analysisData);

      setHistory(prev => {
        const newHistory = [{
          id: Date.now(),
          timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
          ...analysisData
        }, ...prev].slice(0, 10); // keep last 10
        localStorage.setItem('foodScanHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to analyze food.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
  };

  const getVerdictStyle = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'eat':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'avoid':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'moderation':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'eat':
        return <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />;
      case 'avoid':
        return <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />;
      case 'moderation':
        return <Info className="w-8 h-8 text-amber-400 mb-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Apple className="w-8 h-8 mr-3 text-pink-400" />
          AI Food Scanner
        </h1>
      </div>

      <div className="text-center mb-10 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Not sure if you should eat that? Upload a picture of your food and our AI will cross-reference it with your active medical prescriptions to ensure it's safe for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
          {!previewUrl ? (
            <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="food-upload"
              />
              <Camera className="w-12 h-12 text-slate-500 mb-4" />
              <p className="text-lg font-medium text-slate-300">Take a photo or upload</p>
              <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          ) : (
            <div className="w-full h-80 relative rounded-2xl overflow-hidden border border-slate-700 mb-6">
              <img src={previewUrl} alt="Food preview" className="w-full h-full object-cover" />
            </div>
          )}

          {previewUrl && !result && (
            <div className="flex space-x-4 mt-auto w-full">
              <button
                onClick={resetScanner}
                disabled={analyzing}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center shadow-lg shadow-pink-500/25"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Analyze Food
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Analysis Results</h2>
          
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Apple className="w-16 h-16 opacity-20 mb-4" />
              <p>Upload a food image to see your personalized dietary safety analysis.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Identified Food</p>
                <p className="text-lg font-bold text-white">{result.foodIdentified}</p>
              </div>

              <div className={`p-6 rounded-2xl border flex flex-col items-center text-center ${getVerdictStyle(result.verdict)}`}>
                {getVerdictIcon(result.verdict)}
                <h3 className="text-2xl font-black mb-1">{result.verdict.toUpperCase()}</h3>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center mb-4">
                  <Info className="w-5 h-5 text-indigo-400 mr-2" />
                  <h4 className="font-bold text-white text-lg">Medical Reasoning</h4>
                </div>
                <ul className="space-y-3 text-slate-300 text-sm">
                  {Array.isArray(result.reasoning) ? (
                    result.reasoning.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-indigo-500 mr-2 mt-0.5">•</span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))
                  ) : (
                    <li className="leading-relaxed">{result.reasoning}</li>
                  )}
                </ul>
              </div>

              <button
                onClick={resetScanner}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25 mt-auto"
              >
                Scan Another Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && !result && !previewUrl && (
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Recent Scans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div key={item.id} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setResult(item)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{item.foodIdentified}</h3>
                    <p className="text-xs text-slate-400">{item.timestamp}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                    item.verdict?.toLowerCase() === 'eat' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.verdict?.toLowerCase() === 'avoid' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.verdict?.toUpperCase()}
                  </div>
                </div>
                <p className="text-slate-300 text-sm line-clamp-2">
                  {Array.isArray(item.reasoning) ? item.reasoning[0] : item.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodScanner;
