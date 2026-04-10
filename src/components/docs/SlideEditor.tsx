"use client"

import { useState, useEffect, useRef } from "react"
import { CloudUpload, CheckCircle2, Plus, Image as ImageIcon, Type, Trash2, LayoutTemplate } from "lucide-react"

interface SlideEditorProps {
  isAgentActive?: boolean
  initialContent?: string
  initialTitle?: string
  onContentChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  editorRef?: any
}

interface Slide {
  id: string
  elements: SlideElement[]
}

interface SlideElement {
  id: string
  type: "text" | "image"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
}

export default function SlideEditor({ isAgentActive = false, initialContent, initialTitle, onContentChange, onTitleChange, editorRef }: SlideEditorProps) {
  const [title, setTitle] = useState(initialTitle || "Untitled Presentation")
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      if (initialContent) {
        const parsed = JSON.parse(initialContent)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [{
      id: "slide-1",
      elements: [
        { id: "el-1", type: "text", content: "Presentation Title", x: 10, y: 30, width: 80, height: 20, fontSize: 48 },
        { id: "el-2", type: "text", content: "Subtitle", x: 10, y: 55, width: 80, height: 10, fontSize: 24 },
      ],
    }]
  })

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const triggerSave = (newSlides: Slide[]) => {
    setIsSaving(true)
    onContentChange?.(JSON.stringify(newSlides))
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave(slides)
  }

  const addSlide = () => {
    const newSlides = [...slides, { id: `slide-${Date.now()}`, elements: [] }]
    setSlides(newSlides)
    setActiveSlideIndex(newSlides.length - 1)
    triggerSave(newSlides)
  }

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter((_, i) => i !== index)
    setSlides(newSlides)
    setActiveSlideIndex(Math.min(index, newSlides.length - 1))
    triggerSave(newSlides)
  }

  const updateElement = (slideIndex: number, elId: string, updates: Partial<SlideElement>) => {
    const newSlides = [...slides]
    newSlides[slideIndex].elements = newSlides[slideIndex].elements.map((el) => (el.id === elId ? { ...el, ...updates } : el))
    setSlides(newSlides)
    triggerSave(newSlides)
  }

  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        getText: () => {
          let text = "Presentation Data:\n"
          slides.forEach((s, i) => {
            text += `\n[Slide ${i + 1}]\n`
            s.elements.filter((e) => e.type === "text").forEach((e) => { text += `- ${e.content}\n` })
          })
          return text
        },
        chain: () => ({
          focus: () => ({
            insertContent: (text: string) => ({
              run: () => {
                const newSlides = [...slides]
                newSlides[activeSlideIndex].elements.push({
                  id: `el-${Date.now()}`,
                  type: "text",
                  content: text.replace(/\n/g, " "),
                  x: 10, y: 80, width: 80, height: 15, fontSize: 16,
                })
                setSlides(newSlides)
                triggerSave(newSlides)
              },
            }),
          }),
        }),
      }
    }
  }, [slides, activeSlideIndex, editorRef])

  const activeSlide = slides[activeSlideIndex]

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="h-10 glass-subtle flex items-center px-3 gap-1 shrink-0 overflow-x-auto border-b border-white/[0.04]">
        <button type="button" onClick={addSlide} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-xs font-medium">
          <Plus className="w-3.5 h-3.5" /> Slide
        </button>
        <div className="w-px h-4 bg-white/[0.06] mx-1 shrink-0" />
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Add Text"><Type className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Add Image"><ImageIcon className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Layout"><LayoutTemplate className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-40 bg-[oklch(0.12_0.005_260)] border-r border-white/[0.06] overflow-y-auto p-3 flex flex-col gap-2">
          {slides.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setActiveSlideIndex(i)}
              onKeyDown={(e) => { if (e.key === "Enter") setActiveSlideIndex(i) }}
              role="button"
              tabIndex={0}
              className={`w-full aspect-video rounded-md border overflow-hidden relative cursor-pointer flex items-center justify-center text-[10px] text-muted-foreground group transition-all ${
                activeSlideIndex === i
                  ? "border-primary/50 bg-primary/[0.05] glow-sm"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              <span className="absolute top-1 left-1.5 text-[9px] font-bold text-muted-foreground/60">{i + 1}</span>
              {s.elements.length > 0 ? (
                <span className="text-muted-foreground/50 text-[9px]">{s.elements.length} elements</span>
              ) : (
                <span className="text-muted-foreground/30 text-[9px]">Empty</span>
              )}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteSlide(i) }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500/20 text-red-400 rounded p-0.5 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
          <div className="absolute top-3 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="text-lg font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent"
                placeholder="Presentation Title"
              />
            </div>
            <div className="flex items-center gap-1.5 glass-subtle px-2.5 py-1 rounded-md text-[10px] font-medium text-muted-foreground pointer-events-auto">
              {isSaving ? (
                <><CloudUpload className="w-3 h-3 animate-pulse" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 className="w-3 h-3 text-emerald-400/70" /><span>Saved</span></>
              )}
            </div>
          </div>

          <div
            className={`w-full max-w-[900px] aspect-video bg-[oklch(0.14_0.005_260)] border border-white/[0.06] rounded-lg relative transition-all ${
              isAgentActive ? "ring-1 ring-amber-400/40 glow-amber" : ""
            }`}
          >
            {activeSlide.elements.map((el) => (
              <div
                key={el.id}
                className="absolute border border-transparent hover:border-primary/30 rounded transition-colors"
                style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%` }}
              >
                {el.type === "text" && (
                  <textarea
                    value={el.content}
                    onChange={(e) => updateElement(activeSlideIndex, el.id, { content: e.target.value })}
                    className="w-full h-full bg-transparent resize-none outline-none text-foreground"
                    style={{ fontSize: `${el.fontSize}px`, lineHeight: 1.2 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
