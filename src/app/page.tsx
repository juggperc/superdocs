import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  FileText, 
  Table, 
  Presentation, 
  ChevronRight, 
  Sparkles,
  Layers
} from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "superdocs | the agentic office suite",
  description: "seamless, minimalist, and powered by advanced ai.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#111111]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <Layers className="w-5 h-5 text-blue-500" />
            superdocs
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#docs" className="hover:text-white transition-colors">docs</Link>
            <Link href="#sheets" className="hover:text-white transition-colors">sheets</Link>
            <Link href="#slides" className="hover:text-white transition-colors">slides</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium border-0 h-9">
                get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            introducing superdocs 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
            the agentic<br />office suite.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl font-light">
            not just tools. intelligent partners that anticipate your next move.<br />
            seamless, minimalist, and powered by advanced ai.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-base font-medium">
                start for free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-white/20 text-white hover:bg-white/5 hover:text-white bg-transparent">
              book a demo
            </Button>
          </div>
        </section>

        {/* Abstract UI Graphic */}
        <section className="mb-32">
          <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/5 relative group bg-gradient-to-br from-zinc-900 to-black">
             {/* Abstract wave decoration */}
             <div className="absolute inset-0 opacity-30">
               <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
               <div className="absolute top-[30%] right-[10%] w-[50%] h-[50%] bg-orange-500/10 blur-[100px] rounded-full mix-blend-screen" />
               <div className="absolute -bottom-[20%] left-[30%] w-[70%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
             </div>
             
             {/* Glass panel overlay to simulate UI */}
             <div className="absolute inset-10 border border-white/5 rounded-2xl bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col">
               <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-zinc-800" />
                 <div className="w-3 h-3 rounded-full bg-zinc-800" />
                 <div className="w-3 h-3 rounded-full bg-zinc-800" />
               </div>
               <div className="flex-1 p-8 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-blue-400" />
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              the apps you know, reinvented.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl font-light">
              experience a workspace where documentation writes itself, data analyzes itself, and presentations design themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Docs Card */}
            <Card className="bg-[#1a1a1a] border-white/5 p-8 rounded-2xl hover:bg-[#222] transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">superdocs docs</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                an intelligent writing environment that drafts perfect prose, summarizes research, and adapts to your brand voice instantly.
              </p>
            </Card>

            {/* Sheets Card */}
            <Card className="bg-[#1a1a1a] border-white/5 p-8 rounded-2xl hover:bg-[#222] transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Table className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">superdocs sheets</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                relational data analysis that anticipates your needs, automatically cleaning data and generating insights without complex formulas.
              </p>
            </Card>

            {/* Slides Card */}
            <Card className="bg-[#1a1a1a] border-white/5 p-8 rounded-2xl hover:bg-[#222] transition-colors group">
              <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">superdocs slides</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                presentations that design themselves. input your outline, and watch as layouts, typography, and visuals are orchestrated perfectly.
              </p>
            </Card>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} superdocs inc. all rights reserved.
        </div>
      </footer>
    </div>
  )
}
