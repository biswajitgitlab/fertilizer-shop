import { GoogleGenAI, Type } from '@google/genai';
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
    },
    {
      name: 'getProductDetails',
      description: 'Get detailed information about a specific product including live price, stock quantity, and description.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          slug: {
            type: Type.STRING,
            description: "The product slug or ID (e.g., 'urea-46', 'npk-19-19-19')",
          },
        },
        required: ['slug'],
      },
    }
  ]
};
console.log("TS OK");
