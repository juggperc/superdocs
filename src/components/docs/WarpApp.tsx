import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"

export default function WarpApp({
  workspace,
  workspaceAssets,
}: {
  workspace: any
  workspaceAssets: any[]
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: `Connected to **${workspace?.name || "Workspace"}** with ${workspaceAssets.length} files. I can read and analyze across all of them. What do you need?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMsg = input
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setIsStreaming(true)

    const apiKey = localStorage.getItem("openrouter_api_key")
    const modelId = localStorage.getItem("openrouter_model_id") || "meta-llama/llama-3-8b-instruct:free"

    if (!apiKey) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Add your OpenRouter API key in Settings first." }])
      setIsStreaming(false)
      return
    }

    let wsContext = ""
    workspaceAssets.forEach((asset) => {
      let preview = ""
      if (asset.type === "doc") preview = asset.content?.replace(/<[^>]*>?/gm, "").substring(0, 800) || ""
      else if (asset.type === "sheet") {
        try {
          const grid = JSON.parse(asset.content)
          if (Array.isArray(grid)) preview = grid.slice(0, 8).map((row: string[]) => row.join(", ")).join("\n").substring(0, 800)
        } catch {}
      } else if (asset.type === "slide") preview = "Slide presentation data"
      if (preview) wsContext += `\n[${asset.title} (${asset.type})]:\n${preview}\n`
    })

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
          stream: true,
          messages: [
            { role: "system", content: "You are Warp, an AI assistant within Warp Suite. You have access to the user's workspace files. Be concise, direct, and helpful. Format responses with markdown when useful." },
            ...(wsContext ? [{ role: "system", content: `Workspace files:\n${wsContext}` }] : []),
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Failed to reach OpenRouter. Check your API key and try again." }])
        setIsStreaming(false)
        return
      }

      let assistantText = ""
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6))
              const text = data.choices[0]?.delta?.content || ""
              if (text) {
                assistantText += text
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: "assistant", content: assistantText }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }])
    }

    setIsStreaming(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="absolute top-0 left-0 right-0 glass-subtle border-b border-white/[0.04] p-3 flex items-center gap-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-sm shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-foreground">Warp AI</h2>
          <p className="text-[10px] text-muted-foreground">{workspace?.name || "Workspace"} &middot; {workspaceAssets.length} files</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 space-y-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 w-full">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-white/[0.06]" : "bg-primary/15"}`}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5 text-muted-foreground" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
              </div>
              <div
                className={`px-3.5 py-2.5 rounded-xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground rounded-tr-sm border border-primary/10"
                    : "glass text-foreground/90 rounded-tl-sm"
                }`}
              >
                {msg.content || (isStreaming && i === messages.length - 1 ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : null)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 glass-subtle border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto relative">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Warp anything..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-4 pr-12 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20 transition-all text-sm text-foreground placeholder:text-muted-foreground/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-1.5 top-1.5 bottom-1.5 w-8 bg-primary hover:bg-primary/90 disabled:bg-white/[0.06] disabled:text-muted-foreground text-primary-foreground rounded-md flex items-center justify-center transition-all glow-sm disabled:shadow-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
