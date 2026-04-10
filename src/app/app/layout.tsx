"use client"

import { Layers, Settings, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [modelId, setModelId] = useState("meta-llama/llama-3-8b-instruct:free")

  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key")
    if (savedKey) setApiKey(savedKey)

    const savedModel = localStorage.getItem("openrouter_model_id")
    if (savedModel) setModelId(savedModel)
  }, [])

  const saveSettings = () => {
    localStorage.setItem("openrouter_api_key", apiKey)
    localStorage.setItem("openrouter_model_id", modelId)
    setSettingsOpen(false)
  }

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Top Suite Bar */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0 px-4 shadow-sm z-10 relative">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight mr-8">
            <Layers className="w-5 h-5 text-zinc-800" />
            superdocs
          </Link>
        </div>

        <div className="flex items-center gap-2 text-zinc-500">
          <button 
            type="button" 
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white ml-2 overflow-hidden shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your AI assistant preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="apiKey" className="text-right text-sm font-medium">
                OpenRouter Key
              </label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="col-span-3"
                type="password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="modelId" className="text-right text-sm font-medium">
                Model ID
              </label>
              <Input
                id="modelId"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="e.g. google/gemma-2-9b-it:free"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSettings}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}