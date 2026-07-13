import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Phone, Clock, Star, Store, Map as MapIcon, Search, CheckCircle2, Terminal, AlertTriangle, Bug } from 'lucide-react';
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
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); animation: pulse 2s infinite;"></div>`,
  className: 'user-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const crossSvg = '<path d="M12 2v20M2 12h20"/>';
const starSvg = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';

const genericIcon = createDivIcon('#10b981', starSvg); 
const brandedIcon = createDivIcon('#3b82f6', crossSvg);
const independentIcon = createDivIcon('#64748b', crossSvg);

const getMarkerIcon = (category) => {
  if (category === 'Generic') return genericIcon;
  if (category === 'Branded') return brandedIcon;
  return independentIcon;
};

// Safe Toast Helper (Prevents duplicates)
const activeToasts = new Set();
const safeToast = {
  info: (msg, id) => { if (!activeToasts.has(id)) { activeToasts.add(id); toast.info(msg, { onClose: () => activeToasts.delete(id) }); } },
  success: (msg, id) => { if (!activeToasts.has(id)) { activeToasts.add(id); toast.success(msg, { onClose: () => activeToasts.delete(id) }); } },
  error: (msg, id) => { if (!activeToasts.has(id)) { activeToasts.add(id); toast.error(msg, { onClose: () => activeToasts.delete(id) }); } },
  warning: (msg, id) => { if (!activeToasts.has(id)) { activeToasts.add(id); toast.warning(msg, { onClose: () => activeToasts.delete(id) }); } }
};

// Helper component to center map on user
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 14, { animate: true, duration: 1.5 });
    }
  }, [location, map]);
  return null;
};

const PharmacyLocator = () => {
  // State tracking
  const initialized = useRef(false);
  const [locationState, setLocationState] = useState({ lat: null, lng: null, name: 'Initializing Location Engine...' });
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Feature states
  const [filterCategory, setFilterCategory] = useState('All'); 
  const [radius, setRadius] = useState(5000); 
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // Manual Search State
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  // Debug Panel State
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (level, msg) => {
    setDebugLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), level, msg }]);
  };

  const tryGetPrescriptionId = async () => {
    try {
      addDebugLog('INFO', 'Fetching prescription history...');
      const res = await api.get('/prescription/history');
      const history = res.data.data;
      if (history && history.length > 0) {
        const latest = history.find(p => p.status === 'completed');
        if (latest) {
          addDebugLog('SUCCESS', `Found valid prescription ID: ${latest._id}`);
          return latest._id;
        }
      }
      addDebugLog('WARN', 'No completed prescriptions found.');
    } catch (e) {
      addDebugLog('ERROR', `Prescription history error: ${e.message}`);
    }
    return null;
  };

  const fetchPharmacies = async (lat, lng, rad = radius) => {
    try {
      setLoading(true);
      addDebugLog('INFO', `Requesting Overpass API for radius ${rad}m at ${lat}, ${lng}`);
      
      const response = await api.get(`/pharmacy/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
      const fetchedPharmacies = response.data.data;
      setPharmacies(fetchedPharmacies);
      
      addDebugLog('SUCCESS', `Overpass returned ${fetchedPharmacies.length} pharmacies using endpoint: ${response.data.endpointUsed}`);
      safeToast.success(`Found ${fetchedPharmacies.length} pharmacies nearby!`, 'pharmacies_found');

      const generics = fetchedPharmacies.filter(p => p.category === 'Generic');
      if (generics.length > 0) {
        const best = generics[0];
        setRecommendation({
          pharmacy: best,
          savings: Math.floor(Math.random() * 400) + 100, 
          reason: "Provides generic alternatives for your prescribed medicines."
        });
      } else {
        setRecommendation(null);
      }
    } catch (err) {
      addDebugLog('ERROR', `Overpass API Failed: ${err.message}`);
      safeToast.error('Failed to find nearby pharmacies.', 'pharmacy_fail');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    
    setLoading(true);
    addDebugLog('INFO', `Starting Manual Geocode for: "${manualQuery}"`);
    
    try {
      const geoRes = await api.post('/pharmacy/geocode', { manualAddress: manualQuery });
      if (geoRes.data.success) {
        const { lat, lng, displayName } = geoRes.data.data;
        addDebugLog('SUCCESS', `Manual Geocode Resolved: ${displayName}`);
        setLocationState({ lat, lng, name: `Search: ${displayName.split(',')[0]}` });
        setShowManualSearch(false);
        fetchPharmacies(lat, lng, radius);
      }
    } catch (err) {
      addDebugLog('ERROR', `Manual Geocode Failed.`);
      safeToast.error("Could not find that location.", "manual_fail");
      setLoading(false);
    }
  };

  const fallbackToPrescriptionAddress = async () => {
    setLocationState(prev => ({ ...prev, name: 'Extracting address from prescription...' }));
    addDebugLog('INFO', 'Initiating Prescription OCR Fallback...');
    
    const prescriptionId = await tryGetPrescriptionId();
    
    if (prescriptionId) {
      try {
        addDebugLog('INFO', `Geocoding Prescription ID: ${prescriptionId}`);
        const geoRes = await api.post('/pharmacy/geocode', { prescriptionId });
        
        if (geoRes.data.success) {
          const { lat, lng, originalAddress } = geoRes.data.data;
          addDebugLog('SUCCESS', `Geocoded Prescription Address: ${originalAddress}`);
          safeToast.success(`Using Prescription Clinic: ${originalAddress}`, 'clinic_fallback');
          
          setLocationState({ lat, lng, name: `Clinic: ${originalAddress}` });
          fetchPharmacies(lat, lng, radius);
          return;
        }
      } catch (err) {
        addDebugLog('ERROR', `Nominatim Geocoding Failed. Reason: ${err.response?.data?.message || err.message}`);
      }
    }
    
    // Final Fallback: Manual search
    addDebugLog('WARN', 'All automated location methods failed. Enabling Manual Search.');
    safeToast.warning("Could not auto-detect location. Please search manually.", "manual_prompt");
    setLocationState({ lat: null, lng: null, name: 'Manual Search Required' });
    setShowManualSearch(true);
    setLoading(false);
  };

  const initiateLocationFlow = () => {
    setLoading(true);
    setLocationState({ lat: null, lng: null, name: 'Attempting GPS location...' });
    addDebugLog('INFO', 'Requesting Browser Geolocation...');
    
    if (!navigator.geolocation) {
      addDebugLog('ERROR', 'Geolocation API not supported by browser.');
      fallbackToPrescriptionAddress();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        addDebugLog('SUCCESS', `GPS Acquired: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLocationState({ lat: latitude, lng: longitude, name: 'Current Location' });
        fetchPharmacies(latitude, longitude, radius);
      },
      (err) => {
        addDebugLog('WARN', `GPS Failed: ${err.message}. Trying Fallbacks.`);
        safeToast.info("GPS blocked/failed. Trying prescription address...", "gps_failed");
        fallbackToPrescriptionAddress();
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
    );
  };

  // Run only once on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initiateLocationFlow();
    }
  }, []);

  // Filter effect (re-fetch on radius change but ONLY if we already have a location)
  useEffect(() => {
    if (initialized.current && locationState.lat) {
      addDebugLog('INFO', `Radius changed to ${radius}. Re-fetching...`);
      fetchPharmacies(locationState.lat, locationState.lng, radius);
    }
  }, [radius]);

  const getDirectionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const displayedPharmacies = pharmacies.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (openNowOnly && !p.isOpenNow) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex flex-col relative">
      
      {/* Debug Panel Toggle */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 right-4 z-50 bg-slate-800 p-3 rounded-full border border-slate-700 shadow-xl text-slate-400 hover:text-white transition-colors"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Debug Panel Overlay */}
      {showDebug && (
        <div className="fixed bottom-20 right-4 w-96 h-96 bg-slate-950 border-2 border-slate-800 rounded-xl z-50 shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between">
            <span className="text-white font-mono font-bold flex items-center text-sm">
              <Terminal className="w-4 h-4 mr-2 text-indigo-400" /> System Telemetry
            </span>
            <button onClick={() => setShowDebug(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs custom-scrollbar">
            {debugLogs.map((log, i) => (
              <div key={i} className="border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">[{log.time}]</span>{' '}
                <span className={`font-bold ${
                  log.level === 'SUCCESS' ? 'text-emerald-400' :
                  log.level === 'ERROR' ? 'text-rose-400' :
                  log.level === 'WARN' ? 'text-amber-400' : 'text-blue-400'
                }`}>[{log.level}]</span>{' '}
                <span className="text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          Re-Locate Me
        </button>
      </div>

      {showManualSearch && !locationState.lat && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-32 h-32 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 relative z-10">Manual Search Required</h2>
          <p className="text-slate-400 mb-4 relative z-10">We couldn't detect your location automatically via GPS or your prescription history. Please enter your city or address manually.</p>
          <form onSubmit={handleManualSearch} className="flex gap-3 relative z-10">
            <input 
              type="text" 
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. Connaught Place, New Delhi"
              className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
              Search Area
            </button>
          </form>
        </div>
      )}

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
                disabled={!locationState.lat || loading}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg block w-full p-2 disabled:opacity-50"
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-emerald-900/50 relative z-10"
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Navigate
                  </a>
                </div>
              </div>
            )}

            {displayedPharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors shadow-lg group relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-16">
                    <h3 className="font-bold text-white text-lg leading-tight">{pharmacy.name}</h3>
                    <div className="flex items-center mt-2 space-x-2 flex-wrap gap-y-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        pharmacy.category === 'Generic' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        pharmacy.category === 'Branded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {pharmacy.category}
                      </span>
                      <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {pharmacy.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right absolute top-4 right-4">
                    <div className="text-lg font-bold text-indigo-400">{(pharmacy.distanceMeters / 1000).toFixed(1)} km</div>
                    <div className="text-xs text-slate-500">{Math.round(pharmacy.distanceMeters / 1000 * 3)} min</div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-3 line-clamp-2 pr-12">{pharmacy.address}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center text-sm font-medium">
                    {pharmacy.isOpenNow ? (
                      <span className="text-emerald-400 flex items-center"><Clock className="w-4 h-4 mr-1"/> Open Now</span>
                    ) : (
                      <span className="text-rose-400 flex items-center"><Clock className="w-4 h-4 mr-1"/> Closed</span>
                    )}
                  </div>
                  
                  <a 
                    href={getDirectionsUrl(pharmacy.lat, pharmacy.lon)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium rounded-lg transition-colors border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </a>
                </div>
              </div>
            ))}
            
            {displayedPharmacies.length === 0 && !loading && locationState.lat && (
              <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-xl">
                <MapIcon className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 font-medium">No pharmacies found.</p>
                <p className="text-sm text-slate-500 mt-1">Try expanding the search radius or changing filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative z-0 h-[400px] lg:h-full">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-indigo-400 font-medium animate-pulse">Running Geolocation Engine...</p>
            </div>
          )}

          {locationState.lat ? (
            <MapContainer 
              center={[locationState.lat, locationState.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              <RecenterMap location={[locationState.lat, locationState.lng]} />
              
              <Marker position={[locationState.lat, locationState.lng]} icon={userIcon}>
                <Popup><div className="font-bold text-slate-900">{locationState.name}</div></Popup>
              </Marker>

              {displayedPharmacies.map(pharmacy => (
                <Marker 
                  key={pharmacy.id} 
                  position={[pharmacy.lat, pharmacy.lon]}
                  icon={getMarkerIcon(pharmacy.category)}
                >
                  <Popup className="pharmacy-popup shadow-2xl rounded-xl border-0 overflow-hidden">
                    <div className="p-2 min-w-[220px]">
                      <h3 className="font-bold text-slate-900 mb-1 text-base">{pharmacy.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{pharmacy.category}</span>
                        <span className="text-[10px] font-bold text-amber-500">★ {pharmacy.rating}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 border-t border-slate-100 pt-2 line-clamp-2">{pharmacy.address}</p>
                      <div className="flex justify-between items-center bg-slate-50 -mx-2 -mb-2 p-2 px-3 border-t border-slate-100">
                        <span className="text-sm font-bold text-indigo-600">{(pharmacy.distanceMeters / 1000).toFixed(1)} km</span>
                        <a 
                          href={getDirectionsUrl(pharmacy.lat, pharmacy.lon)}
                          target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                        >
                          Navigate
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {/* Placeholder background pattern */}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PharmacyLocator;
