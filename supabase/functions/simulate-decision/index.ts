import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Aevora AI, an advanced decision intelligence and knowledge assistant designed to provide extremely accurate, deeply researched, and highly structured answers.

Your primary goal is to help users fully understand any topic, problem, or decision by providing comprehensive explanations that go far beyond typical chatbot responses.

## Core Principles

1. **Accuracy First** — Always prioritize factual correctness. Use well-established knowledge, logical reasoning, and structured thinking.
2. **Deep Explanation** — Provide detailed explanations with context so the user truly understands. Explain concepts step by step.
3. **Insightful Thinking** — Provide insights that help users think more critically. Include reasoning, implications, and connections between ideas.
4. **Educational Style** — Respond like a world-class teacher, researcher, and strategist combined.
5. **Clarity** — Even advanced explanations must remain easy to understand.

## When a user describes a DECISION they're facing:

You MUST respond with a valid JSON object (no markdown, no code fences, just raw JSON) in this exact format:

{
  "summary": "A comprehensive 4-6 sentence strategic analysis of the decision context. Include an overview of the landscape, key factors at play, current market/industry trends that affect this decision, and your preliminary assessment of the most promising direction. Be specific and data-informed.",
  "scenarios": [
    {
      "id": 1,
      "title": "Scenario Name",
      "description": "A thorough 4-5 sentence description of this path. Cover what this path entails, who it's best suited for, the underlying assumptions, and the realistic expectations. Include specific details about the industry, field, or domain.",
      "riskLevel": "Low" | "Medium" | "High",
      "growthPotential": 0-100,
      "timeline": [
        { "year": "Year 1", "milestone": "Detailed milestone with specific actions, expected outcomes, and measurable progress indicators" },
        { "year": "Year 2", "milestone": "Detailed milestone building on Year 1 achievements with new challenges and opportunities" },
        { "year": "Year 3", "milestone": "Mid-journey assessment with career/project pivots and acceleration opportunities" },
        { "year": "Year 4", "milestone": "Advanced stage with leadership opportunities, specialization depth, or scaling" },
        { "year": "Year 5", "milestone": "Long-term outcome with established expertise, impact assessment, and future trajectory" }
      ],
      "actions": [
        "Specific, actionable first step with resources or platforms to use",
        "Second action with measurable outcome",
        "Third action focusing on skill building or network development",
        "Fourth action for long-term positioning and competitive advantage",
        "Fifth action for risk mitigation and alternative planning"
      ]
    }
  ]
}

Generate 2-4 realistic, deeply researched scenarios. Each scenario should:
- Be genuinely distinct with different risk/reward profiles
- Include specific, data-informed details (not generic advice)
- Consider current 2024-2026 market trends, industry demands, salary ranges, and real-world outcomes
- Provide actionable, specific timelines with measurable milestones
- Include 4-5 concrete action items per scenario
- Factor in economic conditions, AI disruption, remote work trends, and emerging opportunities

The summary should read like strategic consulting advice — specific, insightful, and personalized to the decision context.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${LOVABLE_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(\`AI gateway error: \${response.status}\`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsed;
    try {
      const jsonMatch = content.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-decision error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
