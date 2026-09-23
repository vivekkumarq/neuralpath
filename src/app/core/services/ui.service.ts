import { Injectable, signal } from '@angular/core';

/** Shared chrome state: the sidebar, the command palette and the appearance panel. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly sidebar = signal(true);
  private readonly palette = signal(false);
  private readonly appearance = signal(false);
  private readonly wide = signal(true);
  private readonly stages = signal(new Set<string>());

  readonly sidebarOpen = this.sidebar.asReadonly();
  readonly paletteOpen = this.palette.asReadonly();
  readonly appearanceOpen = this.appearance.asReadonly();
  /** True once there is room for the sidebar beside the content. */
  readonly isWide = this.wide.asReadonly();
  /** Stages the reader has expanded by hand, on top of the current one. */
  readonly openStages = this.stages.asReadonly();

  constructor() {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia('(min-width: 1001px)');
    this.wide.set(query.matches);
    // On a phone the sidebar is a drawer, so it starts closed.
    this.sidebar.set(query.matches);

    query.addEventListener('change', (event) => {
      this.wide.set(event.matches);
      this.sidebar.set(event.matches);
      this.lockScroll(false);
    });
  }

  toggleSidebar(): void {
    this.sidebar.update((open) => !open);
    if (!this.wide()) this.lockScroll(this.sidebar());
  }

  closeSidebar(): void {
    if (!this.sidebar()) return;
    this.sidebar.set(false);
    this.lockScroll(false);
  }

  /** Following a link on a phone should dismiss the drawer; on desktop it stays. */
  closeSidebarOnMobile(): void {
    if (!this.wide()) this.closeSidebar();
  }

  markStageOpen(slug: string): void {
    this.stages.update((set) => new Set(set).add(slug));
  }

  openPalette(): void {
    this.closeAppearance();
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

  toggleAppearance(): void {
    this.appearance.update((open) => !open);
  }

  closeAppearance(): void {
    this.appearance.set(false);
  }

  private lockScroll(locked: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
