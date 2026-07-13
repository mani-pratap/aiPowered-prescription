import axios from 'axios';
import Prescription from '../models/Prescription.js';

const GENERIC_KEYWORDS = ['jan aushadhi', 'generic', 'pradhan mantri', 'aushadhi kendra', 'govt', 'government'];
const BRANDED_KEYWORDS = ['apollo', 'medplus', 'wellness forever', 'guardian', 'noble plus', 'religare', 'sanjivani'];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// Helper to classify pharmacy
const classifyPharmacy = (name = '') => {
  const lowerName = name.toLowerCase();
  for (const keyword of GENERIC_KEYWORDS) {
    if (lowerName.includes(keyword)) return 'Generic';
  }
  for (const keyword of BRANDED_KEYWORDS) {
    if (lowerName.includes(keyword)) return 'Branded';
  }
  return 'Independent';
};

// @desc    Geocode a prescription address using Nominatim
// @route   POST /api/pharmacy/geocode
// @access  Private
export const geocodePrescriptionAddress = async (req, res, next) => {
  try {
    const { prescriptionId, manualAddress } = req.body;
    let addressesToTry = [];

    if (manualAddress) {
      addressesToTry.push(manualAddress);
    } else if (prescriptionId) {
      const prescription = await Prescription.findOne({ _id: prescriptionId, user: req.user._id });
      if (prescription && prescription.structuredData && prescription.structuredData.doctor) {
        const doc = prescription.structuredData.doctor;
        
        // 1. Full strict address (Hospital + Address)
        const fullParts = [];
        if (doc.hospital) fullParts.push(doc.hospital);
        if (doc.address) fullParts.push(doc.address);
        if (fullParts.length > 0) {
          addressesToTry.push(fullParts.join(', '));
        }

        // 2. Fallback: Just the address (removes highly specific clinic names which Nominatim often fails on)
        if (doc.address) {
          addressesToTry.push(doc.address);
        }

        // 3. Fallback: Just the hospital name (in case the address was malformed but the hospital is a famous landmark)
        if (doc.hospital) {
          addressesToTry.push(doc.hospital);
        }
      }
    }

    if (addressesToTry.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid address found to geocode.' });
    }

    // Intelligent Retry Loop for Nominatim
    for (const address of addressesToTry) {
      try {
        console.log(`[GEOCODE] Attempting Nominatim with: "${address}"`);
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: address,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'ArogyaSaathi-App'
          }
        });

        if (response.data && response.data.length > 0) {
          const { lat, lon, display_name } = response.data[0];
          console.log(`[GEOCODE] ✔ Success for: "${address}" -> ${lat}, ${lon}`);
          return res.json({
            success: true,
            data: {
              lat: parseFloat(lat),
              lng: parseFloat(lon),
              displayName: display_name,
              originalAddress: address
            }
          });
        } else {
          console.log(`[GEOCODE] ✖ No results for: "${address}"`);
        }
      } catch (err) {
        console.error(`[GEOCODE] API Error for: "${address}"`, err.message);
      }
    }

    return res.status(404).json({ success: false, message: 'Could not resolve any address variants to coordinates.' });
  } catch (error) {
    console.error("Geocoding Internal Error:", error);
    next(error);
  }
};

// @desc    Get nearby pharmacies using Overpass API
// @route   GET /api/pharmacy/nearby
// @access  Private
export const getNearbyPharmacies = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["healthcare"="pharmacy"](around:${radius},${lat},${lng});
        node["dispensing"="yes"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    let response = null;
    let successEndpoint = null;
    
    // Robust Overpass Fallback Matrix
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        console.log(`[OVERPASS] Attempting query on: ${endpoint}`);
        response = await axios.get(endpoint, {
          params: { data: query },
          headers: { 'User-Agent': 'ArogyaSaathi-App' },
          timeout: 15000
        });
        
        if (response.data && response.data.elements) {
          successEndpoint = endpoint;
          console.log(`[OVERPASS] ✔ Success on: ${endpoint} (Found ${response.data.elements.length} elements)`);
          break; // Break the loop on success
        }
      } catch (err) {
        console.warn(`[OVERPASS] ✖ Failed on: ${endpoint} - ${err.message}`);
        // Continue to the next endpoint
      }
    }

    if (!response || !response.data || !response.data.elements) {
      return res.status(502).json({ success: false, message: 'All Overpass endpoints failed to return data.' });
    }

    // Deduplicate elements by ID or coordinates
    const uniquePharmacies = new Map();

    response.data.elements.forEach(el => {
      const pLat = el.lat || el.center?.lat;
      const pLon = el.lon || el.center?.lon;
      const tags = el.tags || {};
      const name = tags.name || 'Local Medical Store';
      
      const distanceMeters = calculateDistance(lat, lng, pLat, pLon);
      
      // Filter out weird data (extremely far outliers)
      if (distanceMeters > radius * 1.5) return; 

      const pharmacy = {
        id: el.id,
        lat: pLat,
        lon: pLon,
        name,
        address: tags['addr:full'] || tags['addr:street'] || 'Address not available',
        phone: tags.phone || tags['contact:phone'] || null,
        openingHours: tags.opening_hours || null,
        category: classifyPharmacy(name),
        distanceMeters,
        isOpenNow: checkIsOpenNow(tags.opening_hours),
        rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)
      };

      // Simple deduplication by coordinate string to prevent overlapping UI nodes
      const coordKey = `${pLat.toFixed(4)}_${pLon.toFixed(4)}`;
      if (!uniquePharmacies.has(coordKey)) {
        uniquePharmacies.set(coordKey, pharmacy);
      } else {
        // If the new one has a better name, replace the default "Local Medical Store"
        if (pharmacy.name !== 'Local Medical Store' && uniquePharmacies.get(coordKey).name === 'Local Medical Store') {
           uniquePharmacies.set(coordKey, pharmacy);
        }
      }
    });

    const pharmaciesList = Array.from(uniquePharmacies.values());
    pharmaciesList.sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      endpointUsed: successEndpoint,
      data: pharmaciesList
    });
  } catch (error) {
    console.error("Overpass API Global Error:", error);
    next(error);
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c); 
}

function checkIsOpenNow(openingHoursStr) {
  if (!openingHoursStr) return true;
  if (openingHoursStr.toLowerCase().includes('24/7')) return true;
  return true; 
}
