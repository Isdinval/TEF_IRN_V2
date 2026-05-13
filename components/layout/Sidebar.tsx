'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useUserLevel } from '@/lib/hooks/useUserLevel'

// Import des icônes Lucide
import { 
  LayoutDashboard, 
  BookOpen, 
  Edit3, 
  Mic, 
  SpellCheck, 
  ClipboardList, 
  Radar as RadarIcon,
  LogOut 
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/bibliotheque', icon: BookOpen, label: 'Bibliothèque' },
  { href: '/ecriture', icon: Edit3, label: 'Écriture' },
  { href: '/coach-oral', icon: Mic, label: 'Coach Oral' },
  { href: '/corrections', icon: SpellCheck, label: 'Corrections' },
  { href: '/exercices', icon: ClipboardList, label: 'Exercices' },
  { href: '/radar', icon: RadarIcon, label: 'Radar de compétences' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'JD'

  const { level } = useUserLevel()

  return (
    <aside 
      style={{
        width: 'var(--nav-width)', 
        backgroundColor: 'var(--color-surface)', 
        borderRight: '1px solid var(--color-muted)', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        zIndex: 50, 
        flexShrink: 0 
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--color-muted)' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '20px', 
          fontWeight: 600, 
          color: 'var(--color-text)', 
          lineHeight: 1.2, 
          margin: 0 
        }}>
          L'Académie Moderne
        </h1>
        <p style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase', 
          color: 'var(--color-muted)', 
          marginTop: '4px' 
        }}>
          Préparation TEF IRN
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1, 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2px' 
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '2px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                backgroundColor: isActive ? 'var(--color-hover-blue)' : 'transparent',
                border: isActive ? '1px solid rgba(0,51,204,0.15)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-hover-blue)'
                  e.currentTarget.style.color = 'var(--color-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text)'
                }
              }}
            >
              <Icon 
                size={20} 
                strokeWidth={2.25} 
                style={{ 
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)' 
                }} 
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profil + Déconnexion */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-muted)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '8px 12px' 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-muted)', 
            border: '1px solid var(--color-text)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '11px', 
            fontWeight: 700, 
            flexShrink: 0 
          }}>
            {initials}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--color-text)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {profile?.full_name || 'Candidat'}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--color-muted)' 
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Niveau estimé : {level?.global_level || profile?.niveau_estime || 'A2'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSignOut} 
            title="Déconnexion" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--color-muted)', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
