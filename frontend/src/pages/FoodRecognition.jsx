import { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import foodAnalysisService from '../services/foodAnalysisService';

const FoodRecognition = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const data = await foodAnalysisService.uploadAndAnalyzeFood(formData);
      toast.success('Food analyzed successfully!');
      navigate(`/food-result/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze food image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">AI Food Scanner</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Take a photo or upload an image of your food. Our Gemini Vision AI will analyze it against your current predicted disease and prescribed medicines to tell you if it's safe to eat!
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="bg-slate-800 group-hover:bg-emerald-500/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Food Image</h3>
            <p className="text-slate-400 mb-6 text-sm">JPG, PNG, WEBP (Max 10MB)</p>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors">
              Browse Files
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black max-h-[60vh] flex items-center justify-center">
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[60vh] object-contain" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button 
                onClick={handleCancel}
                disabled={isUploading}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 disabled:opacity-50"
              >
                Choose Different Image
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Food with AI...
                  </>
                ) : (
                  <>
                    Analyze Food
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecognition;
