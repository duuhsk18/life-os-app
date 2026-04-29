/**
 * GarantiaBadge — selo "7 dias garantidos" pra colocar perto dos CTAs.
 * Variantes:
 *   - "compact": só texto + ícone, inline
 *   - "stamp":   selo SVG completo
 */
export default function GarantiaBadge({ variant = 'compact', className = '' }) {
  if (variant === 'stamp') {
    return (
      <img
        src="/assets/garantia-7-dias-3d.png"
        alt="Garantia incondicional de 7 dias"
        className={`w-28 h-28 sm:w-32 sm:h-32 ${className}`}
        width="128"
        height="128"
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${className}`}
      style={{
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#22c55e',
      }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      7 dias garantidos · devolvemos sem perguntar
    </div>
  )
}
