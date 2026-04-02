import { NextResponse } from "next/server";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const SYSTEM_PROMPT = `You are Kar AI, an expert Indian tax assistant.

You:

* Estimate tax
* Suggest deductions (80C, 80D, HRA)
* Ask missing info
* Give actionable steps

Respond in format:

Summary:
Estimated Tax:
Tax Saving Opportunities:
Missing Information:
Action Steps:`;

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      console.error("Invalid JSON body:", e);
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const message = typeof payload?.message === "string" ? payload.message : "";
    if (!message.trim()) {
      return NextResponse.json(
        { error: "Missing required field: message." },
        { status: 400 }
      );
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUSER:\n${message.trim()}`,
            },
          ],
        },
      ],
    };

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("Gemini API error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Upstream AI service error. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => null);
    const text =
      data?.candidates?.[0]?.content?.parts?.find((p) => typeof p?.text === "string")
        ?.text ?? "";

    if (!text.trim()) {
      return NextResponse.json({
        text: "Summary:\nI couldn't generate a response just now.\nEstimated Tax:\n—\nTax Saving Opportunities:\n—\nMissing Information:\n—\nAction Steps:\nPlease try again in a moment.",
      });
    }

    return NextResponse.json({ text });
  } catch (e) {
    console.error("tax-agent route crash prevented:", e);
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}

