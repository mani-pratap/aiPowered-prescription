import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const extractPrescriptionData = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  try {
    console.log('Initializing Gemini API client...');
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

    console.log('Processing image with Gemini OCR...');
    const prompt = `Analyze this handwritten doctor prescription image. 
1. Perform OCR to extract a line-by-line transcription of the text for rawOcrText.
2. Parse the text and fill the structuredData fields.
If some fields are not mentioned or illegible, leave them as empty strings.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/webp"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      structuredData: parsedData.structuredData,
      rawOcrText: parsedData.rawOcrText
    };
  } catch (error) {
    console.error("Gemini OCR Extraction Error:", error.message || error);
    throw new Error(`OCR Extraction Failed: ${error.message}`);
  }
};

