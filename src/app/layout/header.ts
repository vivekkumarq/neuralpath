import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PRIMARY_NAV } from '../data/navigation';
import { GITHUB_URL } from '../core/services/seo.service';
import { ThemeService } from '../core/services/theme.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

/**
 * The sticky header.
 *
 * It also owns the two global keyboard shortcuts — Ctrl/Cmd+K for the command
 * palette and `/` for search — because the palette must be reachable from every
 * page and the header is on every page.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, Logo],
  template: `
    <header [class.scrolled]="scrolled()">
      <div class="container bar">
        <a routerLink="/" class="brand" aria-label="NeuralPath home">
          <app-logo />
        </a>

        <nav class="links" aria-label="Main">
          @for (link of nav; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="actions">
          <button type="button" class="palette-trigger" (click)="ui.openPalette()">
            <app-icon name="search" [size]="15" />
            <span class="hint">Search</span>
            <kbd class="kbd">Ctrl K</kbd>
          </button>

          <button
            type="button"
            class="btn btn-icon"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
          >
            <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" />
          </button>

          <a
            [href]="github"
            class="btn btn-icon repo"
            target="_blank"
            rel="noopener"
            aria-label="Source on GitHub"
          >
            <app-icon name="github" />
          </a>

          <button
            type="button"
            class="btn btn-icon drawer-toggle"
            (click)="ui.toggleDrawer()"
            [attr.aria-expanded]="ui.drawerOpen()"
            aria-label="Open navigation"
          >
            <app-icon [name]="ui.drawerOpen() ? 'close' : 'menu'" [size]="20" />
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    header {
      position: sticky;
      top: 0;
      z-index: 60;
      background: color-mix(in srgb, var(--bg) 86%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid transparent;
      transition:
        border-color var(--dur) var(--ease),
        background var(--dur) var(--ease);
    }

    header.scrolled {
      border-bottom-color: var(--border);
      background: color-mix(in srgb, var(--bg) 94%, transparent);
    }

    .bar {
      height: var(--header-h);
      display: flex;
      align-items: center;
      gap: var(--sp-5);
    }

    .brand {
      text-decoration: none;
      flex: none;
    }

    .links {
      display: flex;
      gap: 0.15rem;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .links a {
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      color: var(--ink-2);
      text-decoration: none;
      white-space: nowrap;
      transition:
        color var(--dur) var(--ease),
        background var(--dur) var(--ease);
    }

    .links a:hover {
      color: var(--ink);
      background: var(--surface-2);
    }

    .links a.active {
      color: var(--accent);
      background: var(--accent-soft);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex: none;
    }

    .palette-trigger {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 0.35rem 0.5rem 0.35rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--ink-3);
      font-size: var(--text-sm);
    }

    .palette-trigger:hover {
      border-color: var(--accent-line);
      color: var(--ink-2);
    }

    .drawer-toggle {
      display: none;
    }

    @media (max-width: 1080px) {
      .links,
      .palette-trigger .hint,
      .palette-trigger .kbd,
      .repo {
        display: none;
      }

      .drawer-toggle {
        display: inline-flex;
      }

      .actions {
        margin-left: auto;
      }
    }
  `,
})
export class Header {
  protected readonly nav = PRIMARY_NAV;
  protected readonly github = GITHUB_URL;
  protected readonly theme = inject(ThemeService);
  protected readonly ui = inject(UiService);

  protected readonly scrolled = signal(false);

  @HostListener('document:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    const typing =
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.ui.togglePalette();
      return;
    }

    if (event.key === '/' && !typing && !this.ui.paletteOpen()) {
      event.preventDefault();
      this.ui.openPalette();
    }
  }
}
