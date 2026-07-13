import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, AlertCircle, Phone, Clock, Star, Store, Map as MapIcon, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

// Fix leaflet default icons for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons
const createDivIcon = (color, svgPath) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
         </div>`,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const userIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  className: 'user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const crossSvg = '<path d="M12 2v20M2 12h20"/>';
const starSvg = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';

// 🟢 Generic (Green), 🔵 Branded (Blue), ⚪ Independent (Gray)
const genericIcon = createDivIcon('#10b981', starSvg); 
const brandedIcon = createDivIcon('#3b82f6', crossSvg);
const independentIcon = createDivIcon('#64748b', crossSvg);

const getMarkerIcon = (category) => {
  if (category === 'Generic') return genericIcon;
  if (category === 'Branded') return brandedIcon;
  return independentIcon;
};

// Helper component to center map on user
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 14);
    }
  }, [location, map]);
  return null;
};

const PharmacyLocator = () => {
  const [locationState, setLocationState] = useState({ lat: null, lng: null, name: 'Locating...' });
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('All'); // All, Generic, Branded
  const [radius, setRadius] = useState(5000); // 5km default
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Recommendations
  const [recommendation, setRecommendation] = useState(null);

  // Helper to fetch prescription history and try to find a prescription address
  const tryGetPrescriptionAddress = async () => {
    try {
      const res = await api.get('/api/prescription/history');
      const history = res.data.data;
      if (history && history.length > 0) {
        // Find the most recent completed prescription
        const latest = history.find(p => p.status === 'completed');
        if (latest) {
          return latest._id;
        }
      }
    } catch (e) {
      console.warn("Could not fetch prescription history for location fallback", e);
    }
    return null;
  };

  const fetchPharmacies = async (lat, lng, rad = radius) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/pharmacy/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
      const fetchedPharmacies = response.data.data;
      setPharmacies(fetchedPharmacies);

      // Smart Recommendation Logic: Find best generic option
      const generics = fetchedPharmacies.filter(p => p.category === 'Generic');
      if (generics.length > 0) {
        // Nearest Generic
        const best = generics[0];
        setRecommendation({
          pharmacy: best,
          savings: Math.floor(Math.random() * 400) + 100, // Simulated savings for demo
          reason: "Provides generic alternatives for your prescribed medicines."
        });
      } else {
        setRecommendation(null);
      }
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      toast.error('Failed to find nearby pharmacies.');
    } finally {
      setLoading(false);
    }
  };

  const initiateLocationFlow = () => {
    setLoading(true);
    setError(null);
    setLocationState({ lat: null, lng: null, name: 'Attempting GPS location...' });
    
    if (!navigator.geolocation) {
      fallbackToPrescriptionAddress();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationState({ lat: latitude, lng: longitude, name: 'Current Location' });
        fetchPharmacies(latitude, longitude);
      },
      (err) => {
        console.warn(`GPS failed: ${err.message}. Falling back to Prescription Address.`);
        toast.info("GPS blocked/failed. Trying prescription address...");
        fallbackToPrescriptionAddress();
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
    );
  };

  const fallbackToPrescriptionAddress = async () => {
    setLocationState(prev => ({ ...prev, name: 'Extracting address from prescription...' }));
    const prescriptionId = await tryGetPrescriptionAddress();
    
    if (prescriptionId) {
      try {
        const geoRes = await api.post('/api/pharmacy/geocode', { prescriptionId });
        if (geoRes.data.success) {
          const { lat, lng, displayName, originalAddress } = geoRes.data.data;
          toast.success(`Found address: ${originalAddress}`);
          setLocationState({ lat, lng, name: `Clinic: ${originalAddress}` });
          fetchPharmacies(lat, lng);
          return;
        }
      } catch (err) {
        console.warn("Geocoding prescription failed", err);
      }
    }
    
    // Final Fallback: Manual search or Default City
    toast.warning("Could not auto-detect location. Defaulting to Central Delhi.");
    setLocationState({ lat: 28.6139, lng: 77.2090, name: 'Default: New Delhi (Manual Search Needed)' });
    fetchPharmacies(28.6139, 77.2090);
  };

  useEffect(() => {
    initiateLocationFlow();
  }, []);

  // Filter effect when radius changes
  useEffect(() => {
    if (locationState.lat) {
      fetchPharmacies(locationState.lat, locationState.lng, radius);
    }
  }, [radius]);

  const getDirectionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Apply Frontend Filters
  const displayedPharmacies = pharmacies.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (openNowOnly && !p.isOpenNow) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Store className="w-8 h-8 mr-3 text-indigo-500" />
            Smart Pharmacy Locator
          </h1>
          <p className="text-slate-400 mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-slate-500" />
            {locationState.name}
          </p>
        </div>
        
        <button
          onClick={initiateLocationFlow}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
          ) : (
            <Crosshair className="w-4 h-4 mr-2 text-indigo-400" />
          )}
          Locate Me
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Filters & List */}
        <div className="flex flex-col gap-4 overflow-hidden h-full">
          {/* Filter Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shrink-0 shadow-lg">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Search className="w-4 h-4 mr-2 text-slate-400" />
              Filters
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select 
                value={radius} 
                onChange={e => setRadius(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg block w-full p-2"
              >
                <option value={2000}>2 KM Radius</option>
                <option value={5000}>5 KM Radius</option>
                <option value={10000}>10 KM Radius</option>
                <option value={15000}>15 KM Radius</option>
              </select>
              
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg block w-full p-2"
              >
                <option value="All">All Categories</option>
                <option value="Generic">Generic Stores</option>
                <option value="Branded">Branded Chains</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={openNowOnly} 
                onChange={e => setOpenNowOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-slate-800"
              />
              <span>Open Now</span>
            </label>
          </div>

          {/* Pharmacy List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            
            {recommendation && (
              <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-xl p-4 shadow-lg shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Star className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wide uppercase">Smart Recommendation</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{recommendation.pharmacy.name}</h3>
                <p className="text-emerald-300/80 text-sm mb-3">{recommendation.reason}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-slate-400">Est. Savings</div>
                    <div className="text-2xl font-bold text-emerald-400">₹{recommendation.savings}</div>
                  </div>
                  <a 
                    href={getDirectionsUrl(recommendation.pharmacy.lat, recommendation.pharmacy.lon)}
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-emerald-900/50"
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Navigate
                  </a>
                </div>
              </div>
            )}

            {displayedPharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{pharmacy.name}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        pharmacy.category === 'Generic' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        pharmacy.category === 'Branded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {pharmacy.category}
                      </span>
                      <span className="flex items-center text-xs text-amber-400">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {pharmacy.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-400">{(pharmacy.distanceMeters / 1000).toFixed(1)} km</div>
                    <div className="text-xs text-slate-500">{Math.round(pharmacy.distanceMeters / 1000 * 3)} min drive</div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-3 line-clamp-2">{pharmacy.address}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center text-sm">
                    {pharmacy.isOpenNow ? (
                      <span className="text-emerald-400 flex items-center"><Clock className="w-4 h-4 mr-1"/> Open Now</span>
                    ) : (
                      <span className="text-rose-400 flex items-center"><Clock className="w-4 h-4 mr-1"/> Closed</span>
                    )}
                  </div>
                  
                  <a 
                    href={getDirectionsUrl(pharmacy.lat, pharmacy.lon)}
                    target="_blank" rel="noopener noreferrer"
                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
            
            {displayedPharmacies.length === 0 && !loading && (
              <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-xl">
                <MapIcon className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 font-medium">No pharmacies found.</p>
                <p className="text-sm text-slate-500 mt-1">Try expanding the search radius.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative z-0 h-[400px] lg:h-full">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-indigo-400 font-medium animate-pulse">Scanning area...</p>
            </div>
          )}

          {locationState.lat ? (
            <MapContainer 
              center={[locationState.lat, locationState.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              <RecenterMap location={[locationState.lat, locationState.lng]} />
              
              <Marker position={[locationState.lat, locationState.lng]} icon={userIcon}>
                <Popup><div className="font-bold">{locationState.name}</div></Popup>
              </Marker>

              {displayedPharmacies.map(pharmacy => (
                <Marker 
                  key={pharmacy.id} 
                  position={[pharmacy.lat, pharmacy.lon]}
                  icon={getMarkerIcon(pharmacy.category)}
                >
                  <Popup className="pharmacy-popup">
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-slate-900 mb-1">{pharmacy.name}</h3>
                      <p className="text-xs text-slate-600 mb-2">{pharmacy.address}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-bold text-indigo-600">{(pharmacy.distanceMeters / 1000).toFixed(1)} km</span>
                        <a 
                          href={getDirectionsUrl(pharmacy.lat, pharmacy.lon)}
                          target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
                        >
                          Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <p className="text-slate-500">Waiting for location...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PharmacyLocator;
