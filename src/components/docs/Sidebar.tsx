import { Plus, Library } from "lucide-react"

interface SidebarProps {
  onNewDoc: () => void;
  onViewLibrary: () => void;
  currentView: 'library' | 'editor';
}

export default function Sidebar({ onNewDoc, onViewLibrary, currentView }: SidebarProps) {
  return (
    <aside className="w-14 sm:w-16 border-r border-zinc-200 bg-[#f4f4f5] flex flex-col items-center py-4 shrink-0 transition-all z-10 hidden sm:flex">
      <button 
        type="button" 
        onClick={onNewDoc}
        className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center justify-center shadow-sm mb-6 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center gap-4 flex-1 w-full">
        <button 
          type="button" 
          onClick={onViewLibrary}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            currentView === 'library' 
              ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' 
              : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
          }`}
          title="Library"
        >
          <Library className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}