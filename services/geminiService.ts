
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { HealthData, Recommendation } from "../types";

// Note: GoogleGenAI client is now initialized within each function to ensure fresh API key usage.

export async function getAIHealthAnalysis(data: HealthData): Promise<Recommendation[]> {
  // Fix: Create instance right before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze these real-time health metrics for a young professional: 
  Heart Rate: ${data.heartRate} bpm, 
  Stress Level: ${data.stress}/100,
  Focus Score: ${data.focusScore}/100.
  
  Provide exactly 3 extremely minimalist, actionable, and witty wellness suggestions. 
  Each suggestion should be under 12 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["id", "text", "icon"]
          }
        }
      }
    });

    // Fix: Using .text property directly
    const responseText = response.text;
    return JSON.parse(responseText || '[]');
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return [
      { id: '1', text: 'Stand up and stretch for 30 seconds.', icon: '🧘‍♀️' },
      { id: '2', text: 'Grab a glass of water right now.', icon: '💧' },
      { id: '3', text: 'Take three deep, slow breaths.', icon: '✨' }
    ];
  }
}

export async function* streamHealthChat(
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  currentMetrics: HealthData
) {
  // Fix: Create instance right before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Zen AI Dr., a trendy and empathetic health coach for young professionals. 
      You have access to the user's real-time metrics: 
      Heart Rate: ${currentMetrics.heartRate}bpm, Stress: ${currentMetrics.stress}/100, Focus: ${currentMetrics.focusScore}%.
      Be concise, helpful, and slightly informal. Use emojis. Avoid medical jargon. 
      Help them analyze their symptoms, suggest quick relaxations, or just chat about workplace wellness.`,
    }
  });

  // Start with history - extracting last user message for sendMessageStream
  const lastMessage = history[history.length - 1].parts[0].text;
  const result = await chat.sendMessageStream({ message: lastMessage });

  for await (const chunk of result) {
    const responseChunk = chunk as GenerateContentResponse;
    // Fix: Accessing .text property directly as per guidelines
    yield responseChunk.text || '';
  }
}
