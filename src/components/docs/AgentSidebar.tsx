"use client"

import { useState, useEffect } from "react"
import { Sparkles, Bot, ArrowRight, CheckCircle2, ChevronRight, ListTodo, PenTool, AlertCircle, X } from "lucide-react"

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
      setErrorMsg("Please configure your OpenRouter API key in settings.")
      return
    }

    setIsActive(true)
    setStep(1)
    if (onAgentStateChange) onAgentStateChange(true)

    try {
      const editor = editorRef?.current
      const currentContent = editor ? editor.getText() : ""

      setStep(2) // Parsing...
      
      // Build workspace context string
      let workspaceContext = ""
      if (workspaceAssets.length > 0) {
        workspaceContext = "\n\n--- WORKSPACE CONTEXT ---\nYou have access to other files in this workspace. Here is a summary of their contents:\n"
        workspaceAssets.forEach(asset => {
          let preview = ""
          if (asset.type === 'doc') {
            preview = asset.content.replace(/<[^>]*>?/gm, '').substring(0, 1000)
          } else if (asset.type === 'sheet') {
            try {
              const grid = JSON.parse(asset.content)
              if (Array.isArray(grid)) {
                preview = grid.slice(0, 10).map((row: string[]) => row.join(", ")).join("\n").substring(0, 1000)
              }
            } catch(e) {}
          } else if (asset.type === 'slide') {
            preview = "Slide presentation data"
          }
          if (preview) workspaceContext += `\n[${asset.title} (${asset.type})]:\n${preview}\n`
        })
      }
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelId,
          stream: true,
          messages: [
            {
              role: "system",
              content: "You are Warp, an advanced AI assistant within the Warp Suite (Docs, Sheets, Slides). Your goal is to help the user by generating text, data, or content to append to their current document based on their instructions. You have access to other documents in their workspace. Only output the final text to be added, without any conversational padding."
            },
            {
              role: "user",
              content: `Here is the current document content:\n\n${currentContent}${workspaceContext}\n\nUser request: ${promptToUse}`
            }
          ]
        })
      })

      setStep(3) // Executing...

      if (response.ok && response.body) {
        if (editor) {
          editor.chain().focus().insertContent(`\n\n`).run()
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || ""
          
          for (const line of lines) {
            if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6))
                const text = data.choices[0]?.delta?.content || ""
                if (text && editor) {
                  editor.commands.insertContent(text)
                }
              } catch (e) {
                // ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } else {
        console.error("OpenRouter API error:", await response.text())
        setErrorMsg("Failed to get a response from OpenRouter.")
        setIsActive(false)
        setStep(0)
        if (onAgentStateChange) onAgentStateChange(false)
        return
      }

      setStep(4) // Re-evaluating...
      
      setTimeout(() => {
        setStep(6) // Done
        setTimeout(() => {
          setIsActive(false)
          setStep(0)
          setPrompt("")
          if (onAgentStateChange) onAgentStateChange(false)
        }, 2000)
      }, 1000)

    } catch (error) {
      console.error(error)
      setErrorMsg("An error occurred during AI processing.")
      setIsActive(false)
      setStep(0)
      if (onAgentStateChange) onAgentStateChange(false)
    }
  }

  return (
    <aside className="w-80 border-l border-zinc-200 bg-[#f9f9fb] flex flex-col shrink-0 z-10 transition-all hidden lg:flex relative">
      {/* Header */}
      <div className="h-14 border-b border-zinc-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2 font-medium text-zinc-900">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Warp Assistant
        </div>
        <button type="button" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Menu options"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
        </button>
      </div>

      {/* Workspace Context Indicator */}
      <div className="bg-purple-50 text-purple-700 text-xs px-6 py-2 border-b border-purple-100 flex items-center gap-2 shrink-0">
        <Bot className="w-3 h-3" />
        <span>Connected to {workspaceAssets.length} workspace files</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {errorMsg && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-3 mb-6 shadow-sm animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isActive && step === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-[240px] mx-auto mt-20">
            <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Bot className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg mb-2">I'm standing by</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Select some text to summarize, or ask me to draft a new section for your roadmap.</p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                type="button" 
                onClick={() => startAgent(undefined, "Summarize this page")}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3 text-sm text-zinc-700 font-medium hover:border-zinc-300 hover:shadow-sm transition-all text-left">
                <ListTodo className="w-4 h-4 text-zinc-500" />
                Summarize this page
              </button>
              <button 
                type="button" 
                onClick={() => startAgent(undefined, "Change the tone of the document to be highly professional and formal")}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3 text-sm text-zinc-700 font-medium hover:border-zinc-300 hover:shadow-sm transition-all text-left">
                <PenTool className="w-4 h-4 text-zinc-500" />
                Change tone to professional
              </button>
              <button 
                type="button" 
                onClick={() => startAgent(undefined, "Generate 5 actionable next steps based on this document")}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3 text-sm text-zinc-700 font-medium hover:border-zinc-300 hover:shadow-sm transition-all text-left">
                <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                Generate action items
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mt-4">
             <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
               <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 uppercase tracking-wider mb-6">
                 <Sparkles className="w-4 h-4 text-zinc-900" />
                 Active Session
               </div>
               
               <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                  
                  {/* Step 1: Planning */}
                  <div className={`relative flex items-center gap-4 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white z-10 ${step === 1 ? 'border-zinc-900 animate-pulse' : 'border-zinc-900 text-zinc-900'}`}>
                      {step > 1 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step === 1 ? 'text-zinc-900' : 'text-zinc-500'}`}>Planning...</p>
                    </div>
                  </div>

                  {/* Step 2: Parsing DOM */}
                  <div className={`relative flex items-center gap-4 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white z-10 ${step === 2 ? 'border-zinc-900 animate-pulse' : (step > 2 ? 'border-zinc-900 text-zinc-900' : 'border-zinc-300')}`}>
                      {step > 2 ? <CheckCircle2 className="w-3 h-3" /> : (step === 2 ? <div className="w-2 h-2 bg-zinc-900 rounded-full" /> : null)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step === 2 ? 'text-zinc-900' : 'text-zinc-500'}`}>Parsing Editor Content...</p>
                    </div>
                  </div>

                  {/* Step 3: Executing */}
                  <div className={`relative flex items-start gap-4 transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white z-10 mt-0.5 ${step === 3 ? 'border-zinc-900 animate-pulse' : (step > 3 ? 'border-zinc-900 text-zinc-900' : 'border-zinc-300')}`}>
                      {step > 3 ? <CheckCircle2 className="w-3 h-3" /> : (step === 3 ? <div className="w-2 h-2 bg-zinc-900 rounded-full" /> : null)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step === 3 ? 'text-zinc-900' : 'text-zinc-500'}`}>Next Step: Appending AI Draft</p>
                      {step === 3 && (
                        <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" /> OpenRouter generation running.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Re-evaluating */}
                  <div className={`relative flex items-center gap-4 transition-opacity duration-300 ${step >= 4 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white z-10 ${step === 4 ? 'border-zinc-900 animate-pulse' : (step > 4 ? 'border-zinc-900 text-zinc-900' : 'border-zinc-300')}`}>
                      {step > 4 ? <CheckCircle2 className="w-3 h-3" /> : (step === 4 ? <div className="w-2 h-2 bg-zinc-900 rounded-full" /> : null)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step === 4 ? 'text-zinc-900' : 'text-zinc-500'}`}>Re-parsing Editor...</p>
                    </div>
                  </div>

                  {/* Done */}
                  <div className={`relative flex items-center gap-4 transition-opacity duration-300 ${step >= 6 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-zinc-100 border-zinc-900 text-zinc-900 z-10">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">Goal Completed</p>
                    </div>
                  </div>

               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-200 mt-auto shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <form onSubmit={startAgent} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask superdocs AI..."
            className="w-full bg-[#f4f4f5] border border-zinc-200 rounded-xl px-4 py-3 pr-12 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all"
            disabled={isActive}
          />
          <button 
            type="submit" 
            disabled={!prompt.trim() || isActive}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="flex justify-end mt-2">
          <span className="text-[10px] text-zinc-400 font-medium">⌘ + J</span>
        </div>
      </div>
    </aside>
  )
}