import { ReactNode } from 'react'

export function AppPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen space-y-5 p-4 md:p-8"
      style={{
        background:
          'radial-gradient(70rem 40rem at 85% -10%, rgba(91,33,182,0.18), transparent 55%), radial-gradient(50rem 30rem at 10% 0%, rgba(192,38,211,0.10), transparent 50%), var(--color-background)',
      }}
    >
      {children}
    </div>
  )
}

export function AppPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`border shadow-sm ${className}`}
      style={{
        borderColor: 'rgba(100,116,139,0.28)',
        borderRadius: '2px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,247,252,0.92) 100%)',
      }}
    >
      {children}
    </section>
  )
}

export function PageErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div className="p-6" style={{ borderRadius: '2px', border: '1px solid #fecaca', background: '#fef2f2', color: '#881337' }}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm">{message}</p>
      <button onClick={onRetry} className="mt-4 px-4 py-2 text-sm font-medium" style={{ borderRadius: '2px', border: '1px solid #fca5a5', background: 'white' }}>
        Réessayer
      </button>
    </div>
  )
}
