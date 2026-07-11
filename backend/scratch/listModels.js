import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("No API key found.");
  process.exit(1);
}

const run = async () => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Fetching models from ${url.replace(key, '***')}...`);
    const response = await axios.get(url);
    console.log("Status:", response.status);
    console.log("Models:", response.data.models.map(m => m.name));
  } catch (error) {
    console.error("Error listing models:", error.response?.data || error.message);
  }
};

run();
