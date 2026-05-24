import { SiteID, UserRole } from '../types';

export interface UserDocument {
  userId: string;       // Standardized user primary key
  uid: string;          // For backward compatibility
  name: string;         // human formatted name
  displayName: string;  // backward compatibility
  email: string;        // contact email
  role: UserRole;       // Assigned role of operation
  siteId: SiteID;       // Site filter associated matching access rights
  badge: string;        // Badge physical reference
  speciality?: string;  // Tech profile details
}

export const usersRepository = {
  getProfiles(): UserDocument[] {
    return [
      { userId: "prof_1", uid: "prof_1", name: "Ahmed El Alaoui", displayName: "Ahmed El Alaoui", email: "ahmed.alaoui@hydromines.ma", role: "RESPONSABLE_MAINTENANCE", siteId: "SMI", badge: "M-4509 (Superviseur)" },
      { userId: "prof_2", uid: "prof_2", name: "Karim Benjelloun", displayName: "Karim Benjelloun", email: "karim.ben@hydromines.ma", role: "MECANICIEN", siteId: "SMI", badge: "T-8921 (Tech Hydromécas)" },
      { userId: "prof_3", uid: "prof_3", name: "Fatima Zahra", displayName: "Fatima Zahra", email: "fatima.z@hydromines.ma", role: "SECRETAIRE", siteId: "SMI", badge: "SEC-102 (Saisie GMAO)" },
      { userId: "prof_4", uid: "prof_4", name: "Youssef Nassiri", displayName: "Youssef Nassiri", email: "youss.nas@hydromines.ma", role: "RESPONSABLE_CHANTIER", siteId: "OUMEJRANE", badge: "RC-703 (Chef Exploitation)" },
      { userId: "prof_5", uid: "prof_5", name: "Directeur de Division", displayName: "Directeur de Division", email: "division.dir@hydromines.ma", role: "DIRECTION", siteId: "TOUS", badge: "DIR-001 (Direction Maroc)" },
      { userId: "prof_6", uid: "prof_6", name: "Admin Système IT", displayName: "Admin Système IT", email: "admin@hydromines.ma", role: "ADMIN", siteId: "TOUS", badge: "IT-999 (Administrateur)" }
    ];
  },

  getCurrentUser(): UserDocument | null {
    const raw = localStorage.getItem('sg_current_user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const id = parsed.userId || parsed.uid || 'prof_1';
      return {
        userId: id,
        uid: id,
        name: parsed.name || parsed.displayName || '',
        displayName: parsed.displayName || parsed.name || '',
        email: parsed.email || '',
        role: parsed.role || 'RESPONSABLE_MAINTENANCE',
        siteId: parsed.siteId || 'SMI',
        badge: parsed.badge || 'M-4509 (Superviseur)',
        speciality: parsed.speciality
      };
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserDocument): void {
    localStorage.setItem('sg_current_user', JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem('sg_current_user');
  }
};
