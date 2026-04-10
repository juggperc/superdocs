import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, FileText, Grid, Presentation } from "lucide-react"

export default function WarpApp({ 
  workspace, 
  workspaceAssets 
}: { 
  workspace: any; 
  workspaceAssets: any[] 
}) {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: `Hello! I'm Warp, your AI assistant for **${workspace?.name || 'Workspace'}**. I have access to all your docs, sheets, and slides here. How can I help you today?` }
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const newMsg = input
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: newMsg }])
    setIsStreaming(true)

    // Dummy response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'm analyzing your request against ${workspaceAssets.length} assets in this workspace. (This is a UI prototype for the Warp App).` 
      }])
      setIsStreaming(false)
    }, 1000)
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div className="absolute top-0 left-0 right-0 border-b border-zinc-200 p-4 flex items-center gap-3 bg-white/80 backdrop-blur-sm z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900">Warp AI</h2>
          <p className="text-xs text-zinc-500">Connected to {workspace?.name || 'Workspace'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 sm:px-6 space-y-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">
          {messages.map((msg, i) => (
            <div key={msg.content} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-100 text-zinc-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                msg.role === 'user' 
                  ? 'bg-zinc-900 text-white rounded-tr-sm' 
                  : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask Warp to analyze ${workspaceAssets.length} assets...`}
              className="flex-1 bg-white border border-zinc-200 shadow-sm rounded-full pl-5 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-zinc-900"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-zinc-400">Warp has full context of {workspace?.name || 'this workspace'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
