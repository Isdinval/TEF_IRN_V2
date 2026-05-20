import { ReactNode } from 'react'

export function AppPage({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#ede9fe,transparent_45%),var(--color-background)] p-4 md:p-8 space-y-5">{children}</div>
}

export function AppPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-violet-200/60 bg-gradient-to-b from-white to-violet-50/40 shadow-sm ${className}`}>{children}</section>
}

export function PageErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm mt-1">{message}</p>
      <button onClick={onRetry} className="mt-4 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium hover:bg-rose-100">
        Réessayer
      </button>
    </div>
  )
}
