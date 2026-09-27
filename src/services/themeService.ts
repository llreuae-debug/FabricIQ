export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY_THEME = 'fabriciq_theme_mode_v1';

class ThemeService {
  private mode: ThemeMode = 'dark';
  private listeners: Array<(resolved: ResolvedTheme, mode: ThemeMode) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        this.mode = saved;
      } else {
        this.mode = 'dark'; // Default to dark for textile/fintech aesthetic
      }
    } catch {
      this.mode = 'dark';
    }

    this.applyTheme();

    // Listen to OS system color-scheme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === 'system') {
          this.applyTheme();
        }
      });
    }
  }

  public getMode(): ThemeMode {
    return this.mode;
  }

  public getResolvedTheme(): ResolvedTheme {
    if (this.mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return this.mode;
  }

  public setMode(mode: ThemeMode) {
    this.mode = mode;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, mode);
    } catch {
      // ignore
    }
    this.applyTheme();
  }

  public toggleTheme() {
    const next: ThemeMode = this.getResolvedTheme() === 'dark' ? 'light' : 'dark';
    this.setMode(next);
  }

  private applyTheme() {
    if (typeof document === 'undefined') return;
    const resolved = this.getResolvedTheme();
    const root = document.documentElement;

    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    this.listeners.forEach((listener) => listener(resolved, this.mode));
  }

  public subscribe(listener: (resolved: ResolvedTheme, mode: ThemeMode) => void): () => void {
    this.listeners.push(listener);
    listener(this.getResolvedTheme(), this.mode);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const themeService = new ThemeService();
