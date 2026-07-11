import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ImageUploader = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/50 group"
        >
          <img src={preview} alt="Prescription preview" className="w-full h-auto max-h-[60vh] object-contain bg-slate-900" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={clearImage}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </motion.div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'}
            ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
          `}
        >
          <input {...getInputProps()} />
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: isDragActive ? -10 : 0 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
              <UploadCloud className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xl font-medium text-white mb-2">
                {isDragActive ? "Drop the prescription here..." : "Drag & drop your prescription"}
              </p>
              <p className="text-sm text-slate-400">
                or click to browse from your device
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-4">
              <ImageIcon className="w-4 h-4" />
              <span>Supports JPG, PNG, WEBP (Max 5MB)</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
