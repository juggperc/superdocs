"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarDays, CloudUpload, CheckCircle2, Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface SheetEditorProps {
  isAgentActive?: boolean
  initialContent?: string
  initialTitle?: string
  onContentChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  editorRef?: any
}

// Simple 2D array representation
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
    } catch (e) {}
    
    // Default empty grid
    return Array(ROWS).fill(0).map(() => Array(COLS).fill(""))
  })

  // Selected cell
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null)

  const triggerSave = (newGrid: GridData) => {
    setIsSaving(true)
    onContentChange?.(JSON.stringify(newGrid))
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false)
    }, 1000)
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

  // Expose a method for the Agent to get text content of the sheet
  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        getText: () => {
          let text = "Spreadsheet Data:\n"
          for (let r = 0; r < Math.min(20, ROWS); r++) {
            const rowData = grid[r].filter(c => c.trim() !== "")
            if (rowData.length > 0) {
              text += grid[r].join(" | ") + "\n"
            }
          }
          return text
        },
        chain: () => ({
          focus: () => ({
            insertContent: (text: string) => ({
              run: () => {
                // For MVP, just append agent text to the first empty row in col A
                const newGrid = [...grid]
                let targetRow = 0
                while (targetRow < ROWS && newGrid[targetRow].some(c => c.trim() !== "")) {
                  targetRow++
                }
                if (targetRow < ROWS) {
                  newGrid[targetRow] = [...newGrid[targetRow]]
                  newGrid[targetRow][0] = "AI: " + text.replace(/\n/g, " ")
                  setGrid(newGrid)
                  triggerSave(newGrid)
                }
              }
            })
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, editorRef])

  const getColLabel = (i: number) => String.fromCharCode(65 + i)

  return (
    <main className="flex-1 flex flex-col bg-[#eaeaea] overflow-hidden relative">
      
      {/* Top Formatting Ribbon (Mocked functionality for now) */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button type="button" className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors" title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
        
        <div className="ml-auto text-xs text-zinc-400 px-2 flex items-center gap-2 font-mono bg-zinc-100 rounded-md py-1">
          <Type className="w-3 h-3" />
          {selectedCell ? `${getColLabel(selectedCell.c)}${selectedCell.r + 1}` : 'No cell'}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-white/50">
        <div className={`w-full max-w-[1200px] flex flex-col transition-all duration-500 min-h-max
            ${isAgentActive ? 'ring-2 ring-green-500/50 ring-offset-4 ring-offset-[#eaeaea] shadow-green-500/10 shadow-xl' : ''}
          `}
        >
          {/* Document Header */}
          <div className="mb-6 px-2 pt-4">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-3">
              <CalendarDays className="w-4 h-4" />
              <span>Last edited {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="mx-2 text-zinc-300">•</span>
              <span className="flex items-center gap-1.5 transition-colors">
                {isSaving ? (
                  <>
                    <CloudUpload className="w-4 h-4 animate-pulse text-zinc-500" />
                    <span className="text-zinc-500">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500/70" />
                    <span className="text-zinc-500">Saved to library</span>
                  </>
                )}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-4xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none bg-transparent"
              placeholder="Sheet Title"
            />
          </div>

          {/* Grid Container */}
          <div className="bg-white border border-zinc-300 shadow-sm overflow-auto max-h-[70vh] relative">
             <table className="border-collapse w-full text-sm table-fixed">
               <thead>
                 <tr>
                   <th className="w-10 bg-zinc-50 border-r border-b border-zinc-300 sticky top-0 left-0 z-20"></th>
                   {Array(COLS).fill(0).map((_, i) => (
                     <th key={`header-${i}`} className="w-24 bg-zinc-50 border-r border-b border-zinc-300 font-medium text-zinc-600 py-1 select-none sticky top-0 z-10 font-sans">
                       {getColLabel(i)}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {grid.map((row, r) => (
                   <tr key={`row-${r}`}>
                     <td className="bg-zinc-50 border-r border-b border-zinc-300 text-center text-zinc-500 font-medium select-none sticky left-0 z-10 font-sans text-xs">
                       {r + 1}
                     </td>
                     {row.map((cell, c) => (
                       <td 
                         key={`cell-${r}-${c}`} 
                         className={`border-r border-b border-zinc-200 p-0 m-0 ${selectedCell?.r === r && selectedCell?.c === c ? 'ring-2 ring-green-500 z-10 relative bg-green-50/10' : ''}`}
                         onClick={() => setSelectedCell({ r, c })}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') setSelectedCell({ r, c })
                         }}
                       >
                         <input 
                           type="text"
                           value={cell}
                           onChange={(e) => handleCellChange(r, c, e.target.value)}
                           onFocus={() => setSelectedCell({ r, c })}
                           className="w-full h-full px-2 py-1 outline-none bg-transparent font-sans text-zinc-800"
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