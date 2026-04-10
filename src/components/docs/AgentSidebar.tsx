"use client"

import { useState } from "react"
import { Sparkles, Bot, CheckCircle2, ChevronRight, ListTodo, PenTool, AlertCircle, X } from "lucide-react"

interface AgentSidebarProps {
  onAgentStateChange?: (isActive: boolean) => void
  editorRef?: any
  workspaceAssets?: any[]
}

export default function AgentSidebar({ onAgentStateChange, editorRef, workspaceAssets = [] }: AgentSidebarProps) {
  const [isActive, setIsActive] = useState(false)
  const [step, setStep] = useState<number>(0)
  const [prompt, setPrompt] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const startAgent = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault()
    const promptToUse = customPrompt || prompt
    if (!promptToUse.trim()) return

    setErrorMsg(null)
    const apiKey = localStorage.getItem("openrouter_api_key")
    const modelId = localStorage.getItem("openrouter_model_id") || "meta-llama/llama-3-8b-instruct:free"

    if (!apiKey) {
      setErrorMsg("Add your OpenRouter API key in Settings.")
      return
    }

    setIsActive(true)
    setStep(1)
    onAgentStateChange?.(true)

    try {
      const editor = editorRef?.current
      const currentContent = editor ? editor.getText() : ""

      setStep(2)

      let workspaceContext = ""
      if (workspaceAssets.length > 0) {
        workspaceContext = "\n\n--- WORKSPACE CONTEXT ---\n"
        workspaceAssets.forEach((asset) => {
          let preview = ""
          if (asset.type === "doc") preview = asset.content?.replace(/<[^>]*>?/gm, "").substring(0, 1000) || ""
          else if (asset.type === "sheet") {
            try {
              const grid = JSON.parse(asset.content)
              if (Array.isArray(grid)) preview = grid.slice(0, 10).map((row: string[]) => row.join(", ")).join("\n").substring(0, 1000)
            } catch {}
          } else if (asset.type === "slide") preview = "Slide presentation data"
          if (preview) workspaceContext += `\n[${asset.title} (${asset.type})]:\n${preview}\n`
        })
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
          stream: true,
          messages: [
            { role: "system", content: "You are Warp, an AI assistant in Warp Suite. Generate content to append to the user's document. Output only the final text, no conversational padding." },
            { role: "user", content: `Current document:\n\n${currentContent}${workspaceContext}\n\nRequest: ${promptToUse}` },
          ],
        }),
      })

      setStep(3)

      if (response.ok && response.body) {
        if (editor) editor.chain().focus().insertContent("\n\n").run()

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
                if (text && editor) editor.commands.insertContent(text)
              } catch {}
            }
          }
        }
      } else {
        setErrorMsg("Failed to get a response from OpenRouter.")
        setIsActive(false)
        setStep(0)
        onAgentStateChange?.(false)
        return
      }

      setStep(4)
      setTimeout(() => {
        setStep(6)
        setTimeout(() => {
          setIsActive(false)
          setStep(0)
          setPrompt("")
          onAgentStateChange?.(false)
        }, 1500)
      }, 800)
    } catch {
      setErrorMsg("An error occurred during AI processing.")
      setIsActive(false)
      setStep(0)
      onAgentStateChange?.(false)
    }
  }

  const steps = [
    { n: 1, label: "Planning" },
    { n: 2, label: "Reading content" },
    { n: 3, label: "Generating" },
    { n: 4, label: "Finalizing" },
    { n: 6, label: "Complete" },
  ]

  return (
    <aside className="w-72 bg-[oklch(0.12_0.005_260)] border-l border-white/[0.06] flex flex-col shrink-0 z-10 transition-all hidden lg:flex relative">
      <div className="h-10 border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Warp Assistant
        </div>
        <span className="text-[9px] text-muted-foreground/60 font-mono">{workspaceAssets.length} files</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {errorMsg && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg flex items-start gap-2 mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400/60 hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {!isActive && step === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-[200px] mx-auto">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5">Ready</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Ask me to edit, summarize, or generate content for your document.
            </p>

            <div className="w-full flex flex-col gap-2">
              {[
                { icon: ListTodo, label: "Summarize this page", prompt: "Summarize this page" },
                { icon: PenTool, label: "Make it professional", prompt: "Rewrite the document in a professional, formal tone" },
                { icon: CheckCircle2, label: "Generate action items", prompt: "Generate 5 actionable next steps based on this document" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => startAgent(undefined, item.prompt)}
                  className="w-full glass rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-muted-foreground font-medium hover:bg-white/[0.06] hover:text-foreground transition-all text-left"
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full mt-2">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-foreground uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3 text-primary" />
                Active Session
              </div>

              <div className="flex flex-col gap-3 relative">
                <div className="absolute left-[9px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/20 via-white/[0.06] to-transparent" />

                {steps.map(({ n, label }) => {
                  if (step < n && n !== 6) return null
                  if (n === 6 && step < 6) return null

                  return (
                    <div key={n} className="relative flex items-center gap-3">
                      <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        step === n && n !== 6
                          ? "bg-primary/20 border border-primary/40"
                          : step > n || n === 6
                          ? "bg-primary/15 border border-primary/30"
                          : "bg-white/[0.04] border border-white/[0.08]"
                      }`}>
                        {step > n || n === 6 ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                        ) : step === n ? (
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${step === n ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                        {step === 3 && n === 3 && (
                          <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                            <ChevronRight className="w-2.5 h-2.5" /> Streaming from OpenRouter
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/[0.06] mt-auto shrink-0">
        <form onSubmit={startAgent} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Warp..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-9 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20 transition-all"
            disabled={isActive}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isActive}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary hover:bg-primary/90 disabled:bg-white/[0.04] disabled:text-muted-foreground text-primary-foreground rounded-md flex items-center justify-center transition-all text-xs"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </form>
      </div>
    </aside>
  )
}
