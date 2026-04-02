export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // stable + powerful
        messages: [
          {
            role: "system",
            content: `You are TAXsathi, an expert Indian tax assistant.

You:
- Estimate tax
- Suggest deductions (80C, 80D, HRA)
- Ask missing info
- Give actionable steps

Respond in format:

Summary:
Estimated Tax:
Tax Saving Opportunities:
Missing Information:
Action Steps:`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log("GROQ RESPONSE:", data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const text = data?.choices?.[0]?.message?.content || "No response";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("FINAL ERROR:", error);

    return new Response(
      JSON.stringify({
        text: `Summary: AI service error
Estimated Tax: —
Tax Saving Opportunities: —
Missing Information: —
Action Steps: Try again`,
      }),
      { status: 200 }
    );
  }
}

