import { publicApi } from './axiosInstances';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import { productApi } from './productApi';
import { useCartStore } from '../store/cartStore';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini SDK
// Use VITE_GEMINI_API_KEY from environment, with a dummy fallback to prevent initialization crashes
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || 'MISSING_API_KEY';
const ai = new GoogleGenAI({ apiKey });


// Simple in-memory chat history for the session
let chatHistory: any[] = [];

// Define tools for function calling
const searchProductsTool = {
  functionDeclarations: [
    {
      name: 'searchProducts',
      description: 'Search for fertilizer or agricultural products in the live database to view real-time stock counts, prices, and categories based on user query.',
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
      description: 'Get detailed information about a specific product including real-time stock quantity, live price, and product description.',
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
    },
    {
      name: 'addToCart',
      description: 'Add a specified quantity of a product directly to the user shopping cart by product slug or query.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          slug: {
            type: Type.STRING,
            description: "The product slug or name to add to cart (e.g., 'urea-46', 'npk-19-19-19')",
          },
          quantity: {
            type: Type.INTEGER,
            description: "Quantity to add to cart (default 1)",
          }
        },
        required: ['slug'],
      },
    }
  ]
};

export const chatApi = {
  startSession: async () => {
    try {
      chatHistory = [];
      const res = await publicApi.post('/chat/start');
      return res.data;
    } catch (e) {
      chatHistory = [];
      return { session_token: `sess_${Date.now()}` };
    }
  },

  sendMessage: async (message: string) => {
    const appName = useSiteSettingsStore.getState().appName || 'KrishiShop';
    const userPrompt = `You are KrishiMitra, an expert AI agricultural assistant for ${appName} e-commerce. Help farmers with fertilizers, pesticides, NPK dosage, weed control, plant vitamins, and crop diseases in simple, warm tone.
User query: ${message}`;

    // Push the user's formatted message to the history
    chatHistory.push({ role: 'user', parts: [{ text: userPrompt }] });

    try {
      const systemInstruction = `You are "KrishiMitra AI", a knowledgeable, friendly, and practical agricultural consultant for ${appName}. 

Guidelines:
1. Specialized Expertise: Provide expert advice on crop cultivation, fertilizer dosage (NPK recommendations per acre), organic bio-fertilizers, pest/disease management, irrigation scheduling, and soil health.
2. Tone & Language: Clear, encouraging, practical, and farmer-friendly. Support multiple languages (English, Hindi, Bengali, Telugu, Punjabi, Marathi, etc.) based on the language used by the farmer.
3. Safety & Precision: Always specify exact dosage per acre or per liter of water. Emphasize safe handling of agricultural chemicals and promote integrated pest management (IPM).
4. Product Mentions: When relevant, suggest standard fertilizer types (Urea, DAP, MOP, 19:19:19, Bio-NPK, Humic Acid, Micronutrient kits) that the farmer can find in the store. When asked about specific products or cart additions, use the provided tools to fetch real-time prices, stock counts, or add items to the cart.
5. Format: Use concise bullet points, bold key terms, and scannable step-by-step instructions.`;

      // 1. Initial Generation Call with Tools
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatHistory,
        config: {
          systemInstruction: systemInstruction,
          tools: [searchProductsTool],
          temperature: 0.7,
        }
      });

      let finalText = response.text || '';
      
      // 2. Handle Function Calls if any
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        const functionName = functionCall.name;
        const functionArgs = functionCall.args as any;

        let toolResult: any = null;

        try {
          if (functionName === 'searchProducts') {
            const res = await productApi.getProducts({ search: functionArgs.query });
            toolResult = res.products.map((p: any) => ({
              name: p.name,
              slug: p.slug,
              price: p.price,
              stock: p.stock,
              category: p.category
            })).slice(0, 5); // top 5 results
          } else if (functionName === 'getProductDetails') {
            const p = await productApi.getProduct(functionArgs.slug);
            toolResult = {
              name: p.name,
              price: p.price,
              stock: p.stock,
              description: p.shortDescription || p.description,
              usageInstructions: p.usageInstructions,
            };
          } else if (functionName === 'addToCart') {
            const slug = functionArgs.slug;
            const qty = functionArgs.quantity || 1;
            let productToCart = null;
            try {
              productToCart = await productApi.getProduct(slug);
            } catch (e) {
              const searchRes = await productApi.getProducts({ search: slug });
              if (searchRes.products && searchRes.products.length > 0) {
                productToCart = searchRes.products[0];
              }
            }

            if (productToCart) {
              useCartStore.getState().addToCart(productToCart, qty, true);
              toolResult = {
                success: true,
                message: `Successfully added ${qty} x ${productToCart.name} to shopping cart.`,
                productName: productToCart.name,
                price: productToCart.price,
                stockRemaining: productToCart.stock,
                totalCartCount: useCartStore.getState().getItemCount()
              };
            } else {
              toolResult = { success: false, error: `Product '${slug}' could not be found in stock.` };
            }
          }
        } catch (e) {
          toolResult = { error: 'Failed to execute action on live database/cart' };
        }

        // 3. Append Tool Call and Response to History
        chatHistory.push({
          role: 'model',
          parts: [{ functionCall: functionCall }]
        });
        
        chatHistory.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: functionName,
              response: { result: toolResult }
            }
          }]
        });

        // 4. Follow-up Generation Call
        const followUpResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: chatHistory,
          config: {
            systemInstruction: systemInstruction,
            tools: [searchProductsTool],
          }
        });
        
        finalText = followUpResponse.text || '';
      }

      // 5. Append Model's Final Text to History
      if (finalText) {
        chatHistory.push({ role: 'model', parts: [{ text: finalText }] });
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: finalText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e: any) {
      console.error('Gemini AI Error:', e);
      chatHistory.pop(); // Remove the last user message to avoid weird states
      
      let replyText = `Namaste! I am KrishiMitra AI, your ${useSiteSettingsStore.getState().appName} agricultural consultant. How can I help you today?`;
      
      if (apiKey === 'MISSING_API_KEY') {
        replyText = "⚠️ To enable KrishiMitra AI responses, please add your `VITE_GEMINI_API_KEY` to the `.env` file! Currently running in offline fallback mode.";
      } else {
        const q = message.toLowerCase();
        if (q.includes("paddy") || q.includes("rice")) {
          replyText = "For Paddy crops, apply Zinc EDTA 12% to prevent leaf yellowing and NPK 19:19:19 for maximum tillers!";
        } else if (q.includes("pest") || q.includes("bug")) {
          replyText = "For sucking insects like whiteflies and thrips, apply Imidacloprid 17.8% SL (Confidor).";
        } else if (q.includes("herbicide") || q.includes("weed")) {
          replyText = "For weed control, Glycel 41% SL Systemic Herbicide is highly effective!";
        }
      }
      
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }
};
