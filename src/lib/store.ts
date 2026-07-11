import { create } from 'zustand';
import { User, UserRole, SiteID } from '../types';

// Safe local session recovery
const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('sg_current_user');
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
};

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const raw = localStorage.getItem('sg_theme');
    return (raw === 'dark' ? 'dark' : 'light');
  } catch {
    return 'light';
  }
};

const getInitialDensity = (): 'compact' | 'standard' | 'large' => {
  try {
    const raw = localStorage.getItem('sg_density');
    return (raw === 'large' ? 'large' : raw === 'compact' ? 'compact' : 'standard');
  } catch {
    return 'standard';
  }
};

const getInitialTextDensity = (): 'LARGE' | 'COMPACT' => {
  try {
    const raw = localStorage.getItem('hydromines-text-density');
    return (raw === 'COMPACT' ? 'COMPACT' : 'LARGE');
  } catch {
    return 'LARGE';
  }
};

const initialUser = getInitialUser();
const initialTheme = getInitialTheme();
const initialDensity = getInitialDensity();
const initialTextDensity = getInitialTextDensity();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeSite: SiteID;
  theme: 'light' | 'dark';
  density: 'compact' | 'standard' | 'large';
  textDensity: 'LARGE' | 'COMPACT';
  isRestrictedModalOpen: boolean;
  pendingRcaPrefill: { enginId: string; categorie: string; pannesIds: string[] } | null;
  setUser: (user: User | null) => void;
  setActiveSite: (siteId: SiteID) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDensity: (density: 'compact' | 'standard' | 'large') => void;
  setTextDensity: (density: 'LARGE' | 'COMPACT') => void;
  openRestrictedModal: () => void;
  closeRestrictedModal: () => void;
  logout: () => void;
  setPendingRcaPrefill: (prefill: { enginId: string; categorie: string; pannesIds: string[] } | null) => void;
  clearPendingRcaPrefill: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  activeSite: initialUser?.role === 'ADMIN' || initialUser?.role === 'DIRECTION' ? 'TOUS' : (initialUser?.siteId || 'SMI'),
  theme: initialTheme,
  density: initialDensity,
  textDensity: initialTextDensity,
  isRestrictedModalOpen: false,
  pendingRcaPrefill: null,
  setUser: (user) => {
    if (user) {
      try {
        localStorage.setItem('sg_current_user', JSON.stringify(user));
      } catch (e) {
        console.error("Failed to commit user to storage session", e);
      }
    } else {
      localStorage.removeItem('sg_current_user');
    }
    set({ 
      user, 
      isAuthenticated: !!user,
      activeSite: user?.role === 'ADMIN' || user?.role === 'DIRECTION' ? 'TOUS' : (user?.siteId || 'SMI')
    });
  },
  setActiveSite: (activeSite) => set({ activeSite }),
  setTheme: (theme) => {
    try {
      localStorage.setItem('sg_theme', theme);
    } catch (e) {
      console.error(e);
    }
    // Update theme class on HTML element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  setDensity: (density) => {
    try {
      localStorage.setItem('sg_density', density);
    } catch (e) {
      console.error(e);
    }
    set({ density });
  },
  setTextDensity: (density) => {
    try {
      localStorage.setItem('hydromines-text-density', density);
    } catch (e) {
      console.error(e);
    }
    set({ textDensity: density });
  },
  openRestrictedModal: () => set({ isRestrictedModalOpen: true }),
  closeRestrictedModal: () => set({ isRestrictedModalOpen: false }),
  logout: () => {
    localStorage.removeItem('sg_current_user');
    set({ user: null, isAuthenticated: false, activeSite: 'TOUS', isRestrictedModalOpen: false });
  },
  setPendingRcaPrefill: (prefill) => set({ pendingRcaPrefill: prefill }),
  clearPendingRcaPrefill: () => set({ pendingRcaPrefill: null }),
}));
