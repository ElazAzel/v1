
import { GoogleGenAI, Type } from "@google/genai";

const callGeminiApi = async <T,>(apiCall: () => Promise<T>, maxRetries = 5): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error("API call failed after all retries", error);
        throw error;
      }
      const delay = Math.pow(2, attempt) * 100 + Math.random() * 100;
      console.log(`API call failed, retrying in ${delay.toFixed(0)}ms... (Attempt ${attempt})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("API call failed after all retries.");
};

export const generateLinkTitles = async (currentTitle: string, url: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on the URL "${url}" and the current button text "${currentTitle}", generate exactly 3 alternative, short, high-converting titles for this link button. The titles should be catchy, concise, and under 30 characters. Respond in Russian.`;

  return callGeminiApi(async () => {
    const response = await ai.models.generateContent({
      // FIX: Updated deprecated model name.
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              description: "An array of exactly 3 suggested titles in Russian.",
              items: { type: Type.STRING }
            }
          },
          required: ["titles"]
        }
      }
    });
    
    const rawText = response.text.trim();
    try {
        const jsonResponse = JSON.parse(rawText);
        if (jsonResponse.titles && Array.isArray(jsonResponse.titles) && jsonResponse.titles.length > 0) {
            return jsonResponse.titles.slice(0, 3);
        }
    } catch(e) {
        console.error("Failed to parse Gemini JSON response:", rawText, e);
    }

    return [];
  });
};

export const generateProductDescription = async (productName: string, price: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a short, attractive, and sales-oriented product description in Russian for a product named "${productName}" which costs $${price}. The description should be a single paragraph, max 2-3 sentences.`;

  return callGeminiApi(async () => {
    const response = await ai.models.generateContent({
      // FIX: Updated deprecated model name.
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  });
};


export const getChatbotResponse = async (question: string, profile: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return callGeminiApi(async () => {
    const response = await ai.models.generateContent({
      // FIX: Updated deprecated model name.
      model: "gemini-2.5-flash",
      contents: `Пользователь спросил: "${question}"`,
      config: {
        systemInstruction: `Ты — полезный, дружелюбный и слегка неформальный ассистент владельца этой страницы. Твоя задача — отвечать на вопросы пользователей, основываясь СТРОГО на предоставленной информации. Твои ответы должны быть короткими и по делу, в идеале — не длиннее 2-3 предложений. Если вопрос выходит за рамки известной тебе информации, вежливо ответь: "У меня нет такой информации, но вы можете связаться с ним/ней напрямую, чтобы уточнить!". Всегда отвечай на русском языке.\n\nПРОФИЛЬ:\n${profile}`,
      }
    });
    return response.text;
  });
};

export const getSearchResults = async (query: string): Promise<{ text: string; sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return callGeminiApi(async () => {
    const response = await ai.models.generateContent({
      // FIX: Updated deprecated model name.
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    return { text, sources };
  });
};

export const generateSeoMeta = async (pageContent: string): Promise<{ description: string, keywords: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a concise and compelling SEO meta description (150-160 characters) and 5-7 relevant meta keywords in Russian based on the following page content. The content is for a personal bio page.\n\nPAGE CONTENT:\n${pageContent}`;

  return callGeminiApi(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "SEO meta description in Russian, 150-160 characters."
            },
            keywords: {
              type: Type.ARRAY,
              description: "An array of 5-7 SEO keywords in Russian.",
              items: { type: Type.STRING }
            }
          },
          required: ["description", "keywords"]
        }
      }
    });

    const rawText = response.text.trim();
    try {
      const jsonResponse = JSON.parse(rawText);
      if (jsonResponse.description && jsonResponse.keywords) {
        return jsonResponse;
      }
    } catch (e) {
      console.error("Failed to parse Gemini SEO JSON response:", rawText, e);
    }

    return { description: '', keywords: [] };
  });
};
