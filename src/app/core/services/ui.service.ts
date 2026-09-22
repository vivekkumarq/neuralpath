import { Injectable, signal } from '@angular/core';

/** Shared chrome state: the mobile drawer and the command palette. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly drawer = signal(false);
  private readonly palette = signal(false);
  private readonly wide = signal(true);

  readonly drawerOpen = this.drawer.asReadonly();
  readonly paletteOpen = this.palette.asReadonly();
  /** True once there is room for the sidebar and the table of contents. */
  readonly isWide = this.wide.asReadonly();

  constructor() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(min-width: 1080px)');
    this.wide.set(query.matches);
    query.addEventListener('change', (event) => {
      this.wide.set(event.matches);
      if (event.matches) this.closeDrawer();
    });
  }

  toggleDrawer(): void {
    this.drawer.update((open) => !open);
    this.lockScroll(this.drawer());
  }

  closeDrawer(): void {
    if (!this.drawer()) return;
    this.drawer.set(false);
    this.lockScroll(false);
  }

  openPalette(): void {
    this.closeDrawer();
    this.palette.set(true);
    this.lockScroll(true);
  }

  closePalette(): void {
    if (!this.palette()) return;
    this.palette.set(false);
    this.lockScroll(false);
  }

  togglePalette(): void {
    if (this.palette()) this.closePalette();
    else this.openPalette();
  }

  private lockScroll(locked: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
