"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarDays, CloudUpload, CheckCircle2, LayoutTemplate, Plus, Image as ImageIcon, Type, Trash2 } from "lucide-react"

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
  type: 'text' | 'image'
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
    } catch (e) {}
    
    // Default empty slide
    return [{
      id: "slide-1",
      elements: [
        { id: "el-1", type: "text", content: "Presentation Title", x: 10, y: 30, width: 80, height: 20, fontSize: 48 },
        { id: "el-2", type: "text", content: "Subtitle here", x: 10, y: 55, width: 80, height: 10, fontSize: 24 }
      ]
    }]
  })

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const triggerSave = (newSlides: Slide[]) => {
    setIsSaving(true)
    onContentChange?.(JSON.stringify(newSlides))
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false)
    }, 1000)
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
    const slide = newSlides[slideIndex]
    slide.elements = slide.elements.map(el => el.id === elId ? { ...el, ...updates } : el)
    setSlides(newSlides)
    triggerSave(newSlides)
  }

  // Expose a method for the Agent
  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        getText: () => {
          let text = "Presentation Data:\n"
          slides.forEach((s, i) => {
            text += `\n[Slide ${i + 1}]\n`
            s.elements.filter(e => e.type === 'text').forEach(e => {
              text += `- ${e.content}\n`
            })
          })
          return text
        },
        chain: () => ({
          focus: () => ({
            insertContent: (text: string) => ({
              run: () => {
                // For MVP, add text to current slide
                const newSlides = [...slides]
                newSlides[activeSlideIndex].elements.push({
                  id: `el-${Date.now()}`,
                  type: 'text',
                  content: "AI: " + text.replace(/\n/g, " "),
                  x: 10, y: 80, width: 80, height: 15, fontSize: 16
                })
                setSlides(newSlides)
                triggerSave(newSlides)
              }
            })
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, activeSlideIndex, editorRef])

  const activeSlide = slides[activeSlideIndex]

  return (
    <main className="flex-1 flex flex-col bg-[#eaeaea] overflow-hidden relative">
      
      {/* Top Formatting Ribbon */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
        <button type="button" onClick={addSlide} className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1 text-sm font-medium" title="New Slide">
          <Plus className="w-4 h-4" /> New Slide
        </button>
        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Add Text">
          <Type className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Layout">
          <LayoutTemplate className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnail Sidebar */}
        <div className="w-48 bg-[#f4f4f5] border-r border-zinc-200 overflow-y-auto p-4 flex flex-col gap-4">
          {slides.map((s, i) => (
            <div 
              key={s.id}
              onClick={() => setActiveSlideIndex(i)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveSlideIndex(i) }}
              role="button"
              tabIndex={0}
              className={`w-full aspect-video rounded-md border-2 overflow-hidden bg-white relative cursor-pointer flex items-center justify-center text-xs text-zinc-400 group ${activeSlideIndex === i ? 'border-orange-500' : 'border-transparent hover:border-zinc-300'}`}
            >
               <span className="absolute top-1 left-1.5 font-bold">{i + 1}</span>
               {s.elements.length > 0 ? 'Has Content' : 'Empty Slide'}
               
               {slides.length > 1 && (
                 <button 
                   type="button"
                   onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                   className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 rounded p-1 hover:bg-red-200"
                 >
                   <Trash2 className="w-3 h-3" />
                 </button>
               )}
            </div>
          ))}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative">
          
          <div className="absolute top-4 left-8 right-8 z-10 flex justify-between items-start pointer-events-none">
             <div className="pointer-events-auto">
               <input
                 type="text"
                 value={title}
                 onChange={handleTitleChange}
                 className="text-2xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none bg-transparent"
                 placeholder="Presentation Title"
               />
             </div>
             
             <div className="flex items-center gap-1.5 transition-colors bg-white/80 px-3 py-1 rounded-full text-xs font-medium border border-zinc-200 pointer-events-auto">
                {isSaving ? (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 animate-pulse text-zinc-500" />
                    <span className="text-zinc-500">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70" />
                    <span className="text-zinc-500">Saved</span>
                  </>
                )}
             </div>
          </div>

          {/* 16:9 Slide Canvas */}
          <div 
            className={`w-full max-w-[960px] aspect-video bg-white shadow-md border border-zinc-200/60 relative
              ${isAgentActive ? 'ring-2 ring-orange-500/50 ring-offset-4 ring-offset-[#eaeaea] shadow-orange-500/10 shadow-xl' : ''}
            `}
          >
            {activeSlide.elements.map(el => (
              <div 
                key={el.id}
                className="absolute border border-transparent hover:border-blue-500/50"
                style={{ 
                  left: `${el.x}%`, 
                  top: `${el.y}%`, 
                  width: `${el.width}%`, 
                  height: `${el.height}%`,
                }}
              >
                {el.type === 'text' && (
                  <textarea
                    value={el.content}
                    onChange={(e) => updateElement(activeSlideIndex, el.id, { content: e.target.value })}
                    className="w-full h-full bg-transparent resize-none outline-none font-sans"
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