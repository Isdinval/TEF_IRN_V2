import { ReactNode } from 'react'

export function AppPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen space-y-5 p-4 md:p-8"
      style={{
        background:
          'radial-gradient(90rem 48rem at 85% -10%, rgba(91,33,182,0.34), transparent 58%), radial-gradient(60rem 38rem at 8% 2%, rgba(192,38,211,0.24), transparent 56%), radial-gradient(44rem 28rem at 55% 110%, rgba(79,70,229,0.18), transparent 62%), #f3effd',
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
        borderColor: 'rgba(91,33,182,0.32)',
        borderRadius: '2px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(238,231,255,0.9) 100%)',
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
