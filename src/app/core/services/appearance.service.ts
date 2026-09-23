import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface ThemeOption {
  id: string;
  name: string;
  dark: boolean;
  /** Swatch only — the real colours live in styles/_themes.scss. */
  bg: string;
  accent: string;
}

export interface FontOption {
  id: string;
  name: string;
  note: string;
  category: 'sans' | 'serif' | 'mono';
  stack: string;
  /** Google Fonts family spec, loaded on first use. Omitted for system faces. */
  google?: string;
}

export interface SizeOption {
  id: string;
  name: string;
}

/** Ids must match the `[data-theme]` blocks in styles/_themes.scss. */
export const THEMES: ThemeOption[] = [
  { id: 'dark', name: 'Graphite', dark: true, bg: '#0a0d12', accent: '#4fe3c1' },
  { id: 'light', name: 'Paper', dark: false, bg: '#fcfcfd', accent: '#0d7a68' },
  { id: 'carbon', name: 'Carbon', dark: true, bg: '#000000', accent: '#22d3ee' },
  { id: 'midnight', name: 'Midnight', dark: true, bg: '#0a0a18', accent: '#a78bfa' },
  { id: 'nord', name: 'Nord', dark: true, bg: '#2e3440', accent: '#88c0d0' },
  { id: 'dracula', name: 'Dracula', dark: true, bg: '#282a36', accent: '#bd93f9' },
  { id: 'forest', name: 'Forest', dark: true, bg: '#0a1210', accent: '#4fd1a5' },
  { id: 'ocean', name: 'Ocean', dark: true, bg: '#061018', accent: '#38bdf8' },
  { id: 'solarized', name: 'Solarized', dark: false, bg: '#fdf6e3', accent: '#12658f' },
  { id: 'sepia', name: 'Sepia', dark: false, bg: '#f3ece1', accent: '#a2542e' },
  { id: 'contrast', name: 'Contrast', dark: true, bg: '#000000', accent: '#ffd400' },
];

export const FONTS: FontOption[] = [
  { id: 'inter', name: 'Inter', note: 'Default · clean UI sans', category: 'sans', stack: "'Inter', system-ui, sans-serif", google: 'Inter:wght@400;500;600;700' },
  { id: 'system', name: 'System UI', note: 'Your OS font · nothing to download', category: 'sans', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  { id: 'manrope', name: 'Manrope', note: 'Modern · semi-rounded', category: 'sans', stack: "'Manrope', system-ui, sans-serif", google: 'Manrope:wght@400;500;600;800' },
  { id: 'spacegrotesk', name: 'Space Grotesk', note: 'Techy · distinctive', category: 'sans', stack: "'Space Grotesk', system-ui, sans-serif", google: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'ibmplex', name: 'IBM Plex Sans', note: 'Engineering feel', category: 'sans', stack: "'IBM Plex Sans', system-ui, sans-serif", google: 'IBM+Plex+Sans:wght@400;500;600;700' },
  { id: 'figtree', name: 'Figtree', note: 'Soft geometric', category: 'sans', stack: "'Figtree', system-ui, sans-serif", google: 'Figtree:wght@400;500;600;800' },
  { id: 'dmsans', name: 'DM Sans', note: 'Low contrast · easy on the eyes', category: 'sans', stack: "'DM Sans', system-ui, sans-serif", google: 'DM+Sans:wght@400;500;700' },
  { id: 'outfit', name: 'Outfit', note: 'Crisp geometric', category: 'sans', stack: "'Outfit', system-ui, sans-serif", google: 'Outfit:wght@400;500;600;700' },
  { id: 'plusjakarta', name: 'Plus Jakarta Sans', note: 'Friendly · great numerals', category: 'sans', stack: "'Plus Jakarta Sans', system-ui, sans-serif", google: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
  { id: 'publicsans', name: 'Public Sans', note: 'Neutral · design-system default', category: 'sans', stack: "'Public Sans', system-ui, sans-serif", google: 'Public+Sans:wght@400;500;600;700' },
  { id: 'lexend', name: 'Lexend', note: 'Tuned for reading speed', category: 'sans', stack: "'Lexend', system-ui, sans-serif", google: 'Lexend:wght@400;500;600;700' },
  { id: 'atkinson', name: 'Atkinson Hyperlegible', note: 'Maximum legibility · accessibility', category: 'sans', stack: "'Atkinson Hyperlegible', system-ui, sans-serif", google: 'Atkinson+Hyperlegible:wght@400;700' },
  { id: 'nunito', name: 'Nunito', note: 'Rounded · friendly', category: 'sans', stack: "'Nunito', system-ui, sans-serif", google: 'Nunito:wght@400;600;700;800' },
  { id: 'rubik', name: 'Rubik', note: 'Warm · rounded corners', category: 'sans', stack: "'Rubik', system-ui, sans-serif", google: 'Rubik:wght@400;500;600;700' },
  { id: 'chakra', name: 'Chakra Petch', note: 'Angular · sci-fi', category: 'sans', stack: "'Chakra Petch', system-ui, sans-serif", google: 'Chakra+Petch:wght@400;500;600;700' },

  { id: 'lora', name: 'Lora', note: 'Serif · elegant', category: 'serif', stack: "'Lora', Georgia, serif", google: 'Lora:wght@400;500;600;700' },
  { id: 'merriweather', name: 'Merriweather', note: 'Serif · built for long reading', category: 'serif', stack: "'Merriweather', Georgia, serif", google: 'Merriweather:wght@400;700' },
  { id: 'sourceserif', name: 'Source Serif 4', note: 'Serif · technical documents', category: 'serif', stack: "'Source Serif 4', Georgia, serif", google: 'Source+Serif+4:wght@400;600;700' },
  { id: 'georgia', name: 'Georgia', note: 'Classic serif · no download', category: 'serif', stack: "Georgia, 'Times New Roman', serif" },

  { id: 'jetbrains', name: 'JetBrains Mono', note: 'Everything monospaced', category: 'mono', stack: "'JetBrains Mono', ui-monospace, monospace", google: 'JetBrains+Mono:wght@400;500;700' },
  { id: 'ibmplexmono', name: 'IBM Plex Mono', note: 'Mono · warmer', category: 'mono', stack: "'IBM Plex Mono', ui-monospace, monospace", google: 'IBM+Plex+Mono:wght@400;500;600' },
];

export const SIZES: SizeOption[] = [
  { id: 's', name: 'Small' },
  { id: 'm', name: 'Default' },
  { id: 'l', name: 'Large' },
  { id: 'xl', name: 'X-Large' },
];

const KEY_THEME = 'theme';
const KEY_FONT = 'font';
const KEY_SIZE = 'size';
const KEY_FOCUS = 'focus';

/**
 * Appearance: palette, typeface, text size and focus mode.
 *
 * Google Fonts are requested only when a face is actually selected, so the
 * default load pulls two families rather than twenty.
 */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly storage = inject(StorageService);

  private readonly themeId = signal('dark');
  private readonly fontId = signal('inter');
  private readonly sizeId = signal('m');
  private readonly focus = signal(false);

  readonly themes = THEMES;
  readonly fonts = FONTS;
  readonly sizes = SIZES;

  readonly theme = this.themeId.asReadonly();
  readonly font = this.fontId.asReadonly();
  readonly size = this.sizeId.asReadonly();
  readonly focusMode = this.focus.asReadonly();

  readonly currentTheme = computed(
    () => THEMES.find((entry) => entry.id === this.themeId()) ?? THEMES[0],
  );
  readonly currentFont = computed(
    () => FONTS.find((entry) => entry.id === this.fontId()) ?? FONTS[0],
  );
  readonly isDark = computed(() => this.currentTheme().dark);

  constructor() {
    this.themeId.set(this.read(KEY_THEME, THEMES.map((t) => t.id), 'dark'));
    this.fontId.set(this.read(KEY_FONT, FONTS.map((f) => f.id), 'inter'));
    this.sizeId.set(this.read(KEY_SIZE, SIZES.map((s) => s.id), 'm'));
    this.focus.set(this.storage.read<boolean>(KEY_FOCUS, false) === true);
    this.apply();
  }

  setTheme(id: string): void {
    this.themeId.set(id);
    this.storage.write(KEY_THEME, id);
    this.apply();
  }

  /** The header button: flips to the last theme of the opposite kind. */
  toggleDark(): void {
    const wantDark = !this.isDark();
    const remembered = this.storage.read<string>(wantDark ? 'lastDark' : 'lastLight', '');
    const fallback = THEMES.find((entry) => entry.dark === wantDark)!.id;
    this.storage.write(this.isDark() ? 'lastDark' : 'lastLight', this.themeId());
    this.setTheme(remembered && this.valid(remembered, wantDark) ? remembered : fallback);
  }

  setFont(id: string): void {
    this.fontId.set(id);
    this.storage.write(KEY_FONT, id);
    this.apply();
  }

  setSize(id: string): void {
    this.sizeId.set(id);
    this.storage.write(KEY_SIZE, id);
    this.apply();
  }

  toggleFocus(): void {
    this.focus.update((on) => !on);
    this.storage.write(KEY_FOCUS, this.focus());
    this.apply();
  }

  private valid(id: string, dark: boolean): boolean {
    return THEMES.some((entry) => entry.id === id && entry.dark === dark);
  }

  private apply(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const theme = this.currentTheme();
    const font = this.currentFont();

    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-font', font.id);
    root.setAttribute('data-size', this.sizeId());
    root.style.setProperty('--font-ui', font.stack);
    root.style.colorScheme = theme.dark ? 'dark' : 'light';

    if (this.focus()) root.setAttribute('data-focus', 'on');
    else root.removeAttribute('data-focus');

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
    if (font.google) loadGoogleFont(font.id, font.google);
  }

  private read(key: string, allowed: string[], fallback: string): string {
    const stored = this.storage.read<string>(key, fallback);
    return allowed.includes(stored) ? stored : fallback;
  }
}

/** Adds a Google Fonts stylesheet once per family. */
function loadGoogleFont(id: string, spec: string): void {
  const elementId = `font-${id}`;
  if (document.getElementById(elementId)) return;

  const link = document.createElement('link');
  link.id = elementId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  document.head.appendChild(link);
}
