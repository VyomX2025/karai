export const runtime = "nodejs";

function calculateTax(income) {
  let tax = 0;

  // Expanded slab engine (new regime style)
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 50000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 80000 + (income - 1200000) * 0.2;

  tax = 140000 + (income - 1500000) * 0.3;
  return tax;
}

function calculateBusinessTax(income) {
  // Basic business estimation with presumptive suggestion
  const baseTax = calculateTax(income);
  const presumptiveIncome = income * 0.06; // indicative digital receipts treatment
  const presumptiveTax = calculateTax(presumptiveIncome);
  return {
    baseTax,
    presumptiveIncome,
    presumptiveTax,
  };
}

function extractIncome(text) {
  // Supports values like: 12 lakh, 12L, 1200000, 50k, 1 crore
  const match = text.match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|l|lac|lakhs|k)?/i);
  if (!match) return null;

  let value = Number(match[1]);
  const unit = (match[2] || "").toLowerCase();

  if (["crore", "cr"].includes(unit)) value *= 10000000;
  else if (["lakh", "l", "lac", "lakhs"].includes(unit)) value *= 100000;
  else if (unit === "k") value *= 1000;

  return Math.round(value);
}

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function generateResponse(message) {
  const msg = String(message || "").toLowerCase();

  const incomeKeywords = [
    "income",
    "salary",
    "ctc",
    "annual",
    "package",
    "pay",
    "tax slab",
  ];
  const businessKeywords = [
    "business",
    "freelance",
    "consulting",
    "turnover",
    "msme",
    "startup",
    "profit",
    "proprietor",
  ];
  const gstKeywords = ["gst", "input tax credit", "itc", "gstr", "gstin"];
  const deductionKeywords = [
    "deduction",
    "save tax",
    "80c",
    "80d",
    "hra",
    "nps",
    "elss",
    "ppf",
  ];

  const income = extractIncome(msg);

  // Business income and MSME/startup guidance
  if (hasAny(msg, businessKeywords)) {
    if (!income) {
      return {
        summary: "Business tax estimate needs your annual turnover/profit.",
        tax: "—",
        savings:
          "Consider MSME registration, startup DPIIT benefits, and presumptive taxation (44AD/44ADA) if eligible.",
        actions:
          "Share yearly turnover/profit, business type, and expense profile for a better estimate.",
      };
    }

    const business = calculateBusinessTax(income);
    return {
      summary: `Business income considered: ₹${income.toLocaleString()}.`,
      tax: `Regular estimate: ₹${business.baseTax.toLocaleString()} | Presumptive estimate (indicative): ₹${business.presumptiveTax.toLocaleString()}`,
      savings:
        "Use eligible business expenses, depreciation, MSME schemes, and startup incentives where applicable.",
      actions:
        "Check 44AD/44ADA eligibility, maintain invoices, and review GST ITC claims.",
    };
  }

  // Income tax queries
  if (hasAny(msg, incomeKeywords)) {
    if (!income) {
      return {
        summary: "Need your income to calculate tax.",
        tax: "—",
        savings: "—",
        actions: "Tell me your yearly income (example: 12 lakh).",
      };
    }

    const tax = calculateTax(income);
    return {
      summary: `Based on income ₹${income.toLocaleString()}.`,
      tax: `₹${tax.toLocaleString()}`,
      savings: "Use 80C, 80D, HRA, and NPS to reduce tax outgo.",
      actions: "Invest in ELSS/PPF, optimize HRA, and review insurance deductions.",
    };
  }

  // GST
  if (hasAny(msg, gstKeywords)) {
    return {
      summary: "GST applies to taxable supply of goods/services.",
      tax: "Depends on turnover and GST rate slab",
      savings: "Claim eligible input tax credit (ITC).",
      actions: "Register if threshold applies and file returns on time.",
    };
  }

  // Deductions
  if (hasAny(msg, deductionKeywords)) {
    return {
      summary: "You can reduce tax with structured deductions.",
      tax: "—",
      savings: "80C (up to ₹1.5L), 80D (health insurance), HRA, NPS (80CCD(1B)).",
      actions: "Plan investments before year-end and keep proof for filing.",
    };
  }

  // Startup/MSME specific nudge
  if (msg.includes("startup") || msg.includes("msme")) {
    return {
      summary: "Startup/MSME tax planning can materially reduce liabilities.",
      tax: "Depends on entity type and profits",
      savings: "Explore MSME Udyam benefits, startup incentives, and eligible deductions.",
      actions: "Share legal entity, turnover, and profit to get a tailored plan.",
    };
  }

  // Fallback
  return {
    summary:
      "I can help with income tax, business tax, GST, deductions, and startup/MSME tax planning.",
    tax: "—",
    savings: "—",
    actions: "Try: 'My salary is 14 lakh' or 'My business turnover is 50 lakh'.",
  };
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    const result = generateResponse(message);

    const text = `
Summary: ${result.summary}
Estimated Tax: ${result.tax}
Tax Saving Opportunities: ${result.savings}
Missing Information: —
Action Steps: ${result.actions}
`;

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        text: "Summary: Error\nEstimated Tax: —\nAction Steps: Retry",
      }),
      { status: 200 }
    );
  }
}

