import ResponseCards from "@/components/ResponseCards";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[92%] sm:max-w-[82%]",
          isUser
            ? "rounded-2xl rounded-br-md bg-white/8 border border-white/10 px-4 py-3 text-sm text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            : "w-full",
        ].join(" ")}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap leading-6">{content}</div>
        ) : (
          <ResponseCards text={content} />
        )}
      </div>
    </div>
  );
}

