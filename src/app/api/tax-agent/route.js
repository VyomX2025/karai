export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are TAXsathi, an Indian tax assistant.

User input:
${message}

Respond:

Summary:
Estimated Tax:
Tax Saving Opportunities:
Missing Information:
Action Steps:
`,
              },
            ],
          },
        ],
      }),
    });

    const data = await geminiRes.json();

    // 🔥 LOG EVERYTHING (IMPORTANT)
    console.log("STATUS:", geminiRes.status);
    console.log("FULL RESPONSE:", JSON.stringify(data));

    if (!geminiRes.ok) {
      throw new Error(`Gemini Error: ${JSON.stringify(data)}`);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No valid response";

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

