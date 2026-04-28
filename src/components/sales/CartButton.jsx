import { useCart } from '@/contexts/CartContext'

export default function CartButton() {
  const { items, setOpen, total } = useCart()

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed top-16 right-3 z-40 bg-white rounded-2xl shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2 active:scale-95 transition-transform"
    >
      <span className="text-lg">🛒</span>
      {items.length > 0 ? (
        <>
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500 leading-none">carrinho</span>
            <span className="font-black text-gray-900 text-sm leading-tight">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
            {items.length}
          </span>
        </>
      ) : (
        <span className="text-xs text-gray-400">vazio</span>
      )}
    </button>
  )
}
