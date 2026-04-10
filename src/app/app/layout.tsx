export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col h-screen bg-background text-foreground font-sans">{children}</div>
}
