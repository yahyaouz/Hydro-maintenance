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
    return (raw === 'large' ? 'large' : raw === 'standard' ? 'standard' : 'compact');
  } catch {
    return 'compact';
  }
};

const initialUser = getInitialUser();
const initialTheme = getInitialTheme();
const initialDensity = getInitialDensity();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeSite: SiteID;
  theme: 'light' | 'dark';
  density: 'compact' | 'standard' | 'large';
  isRestrictedModalOpen: boolean;
  setUser: (user: User | null) => void;
  setActiveSite: (siteId: SiteID) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDensity: (density: 'compact' | 'standard' | 'large') => void;
  openRestrictedModal: () => void;
  closeRestrictedModal: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  activeSite: initialUser?.role === 'ADMIN' || initialUser?.role === 'DIRECTION' ? 'TOUS' : (initialUser?.siteId || 'SMI'),
  theme: initialTheme,
  density: initialDensity,
  isRestrictedModalOpen: false,
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
  openRestrictedModal: () => set({ isRestrictedModalOpen: true }),
  closeRestrictedModal: () => set({ isRestrictedModalOpen: false }),
  logout: () => {
    localStorage.removeItem('sg_current_user');
    set({ user: null, isAuthenticated: false, activeSite: 'TOUS', isRestrictedModalOpen: false });
  },
}));
