const apiKey = (import.meta.env.VITE_GOOGLE_GEMINI_API_KEY as string) || '';

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
