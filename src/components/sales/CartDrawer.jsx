import { useCart } from '@/contexts/CartContext'
import { LIFE_OS } from '@/lib/sales-data'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CartDrawer() {
  const { items, removeItem, total, open, setOpen, MAX_ITEMS, clear } = useCart()
  const navigate = useNavigate()
  const [addedLifeOS, setAddedLifeOS] = useState(false)

  const lifeOSPrice = addedLifeOS ? LIFE_OS.price : 0
  const grandTotal = total + lifeOSPrice

  const handleCheckout = () => {
    // If single item, go to that product's checkout; if multiple, go to a combined checkout
    // For now: navigate to obrigado page with OTO offer
    setOpen(false)
    clear()
    navigate('/oto/life-os')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">Seu carrinho</h2>
            <p className="text-xs text-gray-500">{items.length}/{MAX_ITEMS} produtos selecionados</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-gray-500 text-sm">Seu carrinho está vazio</p>
              <p className="text-gray-400 text-xs mt-1">Adicione produtos para continuar</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.slug} className={`bg-gradient-to-r ${item.color} rounded-xl p-3 flex items-center gap-3`}>
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight line-clamp-1">{item.title.split('—')[0].trim()}</p>
                  <p className="text-white/80 font-black text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                  onClick={() => removeItem(item.slug)}
                  className="text-white/60 hover:text-white text-lg leading-none w-6 h-6 flex items-center justify-center flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          {/* Slots restantes */}
          {items.length > 0 && items.length < MAX_ITEMS && (
            <div
              onClick={() => setOpen(false)}
              className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-gray-300 transition"
            >
              <p className="text-gray-400 text-sm">+ Adicionar mais {MAX_ITEMS - items.length} produto{MAX_ITEMS - items.length > 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Life OS upsell */}
          {items.length > 0 && (
            <div className="mt-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">🔥 Adicione também</p>
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer mt-0.5 ${
                    addedLifeOS ? 'bg-orange-500 border-orange-500' : 'border-orange-300 bg-white'
                  }`}
                  onClick={() => setAddedLifeOS(v => !v)}
                >
                  {addedLifeOS && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <div className="flex-1" onClick={() => setAddedLifeOS(v => !v)} style={{ cursor: 'pointer' }}>
                  <p className="font-black text-gray-900 text-sm leading-tight">⚡ Life OS — Sistema Completo</p>
                  <p className="text-gray-500 text-xs mt-0.5">1º mês com desconto especial</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 line-through text-xs">R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}</span>
                    <span className="text-orange-600 font-black text-sm">R$ {LIFE_OS.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Total</span>
              <span className="font-black text-gray-900 text-xl">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 text-center">
              {items.length} produto{items.length > 1 ? 's' : ''}{addedLifeOS ? ' + Life OS' : ''} · pagamento único
            </p>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black py-4 rounded-xl text-base active:scale-95 transition-transform shadow-lg"
            >
              Finalizar compra →
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">🔒 Pagamento 100% seguro</p>
          </div>
        )}
      </div>
    </>
  )
}
