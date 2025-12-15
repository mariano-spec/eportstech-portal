import axios from 'axios';

const apiKey = (import.meta.env.VITE_GOOGLE_GEMINI_API_KEY as string) || '';

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured');
    return 'Gemini API key not configured';
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    }

    return 'No response from Gemini API';
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    throw error;
  }
};
