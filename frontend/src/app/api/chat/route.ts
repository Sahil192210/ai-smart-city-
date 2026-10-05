import { NextResponse } from "next/server";
import { generateSmartCityResponse } from "@/services/aiChatEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.message || body.prompt || "";
    const cityId = body.cityId || "pune";
    const history = Array.isArray(body.history) ? body.history : [];

    // 1. First Priority: Invoke Google Gemini API with ultra-responsive, highly capable models
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      // gemini-flash-lite-latest and gemini-flash-latest are the active verified generation endpoints
      const modelsToTry = [
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
        "gemma-4-26b-a4b-it"
      ];
      const cityName = capitalize(cityId);
      const systemPrompt = `You are a ChatGPT-caliber AI Smart City Assistant for ${cityName}, India.

Your core traits:
1. **Super Intelligent & Thorough**: Think and respond like ChatGPT. Directly, comprehensively, and intelligently answer whatever question the user asks. If they ask about local history, food, IT parks, real estate, civic services, schools, weather, weekend trips, culture, traffic, or emergency triage, give insightful, accurate, and deeply helpful answers.
2. **Context-Aware Multi-turn Dialogue**: Maintain continuity with the prior conversation history. Understand references to previous messages seamlessly.
3. **Structured & Readable**:
   - Organize long answers with clear markdown headers (e.g. ### 📍 Top Recommendations, ### 💡 Pro Tips, ### 🕒 Timings & Access).
   - Use bold key terms for instant readability.
   - For directions, routes, or steps, use numbered lists.
4. **Actionable Local Guidance**:
   - Mention realistic names of areas (e.g. FC Road, Koregaon Park, Kothrud, Hinjawadi in Pune; or Bandra, Andheri in Mumbai, etc.).
   - Give realistic cost estimates, metro station names, best visiting hours, and local customs.
5. **Conversational Finish**:
   - Always end with 2-3 thoughtful, relevant follow-up suggestions that the user might want to explore next.`;

      // Build contents array with conversation history
      const geminiContents: Array<{ role?: string; parts: Array<{ text: string }> }> = [];

      // Add system prompt context as first user-model turn
      geminiContents.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nAcknowledge your role and provide your readiness concisely.` }]
      });
      geminiContents.push({
        role: "model",
        parts: [{ text: `Understood! I am ready to serve as your intelligent Smart City AI Assistant for ${cityName}. How can I assist you today?` }]
      });

      // Add recent chat history (up to last 8 messages)
      for (const msg of history.slice(-8)) {
        if (msg.sender === "user" && msg.content) {
          geminiContents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.sender === "assistant" && msg.content) {
          geminiContents.push({ role: "model", parts: [{ text: msg.content }] });
        }
      }

      // Add current user prompt
      geminiContents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: geminiContents,
                generationConfig: {
                  temperature: 0.7,
                  topP: 0.95,
                  maxOutputTokens: 2048,
                }
              }),
              signal: AbortSignal.timeout(15000)
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const lowerPrompt = prompt.toLowerCase();
              const wantsLocation = lowerPrompt.includes("where") || lowerPrompt.includes("location") || lowerPrompt.includes("map") || lowerPrompt.includes("address") || lowerPrompt.includes("direction") || lowerPrompt.includes("locate") || lowerPrompt.includes("hospital") || lowerPrompt.includes("place") || lowerPrompt.includes("route");

              return NextResponse.json({
                success: true,
                answer: candidateText,
                source: "Smart City Assistant",
                suggestedAction: wantsLocation ? { title: `${cityName} Destination`, type: "tourist" } : null,
                recommendedActions: generateDynamicFollowUps(prompt, cityName),
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch {
          // try next model
        }
      }
    }

    // 2. Second Priority: Invoke Spring Boot AI Backend
    const springBootUrl = process.env.SPRING_BOOT_API_URL || "http://localhost:8085";
    try {
      const springRes = await fetch(`${springBootUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, cityId, cityName: capitalize(cityId) }),
        signal: AbortSignal.timeout(4000),
      });

      if (springRes.ok) {
        const springData = await springRes.json();
        return NextResponse.json({
          success: true,
          answer: springData.answer,
          source: springData.source || "Spring Boot Backend",
          suggestedAction: springData.suggestedAction,
          recommendedActions: springData.recommendedActions,
          timestamp: springData.timestamp || new Date().toISOString()
        });
      }
    } catch {
      // Spring Boot backend offline or busy
    }

    // 3. Third Priority: Reliable Municipal Knowledge Engine Fallback
    const response = generateSmartCityResponse(prompt, cityId);
    return NextResponse.json({
      success: true,
      answer: response.reply,
      source: "Municipal Knowledge Engine",
      suggestedAction: response.suggestedAction,
      recommendedActions: response.recommendedActions,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function capitalize(str: string) {
  if (!str) return "Smart City";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateDynamicFollowUps(prompt: string, cityName: string): string[] {
  const p = prompt.toLowerCase();
  if (p.includes("hospital") || p.includes("doctor") || p.includes("icu") || p.includes("emergency") || p.includes("ambulance")) {
    return [
      `📍 Show 24/7 ICU trauma hospitals on map`,
      `📞 Emergency helpline & ambulance (108)`,
      `💊 Find 24-hour pharmacies in ${cityName}`
    ];
  }
  if (p.includes("food") || p.includes("eat") || p.includes("restaurant") || p.includes("cafe")) {
    return [
      `☕ Best quiet work cafes with good WiFi in ${cityName}`,
      `🍛 Traditional must-try Maharashtrian breakfast spots`,
      `🌙 Late-night food streets & street-food hubs`
    ];
  }
  if (p.includes("tourist") || p.includes("place") || p.includes("visit") || p.includes("sightseeing") || p.includes("fort")) {
    return [
      `📍 Open top attractions in ${cityName} on GIS Map`,
      `🎟️ Ticket booking & entry timings guide`,
      `🚌 Best weekend getaway itineraries from ${cityName}`
    ];
  }
  if (p.includes("metro") || p.includes("bus") || p.includes("transit") || p.includes("travel") || p.includes("airport") || p.includes("train")) {
    return [
      `🚇 Metro line map & ticket card guide`,
      `✈️ How to travel between Airport and City center`,
      `🚌 Local public bus routes & Smart Card pass`
    ];
  }
  if (p.includes("service") || p.includes("tax") || p.includes("certificate") || p.includes("water") || p.includes("complaint")) {
    return [
      `📑 Required documents & verification checklist`,
      `💳 Official online payment & portal link`,
      `🏢 Municipal ward office timings & helpdesk`
    ];
  }
  return [
    `📍 Locate key points of interest on GIS map`,
    `💡 Tips for newcomers moving to ${cityName}`,
    `🏛️ Top 5 things to do in ${cityName} this weekend`
  ];
}
