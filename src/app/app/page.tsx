"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/docs/Sidebar"
import Editor from "@/components/docs/Editor"
import SheetEditor from "@/components/docs/SheetEditor"
import SlideEditor from "@/components/docs/SlideEditor"
import AgentSidebar from "@/components/docs/AgentSidebar"
import WarpApp from "@/components/docs/WarpApp"
import { MousePointer2, Trash2, Edit2, X, FileText, Grid, Presentation, Sparkles, Plus, Layers, ChevronRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type AssetType = 'doc' | 'sheet' | 'slide' | 'warp'

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

export default function App() {
  const [isAgentActive, setIsAgentActive] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [cursorVisible, setCursorVisible] = useState(false)
  const editorRef = useRef<any>(null)

  const [assets, setAssets] = useState<Asset[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null)
  const [openAssetIds, setOpenAssetIds] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<'library' | 'editor'>('library')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedAssets = localStorage.getItem('warp_assets')
    const savedWorkspaces = localStorage.getItem('warp_workspaces')
    
    let initialWorkspaces: Workspace[] = []
    if (savedWorkspaces) {
      try {
        initialWorkspaces = JSON.parse(savedWorkspaces)
        setWorkspaces(initialWorkspaces)
        if (initialWorkspaces.length > 0) setActiveWorkspaceId(initialWorkspaces[0].id)
      } catch (e) {}
    } else {
      initialWorkspaces = [{ id: "ws-1", name: "Personal Workspace" }]
      setWorkspaces(initialWorkspaces)
      setActiveWorkspaceId("ws-1")
      localStorage.setItem('warp_workspaces', JSON.stringify(initialWorkspaces))
    }

    if (savedAssets) {
      try {
        const parsed = JSON.parse(savedAssets)
        setAssets(parsed)
      } catch (e) {}
    } else {
      const initialDoc: Asset = {
        id: "doc-" + Date.now(),
        workspaceId: initialWorkspaces[0].id,
        type: 'doc',
        title: "Product Roadmap 2024",
        content: `Our primary objective for the upcoming fiscal year is to bridge the gap between static documentation and dynamic project management. We aim to create a seamless experience where data flows effortlessly between documents, spreadsheets, and our new AI-driven assistant.

<h2>Key Strategic Pillars</h2>

<h3>Performance First</h3>
<p>Zero-latency editing even on large documents with 10k+ blocks.</p>

<h3>AI Integration</h3>
<p>Context-aware editing that learns your team's unique brand voice.</p>

<p>We have observed a significant increase in user retention when the UI remains unobtrusive. As such, we are doubling down on our "Canvas-First" philosophy, ensuring that formatting tools only appear when relevant to the user's current intent.</p>`,
        lastModified: Date.now()
      }
      setAssets([initialDoc])
      localStorage.setItem('warp_assets', JSON.stringify([initialDoc]))
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('warp_assets', JSON.stringify(assets))
    }
  }, [assets, isMounted])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('warp_workspaces', JSON.stringify(workspaces))
    }
  }, [workspaces, isMounted])

  const handleNewAsset = (type: AssetType) => {
    if (!activeWorkspaceId) return
    const newAsset: Asset = {
      id: `${type}-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      type: type,
      title: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: "",
      lastModified: Date.now()
    }
    setAssets([newAsset, ...assets])
    openAsset(newAsset.id)
  }

  const openAsset = (id: string) => {
    if (!openAssetIds.includes(id)) {
      setOpenAssetIds([...openAssetIds, id])
    }
    setActiveAssetId(id)
    setCurrentView('editor')
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newOpenAssets = openAssetIds.filter(assetId => assetId !== id)
    setOpenAssetIds(newOpenAssets)
    
    if (activeAssetId === id) {
      if (newOpenAssets.length > 0) {
        setActiveAssetId(newOpenAssets[newOpenAssets.length - 1])
      } else {
        setActiveAssetId(null)
        setCurrentView('library')
      }
    }
  }

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates, lastModified: Date.now() } : a))
  }

  const handleDeleteAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAssets(prev => prev.filter(a => a.id !== id))
    
    if (openAssetIds.includes(id)) {
      closeTab(id, e)
    }
  }

  const handleRenameAsset = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTitle = prompt("Enter new title:", currentTitle)
    if (newTitle && newTitle.trim()) {
      handleUpdateAsset(id, { title: newTitle.trim() })
    }
  }

  const handleAgentStateChange = (active: boolean) => {
    setIsAgentActive(active)
    
    if (active) {
      setTimeout(() => {
        setCursorVisible(true)
        setCursorPos({ x: 300, y: 400 })
        
        setTimeout(() => {
          setCursorPos({ x: 500, y: 250 })
          
          setTimeout(() => {
            setCursorVisible(false)
          }, 3000)
        }, 1500)
      }, 3500)
    } else {
      setCursorVisible(false)
    }
  }

  const activeAsset = assets.find(a => a.id === activeAssetId)
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
  const workspaceAssets = assets.filter(a => a.workspaceId === activeWorkspaceId)

  if (!isMounted) return null

  return (
    <div className="flex flex-1 w-full h-full relative overflow-hidden bg-background text-foreground antialiased font-sans">
      <Sidebar 
        onNewDoc={() => handleNewAsset('doc')} 
        onViewLibrary={() => {
          setCurrentView('library')
          setActiveAssetId(null)
        }} 
        currentView={currentView}
      />
      
      {currentView === 'library' ? (
        <div className="flex-1 flex overflow-hidden bg-zinc-50/50">
          {/* Workspace Sidebar (Notion-style) */}
          <div className="w-64 border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-xl flex flex-col hidden md:flex">
            <div className="p-4 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-zinc-900">Warp Suite</span>
              </div>
            </div>
            
            <div className="px-3 pb-2 flex items-center justify-between group">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspaces</span>
              <button 
                type="button"
                onClick={() => {
                  const name = prompt("Workspace name:")
                  if (name && name.trim()) {
                    const newWs = { id: `ws-${Date.now()}`, name: name.trim() }
                    setWorkspaces([...workspaces, newWs])
                    setActiveWorkspaceId(newWs.id)
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 transition-all rounded hover:bg-zinc-200/50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {workspaces.map(ws => (
                <button
                  type="button"
                  key={ws.id}
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                    activeWorkspaceId === ws.id 
                      ? 'bg-zinc-200/60 font-medium text-zinc-900 shadow-sm' 
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className={`w-4 h-4 shrink-0 ${activeWorkspaceId === ws.id ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {activeWorkspaceId === ws.id && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 sm:p-12 lg:p-16">
            <div className="max-w-6xl mx-auto">
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                    {activeWorkspace?.name || "Your Library"}
                  </h1>
                  <p className="text-sm text-zinc-500">
                    {workspaceAssets.length} {workspaceAssets.length === 1 ? 'asset' : 'assets'} in this workspace
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-zinc-200/80">
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset('warp')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium h-9 px-3 gap-2">
                    <Sparkles className="w-4 h-4" /> Warp AI
                  </Button>
                  <div className="w-px h-5 bg-zinc-200" />
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset('doc')} className="text-zinc-600 hover:text-zinc-900 h-9 px-3 gap-2">
                    <FileText className="w-4 h-4" /> Doc
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset('sheet')} className="text-zinc-600 hover:text-zinc-900 h-9 px-3 gap-2">
                    <Grid className="w-4 h-4" /> Sheet
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleNewAsset('slide')} className="text-zinc-600 hover:text-zinc-900 h-9 px-3 gap-2">
                    <Presentation className="w-4 h-4" /> Slide
                  </Button>
                </div>
              </header>
              
              {workspaceAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white border border-zinc-200/60 border-dashed rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center mb-6">
                    <Layers className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Empty Workspace</h3>
                  <p className="text-zinc-500 mb-8 max-w-sm text-center">
                    Create your first document, spreadsheet, presentation, or start an AI Warp session to begin.
                  </p>
                  <Button onClick={() => handleNewAsset('doc')} className="bg-zinc-900 text-white rounded-lg px-6">
                    Create New Doc
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {workspaceAssets.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => openAsset(asset.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openAsset(asset.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group bg-white rounded-xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:border-zinc-300/80 transition-all duration-200 flex flex-col h-60 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 overflow-hidden relative cursor-pointer"
                    >
                      {/* Asset Preview Area */}
                      <div className="flex-1 w-full p-6 flex flex-col justify-center items-center relative bg-gradient-to-b from-zinc-50/50 to-zinc-100/50 border-b border-zinc-100">
                        {asset.type === 'doc' && <FileText className="w-12 h-12 text-zinc-300 group-hover:scale-110 group-hover:text-blue-100 transition-all duration-300" />}
                        {asset.type === 'sheet' && <Grid className="w-12 h-12 text-zinc-300 group-hover:scale-110 group-hover:text-green-100 transition-all duration-300" />}
                        {asset.type === 'slide' && <Presentation className="w-12 h-12 text-zinc-300 group-hover:scale-110 group-hover:text-orange-100 transition-all duration-300" />}
                        {asset.type === 'warp' && <Sparkles className="w-12 h-12 text-zinc-300 group-hover:scale-110 group-hover:text-indigo-100 transition-all duration-300" />}
                      </div>
                      
                      {/* Asset Meta Area */}
                      <div className="p-4 bg-white flex flex-col gap-1 z-10 shrink-0 w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            {asset.type === 'doc' && <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5 text-blue-600" /></div>}
                            {asset.type === 'sheet' && <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center shrink-0"><Grid className="w-3.5 h-3.5 text-green-600" /></div>}
                            {asset.type === 'slide' && <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center shrink-0"><Presentation className="w-3.5 h-3.5 text-orange-600" /></div>}
                            {asset.type === 'warp' && <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5 text-indigo-600" /></div>}
                            
                            <h3 className="font-semibold text-zinc-900 text-sm truncate">{asset.title}</h3>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="outline-none">
                              <div className="h-7 w-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                                <MoreVertical className="w-4 h-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => handleRenameAsset(asset.id, asset.title, e as any)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDeleteAsset(asset.id, e as any)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium pl-[34px]">
                          Edited {new Date(asset.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-100/50">
          {/* Chrome-style Tab Bar */}
          <div className="h-[42px] bg-zinc-100 flex items-end px-2 pt-2 gap-1 overflow-x-auto shrink-0 border-b border-zinc-200">
            <AnimatePresence initial={false}>
              {openAssetIds.map(id => {
                const asset = assets.find(a => a.id === id)
                if (!asset) return null
                const isActive = id === activeAssetId
                
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    onClick={() => setActiveAssetId(id)}
                    className={`h-[34px] min-w-[140px] max-w-[220px] px-3 border-t border-x border-transparent rounded-t-xl flex items-center justify-between gap-2 cursor-pointer relative group transition-colors ${
                      isActive 
                        ? 'bg-white border-zinc-200/80 shadow-sm z-10' 
                        : 'hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white z-20" />
                    )}
                    <span className="flex items-center gap-2 flex-1 overflow-hidden">
                       {asset.type === 'doc' && <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                       {asset.type === 'sheet' && <Grid className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                       {asset.type === 'slide' && <Presentation className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                       {asset.type === 'warp' && <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span className={`text-xs truncate select-none ${isActive ? 'font-semibold text-zinc-900' : 'font-medium'}`}>
                        {asset.title || "Untitled"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => closeTab(id, e)}
                      className={`p-1 rounded-md transition-all shrink-0 ${
                        isActive 
                          ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' 
                          : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:bg-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex overflow-hidden bg-white shadow-sm">
            {/* Editor Canvas */}
            {activeAsset ? (
              activeAsset.type === 'warp' ? (
                <WarpApp 
                  key={activeAsset.id} 
                  workspace={activeWorkspace} 
                  workspaceAssets={workspaceAssets.filter(a => a.id !== activeAsset.id)} 
                />
              ) : activeAsset.type === 'doc' ? (
                <Editor 
                  key={activeAsset.id}
                  isAgentActive={isAgentActive} 
                  editorRef={editorRef} 
                  initialContent={activeAsset.content}
                  initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })}
                  onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })}
                />
              ) : activeAsset.type === 'sheet' ? (
                <SheetEditor
                  key={activeAsset.id}
                  isAgentActive={isAgentActive} 
                  editorRef={editorRef} 
                  initialContent={activeAsset.content}
                  initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })}
                  onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })}
                />
              ) : (
                <SlideEditor
                  key={activeAsset.id}
                  isAgentActive={isAgentActive} 
                  editorRef={editorRef} 
                  initialContent={activeAsset.content}
                  initialTitle={activeAsset.title}
                  onContentChange={(content) => handleUpdateAsset(activeAsset.id, { content })}
                  onTitleChange={(title) => handleUpdateAsset(activeAsset.id, { title })}
                />
              )
            ) : (
              <div className="flex-1 bg-zinc-50 flex items-center justify-center text-zinc-400 flex-col gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-zinc-300" />
                </div>
                <p>No asset selected</p>
              </div>
            )}
            
            {/* AI Assistant Sidebar (only if not Warp) */}
            {activeAsset?.type !== 'warp' && (
              <div className="border-l border-zinc-200">
                <AgentSidebar 
                  onAgentStateChange={handleAgentStateChange} 
                  editorRef={editorRef} 
                  workspaceAssets={activeAsset ? workspaceAssets.filter(a => a.id !== activeAsset.id) : workspaceAssets} 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulated AI Cursor */}
      {currentView === 'editor' && (
        <div 
          className={`absolute pointer-events-none transition-all duration-1000 ease-in-out z-50 flex items-center justify-center flex-col`}
          style={{ 
            top: `${cursorPos.y}px`, 
            left: `${cursorPos.x}px`,
            opacity: cursorVisible ? 1 : 0,
            transform: cursorVisible ? 'scale(1)' : 'scale(0.8)'
          }}
        >
          <MousePointer2 className="w-6 h-6 text-zinc-900 drop-shadow-md -rotate-12 transform origin-top-left -ml-2 -mt-2" fill="currentColor" />
          <div className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap animate-pulse">
            Warp Adjusting
          </div>
        </div>
      )}
    </div>
  )
}
