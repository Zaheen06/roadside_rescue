import { GoogleGenerativeAI } from "@google/generative-ai";

const AVAILABLE_SERVICES = [
    { key: "puncture_repair", label: "Puncture Repair", desc: "Flat tyre, puncture, nail in tyre" },
    { key: "stepney_change", label: "Stepney Change", desc: "Replace flat tyre with spare tyre" },
    { key: "tube_replacement", label: "Tube Replacement", desc: "Inner tube damaged, needs full replacement" },
    { key: "fuel_delivery", label: "Fuel Delivery", desc: "Car ran out of petrol or diesel" },
];

const SYSTEM_PROMPT = `You are a helpful roadside assistance AI for "Roadside Rescue" — an emergency vehicle help service in India.

A user will describe their vehicle problem. Your job is to:
1. Briefly diagnose what might be wrong (2-3 possible causes, bullet points)
2. Recommend the SINGLE best service from the list below
3. Give a short, friendly reassuring message

Available services:
${AVAILABLE_SERVICES.map((s) => `- ${s.key}: ${s.label} (${s.desc})`).join("\n")}

Respond ONLY in this exact JSON format:
{
  "diagnosis": "Your 2-3 line diagnosis here",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "suggestedServiceKey": "one_of_the_service_keys",
  "suggestedServiceLabel": "Human readable service name",
  "message": "Short reassuring message to the user"
}`;

export async function diagnoseBreakdown(userMessage: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        // Fallback diagnosis when no API key is configured
        return {
            diagnosis: "Based on your description, this sounds like a tyre or fuel issue.",
            causes: ["Flat or punctured tyre", "Low tyre pressure", "Out of fuel"],
            suggestedServiceKey: "puncture_repair",
            suggestedServiceLabel: "Puncture Repair",
            message: "Don't worry — our technicians are ready to help! (Note: Add GEMINI_API_KEY to .env.local for smarter AI diagnosis)",
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser problem: "${userMessage}"`);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    return JSON.parse(jsonMatch[0]);
}
