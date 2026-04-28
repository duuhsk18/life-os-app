import { KIT_COMPLETO } from '@/lib/sales-data'

export default function OrderBump({ checked, onChange }) {
  return (
    <div
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
        checked ? 'border-green-500 bg-green-50' : 'border-dashed border-orange-400 bg-orange-50'
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${
          checked ? 'bg-green-500 border-green-500' : 'border-orange-400 bg-white'
        }`}>
          {checked && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <div>
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">⚡ Oferta especial — Apenas para quem está comprando agora!</p>
          <p className="font-black text-gray-900 text-base leading-tight">
            {KIT_COMPLETO.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">{KIT_COMPLETO.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 line-through text-sm">R$ {KIT_COMPLETO.totalValue.toFixed(2).replace('.', ',')}</span>
            <span className="text-green-600 font-black text-lg">
              + R$ {KIT_COMPLETO.bumpPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {KIT_COMPLETO.items.slice(0, 4).map((item, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                <span className="text-green-500">✓</span> {item.split('—')[0].trim()}
              </li>
            ))}
            {KIT_COMPLETO.items.length > 4 && (
              <li className="text-xs text-gray-500">+ {KIT_COMPLETO.items.length - 4} mais...</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
