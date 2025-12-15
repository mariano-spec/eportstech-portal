import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getBotConfig, getServices } from "./supabaseMock";

// Initialize AI Client securely using environment variables
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateChatResponse = async (
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  contextLanguage: string
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. Check your .env file.");
    return "Soy NEXI_tech. Mis capacidades cognitivas están desactivadas temporalmente por configuración del sistema (Falta API Key).";
  }

  try {
    const model = 'gemini-2.5-flash';

    // 1. Fetch Dynamic Configuration from Supabase
    const botConfig = await getBotConfig();
    const services = await getServices();
    
    // 2. Determine Time Context
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' });
    
    // Simple logic to check if open
    const [startH, startM] = botConfig.businessHoursStart.split(':').map(Number);
    const [endH, endM] = botConfig.businessHoursEnd.split(':').map(Number);
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    
    const nowMinutes = currentH * 60 + currentM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isOpen = !isWeekend && nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    const statusText = isOpen ? "OPEN (Abierto)" : "CLOSED (Cerrado)";

    // 3. Construct Services List String
    const servicesList = services.filter(s => s.visible).map(s => `- ${s.title['es']}: ${s.description['es']}`).join('\n');

    // 4. Construct System Instruction
    const systemInstruction = `
      IDENTITY:
      You are ${botConfig.name}, the AI assistant for EportsTech.
      Tone: ${botConfig.tone.toUpperCase()}.
      Response Style: ${botConfig.responseLength.toUpperCase()}.
      
      CONTEXT:
      - Services Offered:
      ${servicesList}
      - Location: Headquarters in Terres de l'Ebre, serving Spain and Europe.
      
      KNOWLEDGE BASE (FACTS):
      ${(botConfig.knowledgeBase || []).map(k => `- ${k}`).join('\n      ')}
      
      OPERATIONAL AWARENESS:
      - Current Time: ${currentTimeString} (${currentDay}).
      - Business Hours: ${botConfig.businessHoursStart} - ${botConfig.businessHoursEnd}.
      - Business Status: ${statusText}.
      - If user asks for immediate human contact and business is CLOSED, politely inform them of hours and suggest leaving a message via the form.
      
      SALES STRATEGY:
      - Highlighted Product (Push this if relevant): ${botConfig.highlightedProduct}.
      - Qualification Questions (Ask one of these if context allows): 
        ${botConfig.qualifyingQuestions.map(q => `- "${q}"`).join('\n        ')}
      
      LIMITATIONS (DO NOT DO THIS):
      ${botConfig.limitations.map(l => `- ${l}`).join('\n      ')}
      
      CUSTOM INSTRUCTIONS:
      ${botConfig.customInstructions}

      LANGUAGE:
      Respond primarily in Spanish (ES). If user speaks another language (CAT, EN, FR, DE, IT), switch immediately to that language.
      
      Current Conversation History:
      ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Lo siento, no he podido generar una respuesta en este momento.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Actualmente tengo problemas de conexión. Por favor inténtalo más tarde o utiliza el formulario de contacto.";
  }
};