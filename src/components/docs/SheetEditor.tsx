"use client"

import { useState, useEffect, useRef } from "react"
import { CloudUpload, CheckCircle2, Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface SheetEditorProps {
  isAgentActive?: boolean
  initialContent?: string
  initialTitle?: string
  onContentChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  editorRef?: any
}

type GridData = string[][]
const ROWS = 50
const COLS = 26

export default function SheetEditor({ isAgentActive = false, initialContent, initialTitle, onContentChange, onTitleChange, editorRef }: SheetEditorProps) {
  const [title, setTitle] = useState(initialTitle || "Untitled Sheet")
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [grid, setGrid] = useState<GridData>(() => {
    try {
      if (initialContent) {
        const parsed = JSON.parse(initialContent)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return Array(ROWS).fill(0).map(() => Array(COLS).fill(""))
  })

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)

  const triggerSave = (newGrid: GridData) => {
    setIsSaving(true)
    onContentChange?.(JSON.stringify(newGrid))
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave(grid)
  }

  const handleCellChange = (r: number, c: number, val: string) => {
    const newGrid = [...grid]
    newGrid[r] = [...newGrid[r]]
    newGrid[r][c] = val
    setGrid(newGrid)
    triggerSave(newGrid)
  }

  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        getText: () => {
          let text = "Spreadsheet Data:\n"
          for (let r = 0; r < Math.min(20, ROWS); r++) {
            const rowData = grid[r].filter((c) => c.trim() !== "")
            if (rowData.length > 0) text += grid[r].join(" | ") + "\n"
          }
          return text
        },
        chain: () => ({
          focus: () => ({
            insertContent: (text: string) => ({
              run: () => {
                const newGrid = [...grid]
                let targetRow = 0
                while (targetRow < ROWS && newGrid[targetRow].some((c) => c.trim() !== "")) targetRow++
                if (targetRow < ROWS) {
                  newGrid[targetRow] = [...newGrid[targetRow]]
                  newGrid[targetRow][0] = text.replace(/\n/g, " ")
                  setGrid(newGrid)
                  triggerSave(newGrid)
                }
              },
            }),
          }),
        }),
      }
    }
  }, [grid, editorRef])

  const getColLabel = (i: number) => String.fromCharCode(65 + i)

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="h-10 glass-subtle flex items-center px-3 gap-1 shrink-0 overflow-x-auto border-b border-white/[0.04]">
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-white/[0.06] mx-1 shrink-0" />
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
        <div className="ml-auto text-[10px] text-muted-foreground px-2 flex items-center gap-1.5 font-mono bg-white/[0.04] rounded-md py-1 border border-white/[0.04]">
          <Type className="w-3 h-3" />
          {selectedCell ? `${getColLabel(selectedCell.c)}${selectedCell.r + 1}` : "—"}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div className={`w-full max-w-[1200px] flex flex-col transition-all duration-500 min-h-max ${isAgentActive ? "ring-1 ring-emerald-400/40 glow-emerald" : ""}`}>
          <div className="mb-4 px-1 flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-2xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent tracking-tight"
              placeholder="Sheet Title"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isSaving ? (
                <><CloudUpload className="w-3.5 h-3.5 animate-pulse" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" /><span>Saved</span></>
              )}
            </div>
          </div>

          <div className="bg-[oklch(0.13_0.005_260)] border border-white/[0.06] rounded-lg overflow-auto max-h-[75vh] relative">
            <table className="border-collapse w-full text-sm table-fixed">
              <thead>
                <tr>
                  <th className="w-10 bg-[oklch(0.12_0.005_260)] border-r border-b border-white/[0.06] sticky top-0 left-0 z-20" />
                  {Array(COLS).fill(0).map((_, i) => (
                    <th key={`h-${i}`} className="w-24 bg-[oklch(0.12_0.005_260)] border-r border-b border-white/[0.06] font-medium text-muted-foreground py-1 select-none sticky top-0 z-10 text-[10px] tracking-wider">
                      {getColLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, r) => (
                  <tr key={`r-${r}`}>
                    <td className="bg-[oklch(0.12_0.005_260)] border-r border-b border-white/[0.06] text-center text-muted-foreground font-medium select-none sticky left-0 z-10 text-[10px]">
                      {r + 1}
                    </td>
                    {row.map((cell, c) => (
                      <td
                        key={`c-${r}-${c}`}
                        className={`border-r border-b border-white/[0.04] p-0 ${selectedCell?.r === r && selectedCell?.c === c ? "ring-1 ring-primary/50 z-10 relative bg-primary/[0.05]" : ""}`}
                        onClick={() => setSelectedCell({ r, c })}
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          onFocus={() => setSelectedCell({ r, c })}
                          className="w-full h-full px-2 py-1 outline-none bg-transparent text-foreground text-xs"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
