"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export default function WarpApp({
  workspace,
  workspaceAssets,
}: {
  workspace: any
  workspaceAssets: any[]
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: `Connected to **${workspace?.name || "Workspace"}** with ${workspaceAssets.length} files. I can read and analyze across all of them. What do you need?`,
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMsg = input.trim()
    setInput("")
    if (inputRef.current) inputRef.current.style.height = "auto"

    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: userMsg, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    const apiKey = localStorage.getItem("openrouter_api_key")
    const modelId = localStorage.getItem("openrouter_model_id") || "meta-llama/llama-3-8b-instruct:free"

    if (!apiKey) {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Add your OpenRouter API key in Settings first.", timestamp: Date.now() }])
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

    const assistantId = `asst-${Date.now()}`

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
          stream: true,
          messages: [
            { role: "system", content: "You are Warp, an AI assistant within Superdocs. You have access to the user's workspace files. Be concise, direct, and helpful. Format responses with markdown when useful." },
            ...(wsContext ? [{ role: "system", content: `Workspace files:\n${wsContext}` }] : []),
            ...messages.filter((m) => m.id !== "init").map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "Failed to reach OpenRouter. Check your API key and try again.", timestamp: Date.now() }])
        setIsStreaming(false)
        return
      }

      let assistantText = ""
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }])

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
                const finalText = assistantText
                setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: finalText } : m))
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "Connection error. Please try again.", timestamp: Date.now() }])
    }

    setIsStreaming(false)
  }, [input, isStreaming, messages, workspaceAssets])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  const clearChat = () => {
    setMessages([{
      id: "init",
      role: "assistant",
      content: `Chat cleared. Connected to **${workspace?.name || "Workspace"}** with ${workspaceAssets.length} files.`,
      timestamp: Date.now(),
    }])
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="h-12 border-b border-white/[0.06] bg-[oklch(0.12_0.005_260)] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center glow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground leading-none">Warp AI</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">{workspace?.name} · {workspaceAssets.length} files</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={clearChat} title="Clear chat" className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-5 w-full">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} group`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "user" ? "bg-white/[0.06] border border-white/[0.06]" : "bg-primary/10 border border-primary/10"
              }`}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5 text-muted-foreground" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
              </div>
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground rounded-tr-md border border-primary/10"
                    : "bg-[oklch(0.16_0.005_260)] text-foreground/90 rounded-tl-md border border-white/[0.06]"
                }`}>
                  {msg.content || (isStreaming && msg === messages[messages.length - 1] ? (
                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : null)}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-muted-foreground/40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.role === "assistant" && msg.content && (
                    <button type="button" onClick={() => copyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-muted-foreground transition-all p-0.5 rounded">
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/[0.06] bg-[oklch(0.12_0.005_260)] p-3">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Warp anything... (Shift+Enter for new line)"
              rows={1}
              className="w-full bg-[oklch(0.15_0.005_260)] border border-white/[0.08] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20 transition-all text-sm text-foreground placeholder:text-muted-foreground/40 resize-none overflow-hidden"
            />
            <button type="submit" disabled={!input.trim() || isStreaming}
              className="absolute right-2 bottom-2 w-8 h-8 bg-primary hover:bg-primary/90 disabled:bg-white/[0.06] disabled:text-muted-foreground text-primary-foreground rounded-lg flex items-center justify-center transition-all glow-sm disabled:shadow-none">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
