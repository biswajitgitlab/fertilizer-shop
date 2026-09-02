import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function run() {
  const searchProductsTool = {
    functionDeclarations: [
      {
        name: 'searchProducts',
        description: 'Search for fertilizer or agricultural products in the live database based on user query.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "The search query (e.g., 'urea', 'pesticide', 'npk', 'paddy')",
            },
          },
          required: ['query'],
        },
      }
    ]
  };

  const chatHistory = [
    { role: 'user', parts: [{ text: 'find urea' }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
      config: {
        tools: [searchProductsTool],
        temperature: 0.7,
      }
    });
    console.log("Response:", JSON.stringify(response, null, 2));
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("Function Call:", response.functionCalls[0]);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
