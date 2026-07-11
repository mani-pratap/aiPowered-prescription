import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const imagePath = process.argv[2] || path.join(process.cwd(), 'scratch', 'handwritten_prescription.png');

if (!process.env.GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not defined in .env file.");
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`Error: Image file not found at ${imagePath}`);
  process.exit(1);
}

// Convert local file to generative part
const fileToGenerativePart = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: "image/png"
    },
  };
};

const run = async () => {
  try {
    console.log("Initializing Gemini client...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        structuredData: {
          type: SchemaType.OBJECT,
          properties: {
            doctor: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                hospital: { type: SchemaType.STRING },
                address: { type: SchemaType.STRING },
                phone: { type: SchemaType.STRING }
              }
            },
            patient: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                age: { type: SchemaType.STRING },
                gender: { type: SchemaType.STRING }
              }
            },
            prescriptionDate: { type: SchemaType.STRING },
            medicines: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  medicineName: { type: SchemaType.STRING },
                  dosage: { type: SchemaType.STRING },
                  strength: { type: SchemaType.STRING },
                  frequency: { type: SchemaType.STRING },
                  duration: { type: SchemaType.STRING },
                  instructions: { type: SchemaType.STRING }
                }
              }
            },
            additionalNotes: { type: SchemaType.STRING }
          }
        },
        rawOcrText: { type: SchemaType.STRING }
      }
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    console.log(`Sending image ${imagePath} to Gemini...`);
    const prompt = `Analyze this handwritten doctor prescription image. 
1. Perform OCR to extract a line-by-line transcription of the text for rawOcrText.
2. Parse the text and fill the structuredData fields.
If some fields are not mentioned or illegible, leave them as empty strings.`;

    const imagePart = fileToGenerativePart(imagePath);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("\nResponse from Gemini (JSON):\n");
    const data = JSON.parse(responseText);
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Error during Gemini OCR processing:", error);
  }
};

run();
