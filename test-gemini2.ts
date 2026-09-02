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
    { role: 'user', parts: [{ text: 'find urea' }] },
    {
      role: 'model',
      parts: [{
        functionCall: { name: 'searchProducts', args: { query: 'urea' } }
      }]
    },
    {
      role: 'user',
      parts: [{
        functionResponse: {
          name: 'searchProducts',
          response: { result: [{ name: 'Urea 46%', price: 300, stock: 50 }] }
        }
      }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory as any,
      config: {
        tools: [searchProductsTool],
        temperature: 0.7,
      }
    });
    console.log("Follow up Response:", response.text);
  } catch (e) {
    console.error(e);
  }
}
run();
