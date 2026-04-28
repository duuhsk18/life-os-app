import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'lifeos_cart'
const MAX_ITEMS = 3

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch { return [] }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    setItems(prev => {
      if (prev.find(i => i.slug === product.slug)) return prev
      if (prev.length >= MAX_ITEMS) return prev
      return [...prev, { slug: product.slug, title: product.title, price: product.price, emoji: product.emoji, color: product.color }]
    })
    setOpen(true)
  }

  const removeItem = (slug) => {
    setItems(prev => prev.filter(i => i.slug !== slug))
  }

  const hasItem = (slug) => items.some(i => i.slug === slug)

  const total = items.reduce((s, i) => s + i.price, 0)

  const clear = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, hasItem, total, open, setOpen, clear, MAX_ITEMS }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
