import { Plus, Library, Settings } from "lucide-react"

interface SidebarProps {
  onNewDoc: () => void;
  onViewLibrary: () => void;
  currentView: 'library' | 'editor';
  onOpenSettings?: () => void;
}

export default function Sidebar({ onNewDoc, onViewLibrary, currentView, onOpenSettings }: SidebarProps) {
  return (
    <aside className="w-14 border-r border-white/[0.06] bg-[oklch(0.12_0.005_260)] flex flex-col items-center py-4 shrink-0 transition-all z-10 hidden sm:flex">
      <button
        type="button"
        onClick={onNewDoc}
        className="w-9 h-9 bg-primary/15 hover:bg-primary/25 text-primary rounded-lg flex items-center justify-center mb-6 transition-all glow-sm hover:glow-md"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center gap-2 flex-1 w-full">
        <button
          type="button"
          onClick={onViewLibrary}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            currentView === 'library'
              ? 'bg-white/[0.08] text-foreground glow-sm'
              : 'hover:bg-white/[0.04] text-muted-foreground hover:text-foreground'
          }`}
          title="Library"
        >
          <Library className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </aside>
  )
}
