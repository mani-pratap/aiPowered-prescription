import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import OCRResultCard from '../components/prescription/OCRResultCard';

const OCRResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await api.get(`/prescription/${id}`);
        setPrescription(response.data.data);
      } catch (error) {
        toast.error("Failed to load prescription data.");
        navigate('/upload');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/prescription/${id}`);
      toast.success("Prescription deleted.");
      navigate('/history');
    } catch (error) {
      toast.error("Failed to delete prescription.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!prescription) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/upload" 
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Upload
        </Link>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Original Document
            </h3>
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-black">
              {prescription.imageUrl !== 'pending' ? (
                <img 
                  src={prescription.imageUrl} 
                  alt="Prescription" 
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  Image processing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Data */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 pb-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Extracted Analysis</h2>
              <p className="text-slate-400 mt-1">Structured data retrieved by AI OCR engine</p>
            </div>
            <OCRResultCard data={prescription.structuredData} />

            {/* Added Raw OCR Display so user can see what Tesseract extracted */}
            <div className="mt-8 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-2">Raw Tesseract Output</h3>
              <p className="text-sm text-slate-400 mb-4">
                This is the exact raw text that Tesseract.js extracted from the image. Because it is handwriting, it may look like gibberish. Our Regex parser attempted to find structured keywords within this text.
              </p>
              <pre className="whitespace-pre-wrap text-slate-300 text-sm font-mono bg-black/50 p-4 rounded-xl border border-white/10 overflow-x-auto">
                {prescription.rawOcrText || "No text could be extracted."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRResult;
