import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variant) => {
        const items = get().items
        const existingIndex = items.findIndex(
          item => item.variant?.sku === variant?.sku
        )

        if (existingIndex >= 0) {
          const newItems = [...items]
          newItems[existingIndex].quantity += 1
          set({ items: newItems })
        } else {
          set({
            items: [
              ...items,
              {
                id: Date.now(),
                product,
                variant,
                quantity: 1,
              },
            ],
          })
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter(item => item.id !== itemId),
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce(
        (sum, item) => sum + (item.variant?.price || 0) * item.quantity, 
        0
      ),
    }),
    {
      name: 'florist-cart',
    }
  )
)
