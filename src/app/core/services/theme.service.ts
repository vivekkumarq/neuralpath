import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY_THEME = 'theme';
const KEY_FOCUS = 'focus';

const THEME_COLOR: Record<'light' | 'dark', string> = {
  light: '#fcfcfd',
  dark: '#0a0d12',
};

/**
 * Appearance state: palette and focus mode, persisted per browser.
 *
 * Dark is the default rather than `system`, because the dark palette is the
 * product identity; a reader who prefers light picks it once and it sticks.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly systemLight = signal(false);
  private readonly mode = signal<ThemeMode>('dark');
  private readonly focus = signal(false);

  readonly theme = this.mode.asReadonly();
  readonly focusMode = this.focus.asReadonly();

  readonly resolved = computed<'light' | 'dark'>(() => {
    const mode = this.mode();
    if (mode === 'system') return this.systemLight() ? 'light' : 'dark';
    return mode;
  });

  readonly isDark = computed(() => this.resolved() === 'dark');

  constructor() {
    const stored = this.storage.read<ThemeMode>(KEY_THEME, 'dark');
    this.mode.set(['system', 'light', 'dark'].includes(stored) ? stored : 'dark');
    this.focus.set(this.storage.read<boolean>(KEY_FOCUS, false) === true);

    if (typeof window !== 'undefined' && window.matchMedia) {
      const query = window.matchMedia('(prefers-color-scheme: light)');
      this.systemLight.set(query.matches);
      query.addEventListener('change', (event) => {
        this.systemLight.set(event.matches);
        this.apply();
      });
    }

    this.apply();
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
    this.storage.write(KEY_THEME, mode);
    this.apply();
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  toggleFocus(): void {
    this.focus.update((on) => !on);
    this.storage.write(KEY_FOCUS, this.focus());
    this.apply();
  }

  private apply(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const resolved = this.resolved();

    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
    if (this.focus()) root.setAttribute('data-focus', 'on');
    else root.removeAttribute('data-focus');

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[resolved]);
  }
}
