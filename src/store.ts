import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  is_verified?: boolean;
  isVerified?: boolean;
  identityUrl?: string | null;
  identity_url?: string | null;
  isDemo?: boolean;
}

interface ActivityLog {
  id?: number | string;
  action: string;
  time?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  notifs: any[]; // SystemNotifs
  activities: ActivityLog[];
  
  cart: { item: any; qty: number }[];
  isCartOpen: boolean;

  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  addActivity: (action: string) => void;
  setNotifs: (notifs: any) => void;
  setCart: (cart: any) => void;
  setIsCartOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>((set) => {
  const token = localStorage.getItem('outrent_token');
  const user = JSON.parse(localStorage.getItem('outrent_user') || 'null');
  const cart = JSON.parse(localStorage.getItem('bc_cart_2026') || '[]');

  return {
    user,
    token,
    notifs: [],
    activities: [],
    cart,
    isCartOpen: false,

    setAuth: (newUser, newToken) => {
      if (newToken && newUser) {
        localStorage.setItem('outrent_token', newToken);
        localStorage.setItem('outrent_user', JSON.stringify(newUser));
        set({ user: newUser, token: newToken });
      } else {
        localStorage.removeItem('outrent_token');
        localStorage.removeItem('outrent_user');
        set({ user: null, token: null });
      }
    },
    logout: () => {
      localStorage.removeItem('outrent_token');
      localStorage.removeItem('outrent_user');
      set({ user: null, token: null });
    },
    addActivity: (action) => {
      set((state) => ({ activities: [{ id: Date.now(), action, time: 'Baru saja' }, ...state.activities] }));
    },
    setNotifs: (newNotifs) => {
      set((state) => {
        const updated = typeof newNotifs === 'function' ? newNotifs(state.notifs) : newNotifs;
        return { notifs: updated };
      });
    },
    setCart: (newCart) => {
      set((state) => {
        const updated = typeof newCart === 'function' ? newCart(state.cart) : newCart;
        localStorage.setItem('bc_cart_2026', JSON.stringify(updated));
        return { cart: updated };
      });
    },
    setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen })
  };
});
