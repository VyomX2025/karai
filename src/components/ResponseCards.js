function cleanSection(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function parseTaxsathiResponse(raw) {
  const text = cleanSection(raw);
  const labels = [
    "Summary",
    "Estimated Tax",
    "Tax Saving Opportunities",
    "Missing Information",
    "Action Steps",
  ];

  const sections = Object.fromEntries(labels.map((l) => [l, ""]));

  const lines = text.split("\n");
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    const found = labels.find(
      (l) => trimmed.toLowerCase() === `${l.toLowerCase()}:`
    );
    if (found) {
      current = found;
      continue;
    }
    if (!current) continue;
    sections[current] += (sections[current] ? "\n" : "") + line;
  }

  const fallback =
    !sections["Summary"] &&
    !sections["Estimated Tax"] &&
    !sections["Tax Saving Opportunities"] &&
    !sections["Action Steps"];
  if (fallback) {
    sections["Summary"] = text;
  }

  for (const k of labels) sections[k] = cleanSection(sections[k]);
  return sections;
}

function Card({ title, children, tone = "neutral" }) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10"
      : tone === "highlight"
      ? "border-emerald-400/30 bg-white/5"
      : "border-white/10 bg-white/5";

  return (
    <section className={`glass rounded-2xl p-5 border ${toneClasses}`}>
      <div className="text-xs tracking-wide uppercase text-zinc-400">
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-zinc-100 whitespace-pre-wrap">
        {children}
      </div>
    </section>
  );
}

export default function ResponseCards({ text }) {
  const s = parseTaxsathiResponse(text);
  const hasAny =
    s["Summary"] ||
    s["Estimated Tax"] ||
    s["Tax Saving Opportunities"] ||
    s["Action Steps"];

  if (!hasAny) {
    return (
      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-sm text-zinc-200 whitespace-pre-wrap">{text}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {!!s["Summary"] && <Card title="Summary">{s["Summary"]}</Card>}

      {!!s["Estimated Tax"] && (
        <Card title="Estimated Tax" tone="highlight">
          <div className="text-2xl font-semibold tracking-tight text-emerald-300">
            {s["Estimated Tax"]}
          </div>
        </Card>
      )}

      {!!s["Tax Saving Opportunities"] && (
        <Card title="Tax Saving Opportunities" tone="success">
          {s["Tax Saving Opportunities"]}
        </Card>
      )}

      {!!s["Action Steps"] && <Card title="Action Steps">{s["Action Steps"]}</Card>}

      {!!s["Missing Information"] && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300 whitespace-pre-wrap">
          <span className="text-zinc-400 uppercase tracking-wide">
            Missing Information
          </span>
          <div className="mt-2">{s["Missing Information"]}</div>
        </div>
      )}
    </div>
  );
}

