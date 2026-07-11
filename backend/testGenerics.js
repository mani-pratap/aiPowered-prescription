import { generateGenericAlternatives } from './services/geminiAnalysisService.js';

async function test() {
  try {
    const data = await generateGenericAlternatives('Esojet');
    console.log("SUCCESS:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("FAILED:");
    console.error(error);
  }
}

test();
