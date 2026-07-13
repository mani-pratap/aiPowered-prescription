import axios from 'axios';

async function test() {
  const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:5000,28.6304,77.2177);
      );
      out center;
    `;
  try {
    const response = await axios.get('https://lz4.overpass-api.de/api/interpreter', {
      params: { data: query },
      headers: { 'User-Agent': 'ArogyaSaathi-App' }
    });
    console.log("lz4:", response.data.elements.length);
  } catch(e) {
    console.log("lz4:", e.response ? e.response.data : e.message);
  }
}
test();
