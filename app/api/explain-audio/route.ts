import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, RESUME_CONTEXT } from "@/lib/gemini";
import { Modality } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      topic, 
      context = "", 
      type = "question-explainer", 
      targetCompany = "", 
      roleProfile = "GTM Systems Engineer",
      voice = "Fenrir"
    } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic or text is required" }, { status: 400 });
    }

    const ai = getGeminiClient();

    // 1. Generate an auditory-optimized spoken explanation
    const prompt = `
You are a warm, articulate, and seasoned Senior GTM Systems Engineer and Technical Coach.
You are speaking out loud to an auditory learner (Jamil Yakasai) who is preparing for Senior GTM Engineer interviews.
They learn best by hearing clear explanations, plain English intuition, and intuitive real-world analogies rather than reading wall-of-text documentation.

TASK:
Explain the following ${type} out loud in conversational, engaging, spoken English.

TOPIC / CONCEPT / QUESTION:
${topic}

ADDITIONAL CONTEXT / SCENARIO:
${context}

TARGET COMPANY / ROLE CONTEXT:
${targetCompany ? `Target Company: ${targetCompany}` : ''}
Role Profile: ${roleProfile}

RULES FOR SPOKEN AUDITORY EXPLANATION:
1. Speak directly to Jamil in a natural, encouraging, and clear conversational tone (as if in a 1-on-1 coaching audio note).
2. Begin with a 1-sentence crystal clear intuitive analogy or plain-English summary.
3. Break down the core mechanism in 2-3 logical steps (e.g., "First... Next... Finally...").
4. Explain WHY interviewers ask this and what technical trap or trade-off to watch out for.
5. End with a quick high-impact talking point they can say in their answer.
6. Keep the spoken script between 90 and 160 words so it is punchy, memorable, and enjoyable to listen to in under 45-60 seconds.
7. Avoid markdown headers, asterisks, bullet points, or code blocks in the spoken script because this will be fed directly into a Text-To-Speech engine.

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "title": "Brief title of the audio explanation",
  "spokenScript": "The complete word-for-word spoken script with natural conversational pauses, without any markdown formatting or asterisks.",
  "keyTakeaway": "One short sentence summarizing the core lesson."
}
`;

    let generatedData = {
      title: `Audio Breakdown: ${topic.slice(0, 40)}`,
      spokenScript: `Here is the key intuition. When tackling this GTM engineering challenge, imagine your data pipeline as a protected airport security line. Before making expensive third-party API calls, always validate the email domain locally and check your cache. Then, use an asynchronous queue to decouple ingress from CRM writebacks. This protects your speed-to-lead while cutting API costs by over sixty percent. When answering, emphasize how this architecture prevents rate limits and eliminates duplicate records.`,
      keyTakeaway: "Decouple ingestion with async queues and gate enrichment with local cache validation."
    };

    try {
      const textResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const responseText = textResponse.text || "{}";
      const parsed = JSON.parse(responseText);
      if (parsed.spokenScript) {
        generatedData = parsed;
      }
    } catch (genErr) {
      console.warn("Gemini script generation fallback:", genErr);
    }

    // 2. Synthesize with Google TTS using specified male voice
    let base64Audio: string | undefined;
    const allowedVoices = ["Fenrir", "Puck", "Charon", "Zephyr", "Kore"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "Fenrir";

    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: generatedData.spokenScript }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsErr) {
      console.warn("Gemini TTS synthesis fallback to WebSpeech:", ttsErr);
    }

    return NextResponse.json({
      title: generatedData.title,
      spokenScript: generatedData.spokenScript,
      keyTakeaway: generatedData.keyTakeaway,
      audioData: base64Audio || null,
      mimeType: base64Audio ? "audio/pcm;rate=24000" : null,
      sampleRate: 24000,
      voice: selectedVoice,
    });
  } catch (error: any) {
    console.error("Explain audio error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate audio explanation" },
      { status: 500 }
    );
  }
}
