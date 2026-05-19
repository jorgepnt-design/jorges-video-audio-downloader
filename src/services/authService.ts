import { localUser } from "../data/mockUser";
import type { UserProfile } from "../types";

export const authService = {
  getCurrentUser(): UserProfile {
    return localUser;
  },
  async signInPlaceholder(): Promise<UserProfile> {
    // TODO: Replace with Supabase Auth or Firebase Authentication.
    return localUser;
  },
};
