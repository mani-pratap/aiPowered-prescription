import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent('Hi');
    console.log("Success with gemini-2.5-flash");
  } catch (error) {
    console.log("Error with gemini-2.5-flash", error.message);
  }
}
run();
