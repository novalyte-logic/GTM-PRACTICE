import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Modality } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "Fenrir" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required for TTS synthesis" }, { status: 400 });
    }

    // Clean text of markdown asterisks or special characters for smoother speech
    const sanitizedText = text
      .replace(/[*#_`~>[\]]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 1500); // Safety limit for concise spoken audio

    const ai = getGeminiClient();

    const allowedVoices = ["Fenrir", "Puck", "Charon", "Zephyr", "Kore"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "Fenrir";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: sanitizedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return NextResponse.json(
        { error: "No audio generated from TTS model", fallbackText: sanitizedText },
        { status: 502 }
      );
    }

    return NextResponse.json({
      audioData: base64Audio,
      mimeType: "audio/pcm;rate=24000",
      sampleRate: 24000,
      voice: selectedVoice,
      transcript: sanitizedText,
    });
  } catch (error: any) {
    console.error("TTS generation error:", error?.message || error);
    return NextResponse.json(
      { 
        error: error?.message || "TTS service unavailable",
        useWebSpeechFallback: true 
      },
      { status: 500 }
    );
  }
}
