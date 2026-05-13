// app/ecriture/page.tsx
import { Suspense } from 'react'
import EcritureClient from './EcritureClient'

export default function EcriturePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '17px',
        backgroundColor: '#f8f9fa'
      }}>
        Chargement des sujets d'écriture...
      </div>
    }>
      <EcritureClient />
    </Suspense>
  )
}
