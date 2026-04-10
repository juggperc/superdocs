"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  CloudUpload,
  CheckCircle2,
  Plus,
  Image as ImageIcon,
  Type,
  Trash2,
  LayoutTemplate,
  Copy,
  Shapes,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

interface SlideEditorRef {
  getText: () => string
  chain: () => {
    focus: () => {
      insertContent: (text: string) => { run: () => void }
    }
  }
}

interface SlideEditorProps {
  isAgentActive?: boolean
  initialContent?: string
  initialTitle?: string
  onContentChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  editorRef?: React.MutableRefObject<SlideEditorRef | null>
}

type ElementType = "text" | "image" | "shape"
type HorizontalAlign = "left" | "center" | "right"

interface SlideElement {
  id: string
  type: ElementType
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontWeight?: number
  align?: HorizontalAlign
  color?: string
}

interface Slide {
  id: string
  templateId: string
  background: string
  elements: SlideElement[]
}

interface SlideTemplate {
  id: string
  name: string
  description: string
  createSlides: () => Slide[]
}

const defaultTitleSlide = (): Slide => ({
  id: "slide-1",
  templateId: "title",
  background: "linear-gradient(160deg, oklch(0.16 0.05 265), oklch(0.10 0.02 265))",
  elements: [
    {
      id: "el-1",
      type: "text",
      content: "Presentation Title",
      x: 10,
      y: 26,
      width: 80,
      height: 18,
      fontSize: 52,
      fontWeight: 700,
      align: "left",
      color: "#f7f7f8",
    },
    {
      id: "el-2",
      type: "text",
      content: "Subtitle goes here",
      x: 10,
      y: 50,
      width: 80,
      height: 10,
      fontSize: 24,
      fontWeight: 500,
      align: "left",
      color: "#a3a3a7",
    },
  ],
})

const templates: SlideTemplate[] = [
  {
    id: "title",
    name: "Title Deck",
    description: "High-contrast title and subtitle",
    createSlides: () => [defaultTitleSlide()],
  },
  {
    id: "pitch",
    name: "Pitch",
    description: "Hero heading with metrics strip",
    createSlides: () => [
      {
        id: "slide-pitch",
        templateId: "pitch",
        background: "linear-gradient(130deg, oklch(0.18 0.06 235), oklch(0.12 0.03 250))",
        elements: [
          {
            id: "el-pitch-1",
            type: "text",
            content: "Launch faster with Warp Slides",
            x: 9,
            y: 18,
            width: 82,
            height: 20,
            fontSize: 48,
            fontWeight: 700,
            align: "left",
            color: "#f8fafc",
          },
          {
            id: "el-pitch-2",
            type: "text",
            content: "Build narrative decks from docs and data in one workspace.",
            x: 9,
            y: 44,
            width: 72,
            height: 12,
            fontSize: 22,
            fontWeight: 500,
            align: "left",
            color: "#cbd5e1",
          },
          {
            id: "el-pitch-3",
            type: "shape",
            content: "24h faster prep time",
            x: 9,
            y: 70,
            width: 40,
            height: 13,
            fontSize: 17,
            fontWeight: 600,
            align: "center",
            color: "#f8fafc",
          },
        ],
      },
    ],
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Sectioned agenda layout",
    createSlides: () => [
      {
        id: "slide-agenda",
        templateId: "agenda",
        background: "linear-gradient(170deg, oklch(0.15 0.02 260), oklch(0.11 0.02 260))",
        elements: [
          {
            id: "el-agenda-1",
            type: "text",
            content: "Agenda",
            x: 10,
            y: 10,
            width: 80,
            height: 14,
            fontSize: 46,
            fontWeight: 700,
            align: "left",
            color: "#f3f4f6",
          },
          {
            id: "el-agenda-2",
            type: "text",
            content: "1. Problem\n2. Solution\n3. Product Demo\n4. Rollout Plan",
            x: 10,
            y: 30,
            width: 48,
            height: 52,
            fontSize: 24,
            fontWeight: 500,
            align: "left",
            color: "#d1d5db",
          },
          {
            id: "el-agenda-3",
            type: "shape",
            content: "Visual",
            x: 62,
            y: 30,
            width: 28,
            height: 52,
            fontSize: 20,
            fontWeight: 600,
            align: "center",
            color: "#c7d2fe",
          },
        ],
      },
    ],
  },
]

const normalizeSlides = (content?: string): Slide[] => {
  if (!content) return [defaultTitleSlide()]

  try {
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed) || parsed.length === 0) return [defaultTitleSlide()]

    return parsed.map((slide: Partial<Slide>, slideIndex: number) => ({
      id: slide.id || `slide-${slideIndex + 1}`,
      templateId: slide.templateId || "custom",
      background:
        slide.background || "linear-gradient(160deg, oklch(0.14 0.01 260), oklch(0.11 0.01 260))",
      elements: Array.isArray(slide.elements)
        ? slide.elements.map((el: Partial<SlideElement>, elementIndex: number) => ({
            id: el.id || `el-${slideIndex + 1}-${elementIndex + 1}`,
            type: el.type === "image" || el.type === "shape" ? el.type : "text",
            content: typeof el.content === "string" ? el.content : "",
            x: typeof el.x === "number" ? el.x : 10,
            y: typeof el.y === "number" ? el.y : 10,
            width: typeof el.width === "number" ? el.width : 40,
            height: typeof el.height === "number" ? el.height : 20,
            fontSize: typeof el.fontSize === "number" ? el.fontSize : 20,
            fontWeight: typeof el.fontWeight === "number" ? el.fontWeight : 500,
            align: el.align === "center" || el.align === "right" ? el.align : "left",
            color: typeof el.color === "string" ? el.color : "#f3f4f6",
          }))
        : [],
    }))
  } catch {
    return [defaultTitleSlide()]
  }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export default function SlideEditor({
  isAgentActive = false,
  initialContent,
  initialTitle,
  onContentChange,
  onTitleChange,
  editorRef,
}: SlideEditorProps) {
  const idCounterRef = useRef(0)
  const makeId = useCallback((prefix: string) => {
    idCounterRef.current += 1
    return `${prefix}-${idCounterRef.current}`
  }, [])

  const [title, setTitle] = useState(initialTitle || "Untitled Presentation")
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [slides, setSlides] = useState<Slide[]>(() => normalizeSlides(initialContent))
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ids = slides.flatMap((slide) => [slide.id, ...slide.elements.map((el) => el.id)])
    const maxSeen = ids.reduce((max, id) => {
      const match = id.match(/-(\d+)$/)
      if (!match) return max
      return Math.max(max, Number(match[1]))
    }, 0)
    if (maxSeen > idCounterRef.current) idCounterRef.current = maxSeen
  }, [slides])

  const triggerSave = useCallback((newSlides: Slide[]) => {
    setIsSaving(true)
    onContentChange?.(JSON.stringify(newSlides))
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000)
  }, [onContentChange])

  const updateSlides = useCallback((newSlides: Slide[]) => {
    setSlides(newSlides)
    triggerSave(newSlides)
  }, [triggerSave])

  const activeSlide =
    slides[activeSlideIndex] ||
    slides[0] || {
      id: "slide-fallback",
      templateId: "blank",
      background: "linear-gradient(160deg, oklch(0.14 0.01 260), oklch(0.11 0.01 260))",
      elements: [],
    }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave(slides)
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: makeId("slide"),
      templateId: "blank",
      background: "linear-gradient(160deg, oklch(0.14 0.01 260), oklch(0.11 0.01 260))",
      elements: [],
    }
    const newSlides = [...slides, newSlide]
    updateSlides(newSlides)
    setActiveSlideIndex(newSlides.length - 1)
    setSelectedElementId(null)
  }

  const duplicateSlide = () => {
    if (!activeSlide) return
    const copy: Slide = {
      ...activeSlide,
      id: makeId("slide"),
      elements: activeSlide.elements.map((el) => ({ ...el, id: makeId("el") })),
    }
    const newSlides = [...slides]
    newSlides.splice(activeSlideIndex + 1, 0, copy)
    updateSlides(newSlides)
    setActiveSlideIndex(activeSlideIndex + 1)
    setSelectedElementId(null)
  }

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter((_, i) => i !== index)
    updateSlides(newSlides)
    setActiveSlideIndex(Math.max(0, Math.min(activeSlideIndex, newSlides.length - 1)))
    setSelectedElementId(null)
  }

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= slides.length) return
    const newSlides = [...slides]
    ;[newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]]
    updateSlides(newSlides)
    setActiveSlideIndex(target)
  }

  const addElement = (type: ElementType) => {
    const base: SlideElement = {
      id: makeId("el"),
      type,
      content: type === "image" ? "" : type === "shape" ? "Shape" : "New text",
      x: 16,
      y: 22,
      width: type === "shape" ? 30 : type === "image" ? 32 : 48,
      height: type === "shape" ? 14 : type === "image" ? 32 : 14,
      fontSize: 26,
      fontWeight: 600,
      align: "left",
      color: "#f3f4f6",
    }

    const newSlides = [...slides]
    newSlides[activeSlideIndex] = {
      ...activeSlide,
      elements: [...activeSlide.elements, base],
    }
    updateSlides(newSlides)
    setSelectedElementId(base.id)
  }

  const addImageFromFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = typeof reader.result === "string" ? reader.result : ""
        const newElement: SlideElement = {
          id: makeId("el"),
          type: "image",
          content: src,
          x: 18,
          y: 20,
          width: 40,
          height: 36,
          align: "center",
          color: "#f3f4f6",
        }
        const newSlides = [...slides]
        newSlides[activeSlideIndex] = {
          ...activeSlide,
          elements: [...activeSlide.elements, newElement],
        }
        updateSlides(newSlides)
        setSelectedElementId(newElement.id)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const updateElement = (elId: string, updates: Partial<SlideElement>) => {
    const newSlides = [...slides]
    newSlides[activeSlideIndex] = {
      ...activeSlide,
      elements: activeSlide.elements.map((el) => (el.id === elId ? { ...el, ...updates } : el)),
    }
    updateSlides(newSlides)
  }

  const deleteSelectedElement = () => {
    if (!selectedElementId) return
    const newSlides = [...slides]
    newSlides[activeSlideIndex] = {
      ...activeSlide,
      elements: activeSlide.elements.filter((el) => el.id !== selectedElementId),
    }
    updateSlides(newSlides)
    setSelectedElementId(null)
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    const newSlides = template.createSlides().map((slide) => ({
      ...slide,
      id: makeId("slide"),
      elements: slide.elements.map((el) => ({ ...el, id: makeId("el") })),
    }))
    updateSlides(newSlides)
    setActiveSlideIndex(0)
    setSelectedElementId(null)
    setShowTemplates(false)
  }

  const onElementMouseDown = (event: React.MouseEvent, el: SlideElement) => {
    if (!canvasRef.current) return
    event.preventDefault()
    event.stopPropagation()
    setSelectedElementId(el.id)

    const canvas = canvasRef.current.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startElementX = el.x
    const startElementY = el.y

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaXPercent = ((moveEvent.clientX - startX) / canvas.width) * 100
      const deltaYPercent = ((moveEvent.clientY - startY) / canvas.height) * 100
      updateElement(el.id, {
        x: clamp(startElementX + deltaXPercent, 0, 100 - el.width),
        y: clamp(startElementY + deltaYPercent, 0, 100 - el.height),
      })
    }

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  useEffect(() => {
    if (!editorRef) return

    editorRef.current = {
      getText: () => {
        let text = "Presentation Data:\n"
        slides.forEach((s, i) => {
          text += `\n[Slide ${i + 1}]\n`
          s.elements.forEach((e) => {
            if (e.type === "text" || e.type === "shape") text += `- ${e.content}\n`
            if (e.type === "image") text += "- [Image]\n"
          })
        })
        return text
      },
      chain: () => ({
        focus: () => ({
          insertContent: (text: string) => ({
            run: () => {
              const newElement: SlideElement = {
                id: makeId("el"),
                type: "text",
                content: text.replace(/\n/g, " "),
                x: 10,
                y: 78,
                width: 80,
                height: 14,
                fontSize: 18,
                fontWeight: 500,
                align: "left",
                color: "#f3f4f6",
              }
              const newSlides = [...slides]
              newSlides[activeSlideIndex] = {
                ...activeSlide,
                elements: [...activeSlide.elements, newElement],
              }
              updateSlides(newSlides)
              setSelectedElementId(newElement.id)
            },
          }),
        }),
      }),
    }
  }, [slides, activeSlideIndex, activeSlide, editorRef, updateSlides, makeId])

  const selectedElement = activeSlide?.elements.find((el) => el.id === selectedElementId) || null

  useEffect(() => {
    if (!selectedElementId) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectedElement) return
      const step = event.shiftKey ? 5 : 1
      let nextX = selectedElement.x
      let nextY = selectedElement.y

      if (event.key === "ArrowLeft") nextX = clamp(selectedElement.x - step, 0, 100 - selectedElement.width)
      if (event.key === "ArrowRight") nextX = clamp(selectedElement.x + step, 0, 100 - selectedElement.width)
      if (event.key === "ArrowUp") nextY = clamp(selectedElement.y - step, 0, 100 - selectedElement.height)
      if (event.key === "ArrowDown") nextY = clamp(selectedElement.y + step, 0, 100 - selectedElement.height)

      if (event.key === "Escape") {
        setSelectedElementId(null)
        return
      }

      if (nextX !== selectedElement.x || nextY !== selectedElement.y) {
        event.preventDefault()
        updateElement(selectedElement.id, { x: nextX, y: nextY })
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedElementId, selectedElement, updateElement])

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="h-10 glass-subtle flex items-center px-3 gap-1 shrink-0 overflow-x-auto border-b border-white/[0.04]">
        <button
          type="button"
          onClick={addSlide}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Slide
        </button>
        <button
          type="button"
          onClick={duplicateSlide}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Copy className="w-3.5 h-3.5" /> Duplicate
        </button>
        <div className="w-px h-4 bg-white/[0.06] mx-1 shrink-0" />
        <button
          type="button"
          onClick={() => addElement("text")}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          title="Add Text"
        >
          <Type className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={addImageFromFile}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          title="Add Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => addElement("shape")}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          title="Add Shape"
        >
          <Shapes className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowTemplates((prev) => !prev)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <LayoutTemplate className="w-3.5 h-3.5" /> Templates
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-44 bg-[oklch(0.12_0.005_260)] border-r border-white/[0.06] overflow-y-auto p-3 flex flex-col gap-2">
          {slides.map((s, i) => (
            <div key={s.id} className="relative group">
              <button
                type="button"
                onClick={() => {
                  setActiveSlideIndex(i)
                  setSelectedElementId(null)
                }}
                className={`w-full aspect-video rounded-md border overflow-hidden relative cursor-pointer flex items-end p-1.5 text-[9px] text-muted-foreground group transition-all ${
                  activeSlideIndex === i
                    ? "border-primary/50 bg-primary/[0.05] glow-sm"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
                style={{ background: s.background }}
              >
                <span className="absolute top-1 left-1.5 text-[9px] font-bold text-muted-foreground/80">
                  {i + 1}
                </span>
                <span className="truncate max-w-[90%]">{s.templateId}</span>
              </button>

              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveSlide(i, -1)}
                  className="bg-black/30 text-white rounded p-0.5 hover:bg-black/50"
                  title="Move up"
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(i, 1)}
                  className="bg-black/30 text-white rounded p-0.5 hover:bg-black/50"
                  title="Move down"
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteSlide(i)}
                    className="bg-red-500/30 text-red-200 rounded p-0.5 hover:bg-red-500/50"
                    title="Delete slide"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
          <div className="absolute top-3 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
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
                <>
                  <CloudUpload className="w-3 h-3 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/70" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>

          {showTemplates && (
            <div className="absolute top-14 left-8 z-30 glass-strong bg-[oklch(0.16_0.005_260)] border border-white/[0.08] rounded-lg p-3 w-72 space-y-2">
              <h3 className="text-xs font-semibold text-foreground mb-1">Choose template</h3>
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className="w-full text-left p-2 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                  <p className="text-xs font-medium text-foreground">{template.name}</p>
                  <p className="text-[10px] text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          )}

          <div
            ref={canvasRef}
            className={`w-full max-w-[980px] aspect-video border border-white/[0.08] rounded-lg relative transition-all overflow-hidden ${
              isAgentActive ? "ring-1 ring-amber-400/40 glow-amber" : ""
            }`}
            style={{ background: activeSlide.background }}
            onMouseDown={() => setSelectedElementId(null)}
          >
            {activeSlide.elements.map((el) => {
              const isSelected = selectedElementId === el.id

              return (
                <div
                  key={el.id}
                  className={`absolute rounded transition-all border ${
                    isSelected ? "border-primary/60 shadow-[0_0_0_1px_rgba(129,140,248,0.35)]" : "border-transparent"
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                  }}
                  onMouseDown={(e) => onElementMouseDown(e, el)}
                >
                  {el.type === "text" && (
                    <textarea
                      value={el.content}
                      onChange={(e) => updateElement(el.id, { content: e.target.value })}
                      className="w-full h-full bg-transparent resize-none outline-none px-1 py-0.5"
                      style={{
                        fontSize: `${el.fontSize || 20}px`,
                        fontWeight: el.fontWeight || 500,
                        lineHeight: 1.2,
                        textAlign: el.align || "left",
                        color: el.color || "#f3f4f6",
                      }}
                    />
                  )}
                  {el.type === "shape" && (
                    <textarea
                      value={el.content}
                      onChange={(e) => updateElement(el.id, { content: e.target.value })}
                      className="w-full h-full resize-none outline-none rounded-lg px-2 py-1.5"
                      style={{
                        fontSize: `${el.fontSize || 20}px`,
                        fontWeight: el.fontWeight || 600,
                        lineHeight: 1.2,
                        textAlign: el.align || "center",
                        color: el.color || "#f3f4f6",
                        background: "rgba(129,140,248,0.22)",
                        border: "1px solid rgba(129,140,248,0.5)",
                      }}
                    />
                  )}
                  {el.type === "image" &&
                    (el.content ? (
                      <img
                        src={el.content}
                        alt="Slide element"
                        className="w-full h-full object-cover rounded-md select-none pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={addImageFromFile}
                        className="w-full h-full rounded-md border border-dashed border-white/20 text-muted-foreground text-xs flex items-center justify-center hover:border-white/40 hover:text-foreground transition-colors"
                      >
                        Add image
                      </button>
                    ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-64 bg-[oklch(0.12_0.005_260)] border-l border-white/[0.06] p-3 space-y-3 overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Slide</h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              {activeSlide.elements.length} elements on this slide
            </p>
          </div>

          <label className="block text-[10px] text-muted-foreground">
            Background
            <input
              type="text"
              value={activeSlide.background}
              onChange={(e) => {
                const newSlides = [...slides]
                newSlides[activeSlideIndex] = { ...activeSlide, background: e.target.value }
                updateSlides(newSlides)
              }}
              className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px] text-foreground"
            />
          </label>

          {selectedElement ? (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground">Selected element</h4>
                <button
                  type="button"
                  onClick={deleteSelectedElement}
                  className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>

              {(selectedElement.type === "text" || selectedElement.type === "shape") && (
                <>
                  <label className="block text-[10px] text-muted-foreground">
                    Font size
                    <input
                      type="range"
                      min={12}
                      max={84}
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </label>

                  <label className="block text-[10px] text-muted-foreground">
                    Weight
                    <input
                      type="range"
                      min={300}
                      max={900}
                      step={100}
                      value={selectedElement.fontWeight || 500}
                      onChange={(e) => updateElement(selectedElement.id, { fontWeight: Number(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </label>

                  <label className="block text-[10px] text-muted-foreground">
                    Color
                    <input
                      type="color"
                      value={selectedElement.color || "#f3f4f6"}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="w-full mt-1 h-8 rounded bg-transparent"
                    />
                  </label>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[10px] text-muted-foreground">
                  X
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => updateElement(selectedElement.id, { x: clamp(Number(e.target.value), 0, 100) })}
                    className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px]"
                  />
                </label>
                <label className="block text-[10px] text-muted-foreground">
                  Y
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => updateElement(selectedElement.id, { y: clamp(Number(e.target.value), 0, 100) })}
                    className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px]"
                  />
                </label>
                <label className="block text-[10px] text-muted-foreground">
                  Width
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={Math.round(selectedElement.width)}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { width: clamp(Number(e.target.value), 5, 100) })
                    }
                    className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px]"
                  />
                </label>
                <label className="block text-[10px] text-muted-foreground">
                  Height
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={Math.round(selectedElement.height)}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { height: clamp(Number(e.target.value), 5, 100) })
                    }
                    className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[10px]"
                  />
                </label>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground pt-2 border-t border-white/[0.08]">
              Select an element to edit typography, size, and position.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
