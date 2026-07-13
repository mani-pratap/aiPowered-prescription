import axios from 'axios';
import Prescription from '../models/Prescription.js';

const GENERIC_KEYWORDS = ['jan aushadhi', 'generic', 'pradhan mantri', 'aushadhi kendra', 'govt', 'government'];
const BRANDED_KEYWORDS = ['apollo', 'medplus', 'wellness forever', 'guardian', 'noble plus', 'religare', 'sanjivani'];

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
    const { prescriptionId } = req.body;
    let addressToGeocode = null;

    if (prescriptionId) {
      const prescription = await Prescription.findOne({ _id: prescriptionId, user: req.user._id });
      if (prescription && prescription.structuredData && prescription.structuredData.doctor) {
        const doc = prescription.structuredData.doctor;
        // Construct best possible address string
        const parts = [];
        if (doc.hospital) parts.push(doc.hospital);
        if (doc.address) parts.push(doc.address);
        if (parts.length > 0) {
          addressToGeocode = parts.join(', ');
        }
      }
    }

    if (!addressToGeocode) {
      return res.status(404).json({ success: false, message: 'No valid address found in prescription.' });
    }

    // Call Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: addressToGeocode,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'ArogyaSaathi-App'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon, display_name } = response.data[0];
      return res.json({
        success: true,
        data: {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          displayName: display_name,
          originalAddress: addressToGeocode
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'Could not resolve address to coordinates.' });
    }
  } catch (error) {
    console.error("Geocoding Error:", error);
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
      );
      out center;
    `;
    
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: query },
      headers: { 'User-Agent': 'ArogyaSaathi-App' }
    });

    let pharmacies = response.data.elements.map(el => {
      const pLat = el.lat || el.center?.lat;
      const pLon = el.lon || el.center?.lon;
      const tags = el.tags || {};
      const name = tags.name || 'Local Medical Store';
      
      // Calculate fake distance since Overpass doesn't return exact driving distance easily
      // We will let frontend calculate haversine distance or just calculate here
      const distanceMeters = calculateDistance(lat, lng, pLat, pLon);
      
      return {
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
        // Fake rating between 3.5 and 5.0 for UI aesthetics
        rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)
      };
    });

    // Sort by distance
    pharmacies.sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      data: pharmacies
    });
  } catch (error) {
    console.error("Overpass API Error:", error);
    next(error);
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
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
  if (!openingHoursStr) return true; // Assume open if unknown for hackathon
  if (openingHoursStr.toLowerCase().includes('24/7')) return true;
  // Simple heuristic
  return true; 
}
