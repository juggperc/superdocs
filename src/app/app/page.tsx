"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/docs/Sidebar"
import Editor from "@/components/docs/Editor"
import SheetEditor from "@/components/docs/SheetEditor"
import SlideEditor from "@/components/docs/SlideEditor"
import AgentSidebar from "@/components/docs/AgentSidebar"
import WarpApp from "@/components/docs/WarpApp"
import {
  Trash2,
  Edit2,
  X,
  FileText,
  Grid,
  Presentation,
  Sparkles,
  Plus,
  Layers,
  ChevronRight,
  MoreVertical,
  Key,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type AssetType = "doc" | "sheet" | "slide" | "warp"

export interface Asset {
  id: string
  workspaceId: string
  type: AssetType
  title: string
  content: any
  lastModified: number
}

export interface Workspace {
  id: string
  name: string
}

const assetMeta: Record<AssetType, { icon: typeof FileText; color: string; glowClass: string; bgClass: string; label: string }> = {
  doc: { icon: FileText, color: "text-blue-400", glowClass: "group-hover:shadow-[0_0_25px_oklch(0.65_0.15_250/10%)]", bgClass: "bg-blue-400/10", label: "Document" },
  sheet: { icon: Grid, color: "text-emerald-400", glowClass: "group-hover:shadow-[0_0_25px_oklch(0.70_0.15_160/10%)]", bgClass: "bg-emerald-400/10", label: "Sheet" },
  slide: { icon: Presentation, color: "text-amber-400", glowClass: "group-hover:shadow-[0_0_25px_oklch(0.70_0.15_60/10%)]", bgClass: "bg-amber-400/10", label: "Slides" },
  warp: { icon: Sparkles, color: "text-primary", glowClass: "group-hover:shadow-[0_0_25px_oklch(0.65_0.18_260/10%)]", bgClass: "bg-primary/10", label: "Warp Chat" },
}

function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function App() {
  const [isAgentActive, setIsAgentActive] = useState(false)
  const editorRef = useRef<any>(null)

  const [assets, setAssets] = useState<Asset[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)

  const [activeAssetId, setActiveAssetId] = useState<string | null>(null)
  const [openAssetIds, setOpenAssetIds] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<"library" | "editor">("library")
  const [isMounted, setIsMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [modelId, setModelId] = useState("")

  useEffect(() => {
    setIsMounted(true)
    const savedAssets = localStorage.getItem("warp_assets")
    const savedWorkspaces = localStorage.getItem("warp_workspaces")
    setApiKey(localStorage.getItem("openrouter_api_key") || "")
    setModelId(localStorage.getItem("openrouter_model_id") || "meta-llama/llama-3-8b-instruct:free")

    let initialWorkspaces: Workspace[] = []
    if (savedWorkspaces) {
      try {
        initialWorkspaces = JSON.parse(savedWorkspaces)
        setWorkspaces(initialWorkspaces)
        if (initialWorkspaces.length > 0) setActiveWorkspaceId(initialWorkspaces[0].id)
      } catch {}
    } else {
      initialWorkspaces = [{ id: "ws-1", name: "My Workspace" }]
      setWorkspaces(initialWorkspaces)
      setActiveWorkspaceId("ws-1")
      localStorage.setItem("warp_workspaces", JSON.stringify(initialWorkspaces))
    }

    if (savedAssets) {
      try { setAssets(JSON.parse(savedAssets)) } catch {}
    } else {
      const initialDoc: Asset = {
        id: "doc-" + Date.now(),
        workspaceId: initialWorkspaces[0].id,
        type: "doc",
        title: "Getting Started",
        content: `<h2>Welcome to Superdocs</h2><p>This is your first document. Open the Warp Assistant on the right to try AI-powered editing.</p><h3>Quick Start</h3><p>1. Click the <strong>+</strong> button to create docs, sheets, or slides.</p><p>2. Open <strong>Settings</strong> (gear icon) to add your OpenRouter API key.</p><p>3. Use the <strong>Warp Assistant</strong> panel to edit with AI across your workspace.</p><p>4. Click <strong>Export .docx</strong> in the toolbar to download your document as a Word file.</p>`,
        lastModified: Date.now(),
      }
      setAssets([initialDoc])
      localStorage.setItem("warp_assets", JSON.stringify([initialDoc]))
    }
  }, [])

  useEffect(() => {
    if (isMounted) localStorage.setItem("warp_assets", JSON.stringify(assets))
  }, [assets, isMounted])

  useEffect(() => {
    if (isMounted) localStorage.setItem("warp_workspaces", JSON.stringify(workspaces))
  }, [workspaces, isMounted])

  const handleNewAsset = useCallback(
    (type: AssetType) => {
      if (!activeWorkspaceId) return
      const newAsset: Asset = {
        id: `${type}-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        type,
        title: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: "",
        lastModified: Date.now(),
      }
      setAssets((prev) => [newAsset, ...prev])
      openAsset(newAsset.id)
    },
    [activeWorkspaceId]
  )

  const openAsset = (id: string) => {
    setOpenAssetIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setActiveAssetId(id)
    setCurrentView("editor")
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newOpen = openAssetIds.filter((x) => x !== id)
    setOpenAssetIds(newOpen)
    if (activeAssetId === id) {
      if (newOpen.length > 0) setActiveAssetId(newOpen[newOpen.length - 1])
      else { setActiveAssetId(null); setCurrentView("library") }
    }
  }

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates, lastModified: Date.now() } : a)))
  }

  const handleDeleteAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAssets((prev) => prev.filter((a) => a.id !== id))
    if (openAssetIds.includes(id)) closeTab(id, e)
  }

  const handleRenameAsset = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTitle = prompt("Enter new title:", currentTitle)
    if (newTitle?.trim()) handleUpdateAsset(id, { title: newTitle.trim() })
  }

  const saveSettings = () => {
    localStorage.setItem("openrouter_api_key", apiKey)
    localStorage.setItem("openrouter_model_id", modelId)
    setShowSettings(false)
  }

  const activeAsset = assets.find((a) => a.id === activeAssetId)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const workspaceAssets = assets.filter((a) => a.workspaceId === activeWorkspaceId)

  if (!isMounted) return null

  return (
    <div className="flex flex-1 w-full h-full relative overflow-hidden bg-background text-foreground font-sans">
      <Sidebar
        onNewDoc={() => handleNewAsset("doc")}
        onViewLibrary={() => { setCurrentView("library"); setActiveAssetId(null) }}
        currentView={currentView}
        onOpenSettings={() => setShowSettings(true)}
      />

      {currentView === "library" ? (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-56 border-r border-white/[0.06] bg-[oklch(0.12_0.005_260)] flex flex-col hidden md:flex">
            <div className="p-4 flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <span className="font-semibold text-sm tracking-tight">Superdocs</span>
            </div>
            <div className="px-3 pb-2 flex items-center justify-between group">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Workspaces</span>
              <button type="button" onClick={() => { const n = prompt("Workspace name:"); if (n?.trim()) { const ws = { id: `ws-${Date.now()}`, name: n.trim() }; setWorkspaces((p) => [...p, ws]); setActiveWorkspaceId(ws.id) } }} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all rounded hover:bg-white/[0.06]">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {workspaces.map((ws) => (
                <button type="button" key={ws.id} onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between group ${activeWorkspaceId === ws.id ? "bg-white/[0.08] font-medium text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"}`}>
                  <div className="flex items-center gap-2 truncate">
                    <Layers className={`w-3.5 h-3.5 shrink-0 ${activeWorkspaceId === ws.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="truncate text-[13px]">{ws.name}</span>
                  </div>
                  {activeWorkspaceId === ws.id && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 sm:p-10 lg:p-14">
            <div className="max-w-5xl mx-auto">
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">{activeWorkspace?.name || "Library"}</h1>
                  <p className="text-sm text-muted-foreground">{workspaceAssets.length} {workspaceAssets.length === 1 ? "file" : "files"}</p>
                </div>
                <div className="flex items-center gap-1 glass rounded-lg p-1">
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset("warp")} className="text-primary hover:text-primary hover:bg-primary/10 font-medium h-8 px-3 gap-1.5 text-xs rounded-md"><Sparkles className="w-3.5 h-3.5" /> Warp</Button>
                  <div className="w-px h-4 bg-white/[0.08]" />
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset("doc")} className="text-muted-foreground hover:text-foreground h-8 px-3 gap-1.5 text-xs rounded-md"><FileText className="w-3.5 h-3.5" /> Doc</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset("sheet")} className="text-muted-foreground hover:text-foreground h-8 px-3 gap-1.5 text-xs rounded-md"><Grid className="w-3.5 h-3.5" /> Sheet</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset("slide")} className="text-muted-foreground hover:text-foreground h-8 px-3 gap-1.5 text-xs rounded-md"><Presentation className="w-3.5 h-3.5" /> Slide</Button>
                </div>
              </header>

              {workspaceAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 glass rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                    <Layers className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">Empty workspace</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs text-center">Create a doc, sheet, slide, or start a Warp AI session.</p>
                  <Button onClick={() => handleNewAsset("doc")} className="bg-primary text-primary-foreground rounded-lg px-5 h-8 text-sm glow-sm">Create Doc</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {workspaceAssets.map((asset) => {
                    const meta = assetMeta[asset.type]
                    const Icon = meta.icon
                    const preview = asset.type === "doc" ? (asset.content?.replace(/<[^>]*>?/gm, "").substring(0, 80) || "") : ""
                    return (
                      <div key={asset.id} onClick={() => openAsset(asset.id)} onKeyDown={(e) => { if (e.key === "Enter") openAsset(asset.id) }} role="button" tabIndex={0}
                        className={`group glass rounded-xl hover:bg-white/[0.06] transition-all duration-200 flex flex-col h-48 text-left outline-none focus-visible:ring-1 focus-visible:ring-primary overflow-hidden cursor-pointer ${meta.glowClass}`}>
                        <div className="flex-1 w-full p-4 flex flex-col relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                          <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className={`w-8 h-8 rounded-lg ${meta.bgClass} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${meta.color}`} />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="outline-none">
                                <div className="h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 glass-strong bg-[oklch(0.16_0.005_260)] border-white/[0.08]">
                                <DropdownMenuItem onClick={(e) => handleRenameAsset(asset.id, asset.title, e as any)} className="text-sm"><Edit2 className="w-3.5 h-3.5 mr-2" /> Rename</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleDeleteAsset(asset.id, e as any)} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 text-sm"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h3 className="font-medium text-foreground text-[13px] truncate mb-1 relative z-10">{asset.title}</h3>
                          {preview && <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed relative z-10">{preview}</p>}
                        </div>
                        <div className="px-4 py-2 border-t border-white/[0.04] flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground/50 font-medium">{meta.label}</span>
                          <span className="text-[10px] text-muted-foreground/50">{getRelativeTime(asset.lastModified)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[38px] bg-[oklch(0.12_0.005_260)] flex items-end px-2 pt-1.5 gap-0.5 overflow-x-auto shrink-0 border-b border-white/[0.06]">
            <AnimatePresence initial={false}>
              {openAssetIds.map((id) => {
                const asset = assets.find((a) => a.id === id)
                if (!asset) return null
                const isActive = id === activeAssetId
                const meta = assetMeta[asset.type]
                const Icon = meta.icon
                return (
                  <motion.div key={id} layout
                    initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    onClick={() => setActiveAssetId(id)}
                    className={`h-[30px] min-w-[120px] max-w-[200px] px-3 rounded-t-lg flex items-center justify-between gap-1.5 cursor-pointer relative group transition-all text-xs ${isActive ? "bg-background border-t border-x border-white/[0.08]" : "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"}`}>
                    {isActive && <div className="absolute -bottom-px left-0 right-0 h-px bg-background z-20" />}
                    <span className="flex items-center gap-1.5 flex-1 overflow-hidden">
                      <Icon className={`w-3 h-3 ${meta.color} shrink-0`} />
                      <span className={`truncate select-none ${isActive ? "font-medium text-foreground" : ""}`}>{asset.title || "Untitled"}</span>
                    </span>
                    <button type="button" onClick={(e) => closeTab(id, e)}
                      className={`p-0.5 rounded transition-all shrink-0 ${isActive ? "text-muted-foreground hover:bg-white/[0.08] hover:text-foreground" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {activeAsset ? (
              activeAsset.type === "warp" ? (
                <WarpApp key={activeAsset.id} workspace={activeWorkspace} workspaceAssets={workspaceAssets.filter((a) => a.id !== activeAsset.id)} />
              ) : activeAsset.type === "doc" ? (
                <Editor key={activeAsset.id} isAgentActive={isAgentActive} editorRef={editorRef} initialContent={activeAsset.content} initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })} onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })} />
              ) : activeAsset.type === "sheet" ? (
                <SheetEditor key={activeAsset.id} isAgentActive={isAgentActive} editorRef={editorRef} initialContent={activeAsset.content} initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })} onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })} />
              ) : (
                <SlideEditor key={activeAsset.id} isAgentActive={isAgentActive} editorRef={editorRef} initialContent={activeAsset.content} initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })} onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })} />
              )
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center"><Layers className="w-6 h-6 text-muted-foreground/40" /></div>
                <p className="text-sm text-muted-foreground">No file open</p>
              </div>
            )}
            {activeAsset?.type !== "warp" && (
              <AgentSidebar onAgentStateChange={setIsAgentActive} editorRef={editorRef} workspaceAssets={activeAsset ? workspaceAssets.filter((a) => a.id !== activeAsset.id) : workspaceAssets} />
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }}
              className="glass-strong bg-[oklch(0.15_0.005_260)] rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold">Settings</h2>
                <button type="button" onClick={() => setShowSettings(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5"><Key className="w-3 h-3" /> OpenRouter API Key</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-or-v1-..."
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5"><Cpu className="w-3 h-3" /> Model ID</label>
                  <input type="text" value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="meta-llama/llama-3-8b-instruct:free"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all font-mono text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-8 px-3 text-xs">Cancel</Button>
                <Button size="sm" onClick={saveSettings} className="bg-primary text-primary-foreground h-8 px-4 text-xs glow-sm">Save</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
