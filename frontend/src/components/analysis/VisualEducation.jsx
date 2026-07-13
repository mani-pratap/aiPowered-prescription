import React, { useMemo, useState, useEffect } from 'react';
import { 
  Activity, Droplets, HeartPulse, Shield, ShieldAlert,
  Thermometer, User, Wind, CheckCircle, Apple, Bike, Stethoscope, Info, Globe, Search
} from 'lucide-react';
import axios from 'axios';

const ASSET_LIBRARY = {
  general: [
    {
      id: 'g2',
      title: 'Medication Adherence',
      imageUrl: '/education/general.png',
      icon: <Stethoscope className="w-16 h-16 text-indigo-400" />,
      color: 'from-indigo-900/40 to-indigo-800/10 border-indigo-500/30',
      description: 'Follow your doctor\'s prescription exactly as directed.',
      category: 'Recovery'
    },
    {
      id: 'g3',
      title: 'Healthy Lifestyle',
      imageUrl: '/education/general.png',
      icon: <CheckCircle className="w-16 h-16 text-emerald-400" />,
      color: 'from-emerald-900/40 to-emerald-800/10 border-emerald-500/30',
      description: 'Maintain good sleep, diet, and stress management.',
      category: 'Lifestyle'
    }
  ]
};

const VisualEducation = ({ predictedDisease }) => {
  const [wikiData, setWikiData] = useState({ image: null, summary: null, title: null, loading: true });

  useEffect(() => {
    const fetchRealImage = async () => {
      if (!predictedDisease) return;
      
      try {
        setWikiData(prev => ({ ...prev, loading: true }));
        // 1. Search Wikipedia for the best matching article title
        const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(predictedDisease)}&utf8=&format=json&origin=*`);
        
        if (searchRes.data.query.search.length > 0) {
          const bestTitle = searchRes.data.query.search[0].title;
          
          // 2. Fetch the summary and thumbnail for that exact article
          const summaryRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`);
          
          setWikiData({
            title: summaryRes.data.title,
            summary: summaryRes.data.extract,
            image: summaryRes.data.thumbnail?.source || null, // Might not have an image
            loading: false
          });
        } else {
          setWikiData({ image: null, summary: null, title: null, loading: false });
        }
      } catch (err) {
        console.error("Failed to fetch Wikipedia data:", err);
        setWikiData({ image: null, summary: null, title: null, loading: false });
      }
    };

    fetchRealImage();
  }, [predictedDisease]);

  const visuals = ASSET_LIBRARY.general;

  return (
    <div className="mt-8 mb-4">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-slate-100">Visual Disease Education</h2>
      </div>
      
      <p className="text-slate-400 mb-6 text-sm max-w-2xl">
        Real-world medical reference and lifestyle adjustments for your predicted condition.
      </p>

      {/* Swipeable Carousel */}
      <div className="flex overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory custom-scrollbar">
        
        {/* Dynamic Wikipedia Card (First Card) */}
        <div className={`min-w-[280px] sm:min-w-[350px] max-w-[400px] snap-center shrink-0 bg-slate-900 border border-slate-700/50 rounded-2xl p-0 shadow-xl relative overflow-hidden transition-transform hover:-translate-y-1 flex flex-col`}>
          
          <div className="w-full h-48 bg-slate-950 border-b border-slate-800 flex items-center justify-center relative overflow-hidden">
            {wikiData.loading ? (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <Search className="w-8 h-8 animate-pulse mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Searching Medical Database...</span>
              </div>
            ) : wikiData.image ? (
              <img 
                src={wikiData.image} 
                alt={wikiData.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-xs uppercase tracking-widest">No Verified Image Found</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold text-slate-200 border border-slate-700 shadow-lg">
              Condition Overview
            </div>
            {!wikiData.loading && wikiData.image && (
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white/70">
                Source: Wikipedia
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col p-6 relative">
            <h3 className="text-xl font-bold text-white mb-2">{wikiData.loading ? 'Loading...' : (wikiData.title || predictedDisease)}</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium line-clamp-4">
              {wikiData.loading 
                ? 'Fetching verified medical overview...' 
                : (wikiData.summary || 'No encyclopedia summary available for this specific condition.')}
            </p>
          </div>
        </div>

        {/* Static Lifestyle Cards */}
        {visuals.map((visual) => (
          <div 
            key={visual.id}
            className={`min-w-[280px] sm:min-w-[320px] snap-center shrink-0 bg-gradient-to-br ${visual.color} border rounded-2xl p-0 shadow-xl relative overflow-hidden transition-transform hover:-translate-y-1 flex flex-col`}
          >
            <div className="w-full h-48 bg-slate-900 border-b border-slate-700/50 overflow-hidden relative">
              <img 
                src={visual.imageUrl} 
                alt={visual.title} 
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold text-slate-200 border border-slate-700 shadow-lg">
                {visual.category}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
              <div className="absolute -top-6 bg-slate-900 rounded-full shadow-lg border border-slate-700/50 p-2">
                {visual.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 mt-4">{visual.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {visual.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-2 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 italic flex items-start">
        <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-slate-600" />
        <p>This information and associated imagery is fetched dynamically from external sources for educational reference. Please consult a qualified healthcare professional for diagnosis and treatment.</p>
      </div>
    </div>
  );
};

export default VisualEducation;
