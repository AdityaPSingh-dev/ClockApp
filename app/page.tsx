import { ProductivityTimer } from "@/components/productivity-timer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/10 to-cyan-200/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <ProductivityTimer />
      </div>
    </main>
  )
}
