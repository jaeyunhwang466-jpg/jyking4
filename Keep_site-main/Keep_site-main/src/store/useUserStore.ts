import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique id for cart item
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
}

interface UserStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  likedProductIds: string[];
  toggleLike: (productId: string) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
        set({ theme });
      },
      likedProductIds: [],
      toggleLike: (productId) => set((state) => ({
        likedProductIds: state.likedProductIds.includes(productId)
          ? state.likedProductIds.filter((id) => id !== productId)
          : [...state.likedProductIds, productId],
      })),
      cart: [],
      addToCart: (itemData) => set((state) => {
        const existingItem = state.cart.find(
          (c) => c.productId === itemData.productId && c.color === itemData.color && c.size === itemData.size
        );
        if (existingItem) {
          return {
            cart: state.cart.map((c) =>
              c.id === existingItem.id ? { ...c, quantity: c.quantity + itemData.quantity } : c
            )
          };
        }
        const newItem: CartItem = {
          ...itemData,
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        return { cart: [...state.cart, newItem] };
      }),
    }),
    {
      name: 'keep-user-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      }
    }
  )
);
