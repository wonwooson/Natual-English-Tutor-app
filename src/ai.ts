import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    SYSTEM_PROMPT,
    PRACTICE_SYSTEM_PROMPT,
    RESPONSE_SCHEMA
} from "./prompts";
import { Expression, PracticeMessage, QAMessage } from "./types";

// Note: In Vite, environment variables are typically accessed via import.meta.env
// However, since we defined process.env.GEMINI_API_KEY in vite.config.ts, we use it here.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const DEFAULT_MODEL = "gemini-2.5-flash";



export const generateExpressions = async (scenario: string): Promise<Expression[]> => {
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: SYSTEM_PROMPT,
    }, { apiVersion: 'v1beta' });



    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: scenario }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA as any,
        },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        scenario: scenario.trim()
    }));
};

export const generateDialogue = async (expression: string, scenario: string): Promise<PracticeMessage[]> => {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL }, { apiVersion: 'v1' });

    const promptText = `You are a dialogue generator. 
Task: Generate a natural 5-turn English dialogue (A and B) using the expression "${expression}" in the context of "${scenario || 'daily life'}".
Format: Output ONLY a JSON array of objects. No other text.
Turn structure: AI(A) -> User(B) -> AI(A) -> User(B) -> AI(A).
Rules:
1. Turn 1 (AI): Start the conversation.
2. Turn 2 (User): Respond naturally.
3. Turn 3 (AI): Continue.
4. Turn 4 (User): Respond.
5. Turn 5 (AI): Ask a question or give a prompt to keep the conversation going.
Each object must have "speaker" ("A" or "B") and "text" (the dialogue content).`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }]
    });
    const text = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const dialogue = JSON.parse(text || "[]");


    return dialogue.map((d: any, idx: number) => ({
        role: idx % 2 === 0 ? 'assistant' : 'user',
        content: d.text
    }));

};

export const answerQA = async (question: string, context: string | null): Promise<string> => {
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: `You are a helpful English tutor. Answer the user's questions about English expressions, grammar, or natural usage.
Rules:
1. Respond in Korean, but keep English terms in English.
2. Use **bolding** for key English expressions, grammar points, and important takeaways.
3. Use clear line breaks and bullet points to avoid walls of text. 
4. Structure your response: Start with a clear explanation, then provide examples with usage tips.
5. Make the tone friendly and encouraging.`,
    }, { apiVersion: 'v1beta' });



    const prompt = context ? `${context}\n\n질문: ${question}` : question;
    const result = await model.generateContent(prompt);
    return result.response.text() || "죄송합니다. 답변을 생성하지 못했습니다.";
};
