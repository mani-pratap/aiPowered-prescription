/**
 * A regex-based parser to extract structured information from raw OCR text.
 * Note: This is an approximation since Tesseract OCR text lacks structural context.
 */

export const parseRawOCRText = (rawText) => {
  if (!rawText) return getEmptyStructuredData();

  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const structuredData = getEmptyStructuredData();
  
  // Basic regex patterns for fallback parsing
  const phonePattern = /(?:ph|phone|mob|mobile|contact|tel)?\s*:?\s*(\+?\d{10,14})/i;
  const agePattern = /(?:age|yrs|years?)\s*:?\s*(\d{1,3})/i;
  const genderPattern = /(?:gender|sex)\s*:?\s*(male|female|m|f|other)/i;
  const datePattern = /(?:date|dt)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i;

  let inMedicineSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // 1. Phone extraction
    if (!structuredData.doctor.phone) {
      const phoneMatch = line.match(phonePattern);
      if (phoneMatch) structuredData.doctor.phone = phoneMatch[1];
    }

    // 2. Patient Age and Gender
    if (!structuredData.patient.age) {
      const ageMatch = line.match(agePattern);
      if (ageMatch) structuredData.patient.age = ageMatch[1];
    }
    if (!structuredData.patient.gender) {
      const genderMatch = line.match(genderPattern);
      if (genderMatch) structuredData.patient.gender = genderMatch[1];
    }

    // 3. Date extraction
    if (!structuredData.prescriptionDate) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) structuredData.prescriptionDate = dateMatch[1];
    }

    // 4. Heuristics for Medicine section (Rx)
    if (lowerLine.includes('rx') || lowerLine.includes('medicines') || lowerLine.includes('treatment')) {
      inMedicineSection = true;
      continue;
    }

    // If we're in the medicine section, look for lines starting with Tab, Cap, Syr, Inj
    if (inMedicineSection) {
      if (lowerLine.startsWith('tab') || lowerLine.startsWith('cap') || lowerLine.startsWith('syr') || lowerLine.startsWith('inj')) {
        // Very basic extraction for medicine line like "Tab Dolo 650 1-0-1 5 days"
        const parts = line.split(/\s+/);
        
        let medName = '';
        let frequency = '';
        let duration = '';
        
        // Find frequency like 1-0-1, 1x/day, OD, BD, TDS
        const freqPattern = /\d-\d-\d|od|bd|tds|bid|qds|\dx\/day/i;
        
        for (const part of parts) {
          if (freqPattern.test(part)) {
            frequency = part;
          } else if (part.toLowerCase().includes('days') || part.toLowerCase().includes('weeks') || part.toLowerCase().includes('months')) {
            duration = part;
          } else {
            // Assume it's part of the name
            if (medName.length > 0) medName += ' ';
            medName += part;
          }
        }

        structuredData.medicines.push({
          medicineName: medName,
          dosage: '',
          strength: '',
          frequency: frequency,
          duration: duration,
          instructions: ''
        });
      }
    } else {
      // 5. Very naive heuristic for Doctor Name (Usually near the top, often starts with Dr.)
      if (!structuredData.doctor.name && lowerLine.includes('dr.')) {
        structuredData.doctor.name = line;
      }
    }
  }

  return structuredData;
};

const getEmptyStructuredData = () => ({
  doctor: {
    name: "",
    hospital: "",
    address: "",
    phone: ""
  },
  patient: {
    name: "",
    age: "",
    gender: ""
  },
  prescriptionDate: "",
  medicines: [],
  additionalNotes: ""
});
