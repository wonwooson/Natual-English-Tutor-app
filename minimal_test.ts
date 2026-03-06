import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1beta' });

async function run() {
    try {
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (e: any) {
        console.log("Error:", e.status, e.statusText);
    }
}
run();
