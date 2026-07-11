import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload as UploadIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

import ImageUploader from '../components/upload/ImageUploader';
import CameraCapture from '../components/upload/CameraCapture';
import UploadProgress from '../components/upload/UploadProgress';

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, error
  const navigate = useNavigate();

  const handleImageSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setIsCameraOpen(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select or capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setStatus('uploading');
      
      const response = await api.post('/prescription/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          // Simulate transition to processing once upload completes
          if (progressEvent.loaded === progressEvent.total) {
            setStatus('processing');
          }
        }
      });

      if (response.data.success) {
        toast.success("Prescription analyzed successfully!");
        navigate(`/prescription/${response.data.data.prescriptionId}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      toast.error(error.response?.data?.message || "Failed to process prescription.");
    }
  };

  if (status === 'uploading' || status === 'processing') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <UploadProgress status={status} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Upload Prescription</h1>
        <p className="text-slate-400 text-lg">
          Upload or capture a photo of your prescription to let AI extract the details.
        </p>
      </div>

      {isCameraOpen ? (
        <CameraCapture 
          onImageCapture={handleCameraCapture} 
          onCancel={() => setIsCameraOpen(false)} 
        />
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          
          <div className="mb-8">
            <ImageUploader onImageSelect={handleImageSelect} />
          </div>

          {!file && (
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-slate-700 flex-1"></div>
              <span className="px-4 text-slate-500 font-medium">OR</span>
              <div className="h-px bg-slate-700 flex-1"></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!file && (
              <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </button>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl font-medium transition-all shadow-lg
                ${file 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 transform hover:-translate-y-1' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              Analyze Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;
