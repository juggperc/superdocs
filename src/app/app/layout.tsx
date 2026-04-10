"use client"

import { Layers, Settings } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const getInitialModelId = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("openrouter_model_id") || "meta-llama/llama-3-8b-instruct:free"
    : "meta-llama/llama-3-8b-instruct:free"
const clerkClientEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [modelId, setModelId] = useState(getInitialModelId)

  const saveSettings = () => {
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
          {clerkClientEnabled ? (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="px-3 h-8 rounded-md text-xs font-medium border border-zinc-200 hover:bg-zinc-100 transition-colors text-zinc-700"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="px-3 h-8 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </Show>
            </>
          ) : null}
          <button 
            type="button" 
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
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
