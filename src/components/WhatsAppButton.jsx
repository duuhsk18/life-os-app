// =============================================================================
// WhatsApp Floating Button
// =============================================================================
// Botão fixo no canto inferior direito, aparece em landing pages e checkout.
// Mensagem pré-preenchida varia pelo contexto (página atual).
//
// Configura o número via env var: VITE_SUPPORT_WHATSAPP=5511999999999
// Se não setado, o botão não aparece (zero impacto).
// =============================================================================

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const WHATSAPP_NUMBER = import.meta.env.VITE_SUPPORT_WHATSAPP || ''

// Mensagens contextuais por rota (regex match)
const CONTEXTUAL_MESSAGES = [
  { pattern: /^\/p\/receitas-low-carb/,     msg: 'Oi! Tô na página das Receitas Low Carb e tenho uma dúvida.' },
  { pattern: /^\/p\/planilhas-treino/,      msg: 'Oi! Tô vendo as Planilhas de Treino e queria tirar uma dúvida.' },
  { pattern: /^\/p\/receitas-indigenas/,    msg: 'Oi! Tô na página das Receitas Indígenas e queria saber mais.' },
  { pattern: /^\/p\/templates-notion/,      msg: 'Oi! Tô vendo os Templates Notion e tenho uma dúvida.' },
  { pattern: /^\/p\/ebooks-autoajuda/,      msg: 'Oi! Tô vendo a Coleção de Ebooks e queria saber mais.' },
  { pattern: /^\/p\/planilhas-financeiras/, msg: 'Oi! Tô vendo as Planilhas Financeiras e tenho uma dúvida.' },
  { pattern: /^\/p\/life-os/,               msg: 'Oi! Quero saber mais sobre o Life OS antes de assinar.' },
  { pattern: /^\/checkout/,                 msg: 'Oi! Tô finalizando uma compra e preciso de ajuda.' },
  { pattern: /^\/pagamento\/pix/,           msg: 'Oi! Acabei de pagar via Pix mas precisei de ajuda com o acesso.' },
  { pattern: /^\/obrigado/,                 msg: 'Oi! Comprei e tenho uma dúvida sobre o acesso.' },
  { pattern: /^\/minha-conta/,              msg: 'Oi! Sou cliente e preciso de suporte.' },
]

const DEFAULT_MESSAGE = 'Oi! Quero saber mais sobre os produtos da Agência Criativa.'

export default function WhatsAppButton() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  // Aparece com delay (não invasivo)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  if (!WHATSAPP_NUMBER) return null

  // Esconde em rotas de membros (lá tem suporte interno)
  if (location.pathname.startsWith('/membros')) return null

  // Pega mensagem contextual
  const ctx = CONTEXTUAL_MESSAGES.find((c) => c.pattern.test(location.pathname))
  const message = ctx?.msg || DEFAULT_MESSAGE
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-5 right-5 z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        background: '#25D366',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  )
}
