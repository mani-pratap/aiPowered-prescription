import axios from 'axios';

async function test() {
  const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:5000,28.6139,77.2090);
      );
      out center;
    `;
  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: query },
      headers: { 'User-Agent': 'ArogyaSaathi-App' }
    });
    console.log(response.data.elements.length);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
