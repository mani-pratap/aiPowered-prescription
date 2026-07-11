import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CameraCapture = ({ onImageCapture, onCancel }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = async () => {
    // Convert base64 to File object
    const res = await fetch(imgSrc);
    const blob = await res.blob();
    const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
    onImageCapture(file);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Use back camera on mobile if available
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Camera className="w-5 h-5 mr-2 text-indigo-400" />
          Capture Prescription
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative bg-black aspect-video flex items-center justify-center">
        {imgSrc ? (
          <img src={imgSrc} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="p-6 bg-slate-900 flex justify-center space-x-6">
        {imgSrc ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retake}
              className="flex items-center px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retake
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirm}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              <Check className="w-5 h-5 mr-2" />
              Use Photo
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={capture}
            className="flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-slate-400 shadow-xl hover:bg-slate-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-indigo-600"></div>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
