import { Button } from "@/components/ui/button"
import {
  FileText,
  Table,
  Presentation,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "superdocs — AI-Native Workspace",
  description: "Unified workspace where AI connects your docs, sheets, and slides.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full glass-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-foreground font-semibold text-sm tracking-tight">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            superdocs
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {["Docs", "Sheets", "Slides"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/[0.04]"
              >
                {item}
              </Link>
            ))}
          </nav>

          <Link href="/app">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 h-8 text-sm font-medium glow-sm">
              Open App
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative pt-28 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none">
            <div className="absolute top-0 left-[20%] w-72 h-72 bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute top-[30%] right-[10%] w-56 h-56 bg-purple-500/15 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-[40%] w-64 h-48 bg-cyan-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Your workspace, connected by AI
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
              <span className="text-foreground">One workspace.</span>
              <br />
              <span className="text-gradient">Every document type.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Docs, sheets, and slides in a unified environment.
              superdocs AI reads across all of them to make real edits — not just suggestions.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link href="/app">
                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6 h-10 text-sm font-semibold">
                  Start Building
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[oklch(0.12_0.005_260)] noise">
              <div className="h-10 border-b border-white/[0.06] flex items-center px-4 gap-2 glass-subtle">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="flex-1 flex justify-center">
                  <div className="text-[10px] text-muted-foreground/60 font-mono">superdocs.app</div>
                </div>
              </div>
              <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
                <div className="relative flex items-center gap-6 flex-wrap justify-center">
                  {[
                    { icon: FileText, label: "Doc", color: "text-blue-400" },
                    { icon: Table, label: "Sheet", color: "text-emerald-400" },
                    { icon: Presentation, label: "Slide", color: "text-amber-400" },
                  ].map((item) => (
                    <div key={item.label} className="glass rounded-xl p-6 flex flex-col items-center gap-3 w-28 hover:bg-white/[0.06] transition-colors">
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-2.5">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-sm">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
                </div>
                <p className="mt-4 text-xs text-muted-foreground/70 font-medium">superdocs reads across all your files</p>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Three editors. One AI brain.
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Each tool is purpose-built. superdocs connects them all, so updating a slide from a spreadsheet is one sentence away.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: FileText,
                  title: "Docs",
                  desc: "Rich text editor with full formatting. Write, structure, and let superdocs draft or refine sections in your voice.",
                  color: "text-blue-400",
                  glow: "group-hover:shadow-[0_0_30px_oklch(0.65_0.15_250/12%)]",
                },
                {
                  icon: Table,
                  title: "Sheets",
                  desc: "Spreadsheet grid for structured data. superdocs can read cell values and generate analysis across your workspace.",
                  color: "text-emerald-400",
                  glow: "group-hover:shadow-[0_0_30px_oklch(0.70_0.15_160/12%)]",
                },
                {
                  icon: Presentation,
                  title: "Slides",
                  desc: "Canvas-based presentation builder. Position text elements on a 16:9 stage, let superdocs populate content from your docs.",
                  color: "text-amber-400",
                  glow: "group-hover:shadow-[0_0_30px_oklch(0.70_0.15_60/12%)]",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`group glass-subtle rounded-xl p-6 border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.05] ${item.glow}`}
                >
                  <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                How it works
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Bring your own OpenRouter API key. Pick any model. superdocs handles the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Globe,
                  title: "Workspaces",
                  desc: "Group related files into semantic workspaces. superdocs uses this as its context boundary.",
                },
                {
                  icon: Zap,
                  title: "Cross-file AI",
                  desc: "Ask superdocs to read from one file and write to another. It sees your entire workspace.",
                },
                {
                  icon: Shield,
                  title: "Your keys, your data",
                  desc: "BYOK via OpenRouter. No data leaves your browser except to the model you choose.",
                },
              ].map((item) => (
                <div key={item.title} className="glass-subtle rounded-xl p-6">
                  <item.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Ready to try it?
            </h2>
            <p className="text-muted-foreground mb-8">
              Runs entirely in your browser. Add your OpenRouter key in settings and start working.
            </p>
            <Link href="/app">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 h-10 text-sm font-semibold glow-md">
                Open superdocs
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            superdocs
          </div>
          <span>Built for people who ship.</span>
        </div>
      </footer>
    </div>
  )
}
