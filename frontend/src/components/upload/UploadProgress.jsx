import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadProgress = ({ status, progress = 0 }) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-6 text-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {status === 'uploading' ? 'Uploading Prescription...' : 'Analyzing with AI...'}
        </h3>
        <p className="text-slate-400 text-sm">
          {status === 'uploading' 
            ? 'Securely transferring your image to our servers' 
            : 'Extracting medical data using advanced OCR'}
        </p>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: status === 'uploading' ? '50%' : '90%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
