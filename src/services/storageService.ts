const PREFIX = "wm2026:";

export const storageService = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(`${PREFIX}${key}`);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  },
  remove(key: string): void {
    localStorage.removeItem(`${PREFIX}${key}`);
  },
  clearLocalUserData(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};
