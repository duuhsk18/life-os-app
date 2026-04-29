import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Meta Pixel + Auto PageView tracking.
 *
 * Configuração: setar VITE_META_PIXEL_ID no Vercel env vars.
 * Sem essa env var, o componente é no-op (não carrega nada, não quebra).
 *
 * Eventos automáticos:
 *   - PageView: dispara em toda mudança de rota
 *
 * Eventos manuais (chamar via window.fbq onde fizer sentido):
 *   - ViewContent (no SalesPage)
 *   - AddToCart (no CartContext.addItem)
 *   - InitiateCheckout (ao clicar "Comprar")
 *   - Lead (no LeadMagnetPopup ao capturar email)
 *   - Purchase: vem via Conversion API server-side (mais preciso, contorna iOS 14.5+)
 */
export default function MetaPixel() {
  const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID
  const location = useLocation()

  // Carrega o pixel base UMA vez
  useEffect(() => {
    if (!PIXEL_ID || typeof window === 'undefined') return
    if (window.fbq) return // já carregado

    // Snippet oficial Meta Pixel
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return; n=f.fbq=function(){n.callMethod ?
      n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
      n.queue=[]; t=b.createElement(e); t.async=!0; t.src=v;
      s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */

    window.fbq('init', PIXEL_ID)
    window.fbq('track', 'PageView')
    console.log('[meta-pixel] inicializado')
  }, [PIXEL_ID])

  // PageView automático em mudança de rota (SPA)
  useEffect(() => {
    if (!PIXEL_ID || !window.fbq) return
    window.fbq('track', 'PageView')
  }, [location.pathname, PIXEL_ID])

  // Sem ID configurado → no-op (não renderiza nada)
  if (!PIXEL_ID) return null

  // <noscript> fallback pra usuários sem JS (raro mas conta pra Meta)
  return (
    <noscript>
      <img height="1" width="1" alt=""
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  )
}

/**
 * Helper pra disparar eventos custom em qualquer lugar do app.
 * Uso: trackPixel('AddToCart', { content_name: 'Receitas Low Carb', value: 27.90, currency: 'BRL' })
 */
export function trackPixel(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.fbq) return
  try {
    window.fbq('track', eventName, params)
  } catch (e) {
    console.warn('[meta-pixel] erro ao trackear:', e)
  }
}
