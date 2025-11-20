
import { GoogleGenAI, Type } from "@google/genai";
import { Person } from '../types';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateFamilyFromText = async (text: string): Promise<Person[]> => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Analyze the following description of a family and extract a list of people with their relationships and personal details.
    Return a JSON array of Person objects.
    
    Input text: "${text}"

    Rules:
    1. Generate unique IDs (e.g., 'p1', 'p2').
    2. Infer gender if possible, default to 'male'.
    3. Link 'parentIds' and 'childrenIds' and 'partnerIds' correctly based on the text.
    4. Extract National ID, Nationality, Phone Number, Location, and Job History if mentioned.
    5. If dates aren't provided, estimate or leave blank.
    6. Check if the person is deceased or has a death date mentioned. Set 'isDeceased' to true if so.
  `;

  // Define schema for strict JSON output
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        gender: { type: Type.STRING, enum: ['male', 'female'] },
        birthDate: { type: Type.STRING },
        deathDate: { type: Type.STRING },
        isDeceased: { type: Type.BOOLEAN },
        nationalId: { type: Type.STRING },
        nationality: { type: Type.STRING },
        phoneNumber: { type: Type.STRING },
        location: { type: Type.STRING },
        jobHistory: { type: Type.STRING },
        parentIds: { type: Type.ARRAY, items: { type: Type.STRING } },
        childrenIds: { type: Type.ARRAY, items: { type: Type.STRING } },
        partnerIds: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['id', 'name', 'gender', 'parentIds', 'childrenIds', 'partnerIds'],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as Person[];
  } catch (error) {
    console.error("Gemini Error", error);
    throw error;
  }
};
