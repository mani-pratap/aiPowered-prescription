import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const UploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/prescription/history');
      setHistory(response.data.data);
    } catch (error) {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Delete this record?")) return;
    
    try {
      await api.delete(`/prescription/${id}`);
      toast.success("Record deleted.");
      fetchHistory(); // Refresh list
    } catch (error) {
      toast.error("Deletion failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Upload History</h1>
          <p className="text-slate-400 mt-2">View and manage your previously analyzed prescriptions.</p>
        </div>
        <Link 
          to="/upload"
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
        >
          <FileText className="w-5 h-5 mr-2" />
          New Upload
        </Link>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((record) => (
            <Link 
              key={record._id}
              to={`/prescription/${record._id}`}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/20">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {record.structuredData?.doctor?.name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {record.structuredData?.doctor?.hospital || 'Unknown Clinic'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border
                  ${record.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    record.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'}`}
                >
                  {record.status}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-slate-500 mb-6 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(record.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-indigo-400 font-medium">
                <div className="flex items-center group-hover:translate-x-1 transition-transform">
                  View Results
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
                
                <button 
                  onClick={(e) => handleDelete(e, record._id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
          <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No prescriptions yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Upload your first prescription to let our AI assistant analyze and extract the medical data.
          </p>
          <Link 
            to="/upload"
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
          >
            Upload Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
