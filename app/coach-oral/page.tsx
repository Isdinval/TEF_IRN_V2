'use client'
import { useEffect, useRef, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Message } from '@/lib/supabase'

const SUJET = 'Convaincre un ami de participer à un projet de quartier'

export default function CoachOralPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hints, setHints] = useState<string>('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
   const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  
  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'fr-FR'

        recognitionRef.current.onresult = (event: any) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setInput(transcript)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])
  
  
  useEffect(() => {
    if (!user || initialized) return
    initConversation()
  }, [user, initialized])

  const initConversation = async () => {
    setInitialized(true)
    // Start conversation with examiner's first message
    setLoading(true)
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], sujet: SUJET, lastUserMessage: null }),
      })
      const data = await res.json()

      const firstMsg: Message = {
        role: 'examiner',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }

      const newMessages = [firstMsg]
      setMessages(newMessages)
      if (data.hints) setHints(data.hints)

      // Create conversation in DB
      const { data: conv } = await supabase.from('conversations_coach').insert({
        user_id: user!.id,
        sujet: SUJET,
        messages: newMessages,
        statut: 'en_cours',
      }).select().single()
      if (conv) setConversationId(conv.id)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, sujet: SUJET, lastUserMessage: input.trim() }),
      })
      const data = await res.json()

      const examinerMsg: Message = {
        role: 'examiner',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }

      const finalMessages = [...newMessages, examinerMsg]
      setMessages(finalMessages)
      if (data.hints) setHints(data.hints)

      // Update DB
      if (conversationId) {
        await supabase.from('conversations_coach').update({
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        }).eq('id', conversationId)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetConversation = async () => {
    if (conversationId) {
      await supabase.from('conversations_coach').update({ statut: 'termine' }).eq('id', conversationId)
    }
    setMessages([])
    setHints('')
    setConversationId(null)
    setInitialized(false)
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          padding: '24px 40px',
          borderBottom: '1px solid var(--color-muted)',
          backgroundColor: 'var(--color-surface)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>
              Simulation de l'Épreuve Orale
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px' }}>
              Sujet : {SUJET}
            </p>
          </div>
          <button
            onClick={resetConversation}
            style={{ background: 'none', border: '1px solid var(--color-muted)', borderRadius: '2px', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            Nouveau sujet
          </button>
        </header>

        {/* Constrained chat column */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--color-muted)',
            borderRight: '1px solid var(--color-muted)',
            backgroundColor: 'var(--color-surface)',
            overflow: 'hidden',
          }}>
            {/* Chat history */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {messages.length === 0 && !loading && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>
                  Initialisation de la session...
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    maxWidth: '85%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '2px',
                      border: '1px solid var(--color-muted)',
                      backgroundColor: msg.role === 'examiner' ? 'var(--color-background)' : 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: msg.role === 'examiner' ? 'var(--color-text)' : 'white' }}>
                        {msg.role === 'examiner' ? 'account_balance' : 'person'}
                      </span>
                    </div>
                  </div>

                  {/* Bubble */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                        {msg.role === 'examiner' ? 'Examinateur' : 'Vous'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{msg.timestamp}</span>
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: '2px',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      ...(msg.role === 'examiner'
                        ? { backgroundColor: 'var(--color-background)', border: '1px solid var(--color-muted)', color: 'var(--color-text)' }
                        : { backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'right' as const }),
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '16px', maxWidth: '85%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '2px', border: '1px solid var(--color-muted)', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-text)' }}>account_balance</span>
                  </div>
                  <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-muted)', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-muted)',
                        animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                    <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }`}</style>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{ flexShrink: 0, padding: '20px 24px', borderTop: '1px solid var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{
                  flex: 1,
                  border: '1px solid var(--color-muted)',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-surface)',
                  transition: 'border-color 0.15s',
                }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tapez votre réponse ou utilisez le microphone..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '14px',
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                      backgroundColor: 'transparent',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Mic button */}
                <button
                  aria-label="Microphone"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-primary)'; ;(e.currentTarget as HTMLElement).style.color = 'white' }}
                  onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-background)'; ;(e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '26px', fontVariationSettings: "'FILL' 1" }}>mic</span>
                </button>

                {/* Send button */}
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    height: '48px',
                    padding: '0 28px',
                    backgroundColor: loading || !input.trim() ? 'var(--color-muted)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    flexShrink: 0,
                  }}
                >
                  Envoyer
                </button>
              </div>

              {/* Hints */}
              {hints && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingLeft: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-muted)' }}>lightbulb</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500 }}>
                    Vocabulaire suggéré : <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{hints}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
