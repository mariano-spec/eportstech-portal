import { Language } from '../types';

const apiKey = (import.meta.env.VITE_GOOGLE_GEMINI_API_KEY as string) || '';

interface ChatHistory {
  role: 'user' | 'model';
  text: string;
}

/**
 * Generate chat response using Gemini API
 * Called by Chatbot component
 */
export const generateChatResponse = async (
  history: ChatHistory[],
  userMessage: string,
  lang: Language
): Promise<string> => {
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured');
    return 'Lo siento, el servicio de chat no está disponible en este momento.';
  }

  try {
    // Format conversation history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return 'No pude procesar tu mensaje. Por favor, intenta de nuevo.';
  } catch (error) {
    console.error('❌ Gemini chat error:', error);
    return 'Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
  }
};

/**
 * Alternative simple API call (for future use)
 */
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured');
    return 'Gemini API key not configured';
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return 'No response from Gemini API';
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    throw error;
  }
};
