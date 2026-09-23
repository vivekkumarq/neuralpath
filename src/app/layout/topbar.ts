import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppearanceService } from '../core/services/appearance.service';
import { GITHUB_URL } from '../core/services/seo.service';
import { SearchResult, SearchService } from '../core/services/search.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

/**
 * The fixed topbar: navigation toggle, brand, inline search, appearance and
 * theme.
 *
 * Search lives here rather than behind a shortcut, because a reader looking for
 * a term should not have to know that Ctrl+K exists. The palette is still there
 * for people who do.
 */
@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo],
  template: `
    <header class="topbar">
      <button
        type="button"
        class="icon-btn"
        (click)="ui.toggleSidebar()"
        [attr.aria-expanded]="ui.sidebarOpen()"
        aria-label="Toggle navigation"
      >
        <app-icon [name]="ui.sidebarOpen() && !ui.isWide() ? 'close' : 'menu'" [size]="18" />
      </button>

      <a routerLink="/" class="brand" aria-label="NeuralPath home">
        <app-logo />
      </a>

      <div class="search-wrap" [class.focused]="focused()">
        <app-icon name="search" [size]="15" />
        <input
          #box
          type="search"
          [value]="query()"
          (input)="onInput($event)"
          (focus)="focused.set(true)"
          (keydown)="onKey($event)"
          placeholder="Search topics, questions, terms…"
          aria-label="Search the site"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd class="kbd">/</kbd>

        @if (focused() && query().length > 1) {
          <div class="results" role="listbox">
            @if (!search.ready()) {
              <p class="none">Loading the index…</p>
            } @else if (results().length === 0) {
              <p class="none">Nothing matched “{{ query() }}”.</p>
            } @else {
              @for (result of results(); track result.href + result.title; let i = $index) {
                <button
                  type="button"
                  class="row"
                  [class.on]="cursor() === i"
                  (mousedown)="go(result)"
                  (mouseenter)="cursor.set(i)"
                >
                  <span class="kind">{{ result.kind }}</span>
                  <span class="label">{{ result.title }}</span>
                  <span class="meta">{{ result.category }}</span>
                </button>
              }
              <button type="button" class="row all" (mousedown)="ui.openPalette()">
                Open the full command palette
                <kbd class="kbd">Ctrl K</kbd>
              </button>
            }
          </div>
        }
      </div>

      <span class="spacer"></span>

      <button
        type="button"
        class="icon-btn type-btn"
        (click)="ui.toggleAppearance()"
        [attr.aria-expanded]="ui.appearanceOpen()"
        aria-label="Theme, typeface and text size"
        title="Theme, typeface and text size"
      >
        <app-icon name="type" [size]="17" />
        <span class="font-name">{{ appearance.currentFont().name }}</span>
      </button>

      <button
        type="button"
        class="icon-btn"
        (click)="appearance.toggleDark()"
        [attr.aria-label]="appearance.isDark() ? 'Switch to a light theme' : 'Switch to a dark theme'"
      >
        <app-icon [name]="appearance.isDark() ? 'sun' : 'moon'" [size]="17" />
      </button>

      <a
        [href]="github"
        class="icon-btn repo"
        target="_blank"
        rel="noopener"
        aria-label="Source on GitHub"
      >
        <app-icon name="github" [size]="17" />
      </a>
    </header>
  `,
  styles: `
    :host {
      display: contents;
    }

    .brand {
      text-decoration: none;
      flex: none;
      padding-right: var(--sp-2);
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex: 1;
      max-width: 460px;
      padding: 0 0.6rem;
      height: 34px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--ink-3);
    }

    .search-wrap.focused {
      border-color: var(--accent-line);
    }

    .search-wrap input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      outline: none;
      font-size: var(--text-sm);
      color: var(--ink);
    }

    .search-wrap input::-webkit-search-cancel-button {
      display: none;
    }

    .results {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      max-height: 60vh;
      overflow-y: auto;
      padding: var(--sp-2);
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      z-index: 80;
    }

    .row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.45rem 0.6rem;
      border-radius: var(--radius-sm);
      text-align: left;
      color: var(--ink-2);
    }

    .row.on {
      background: var(--accent-soft);
      color: var(--ink);
    }

    .row .kind {
      font-family: var(--font-mono);
      font-size: 0.58rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      width: 4rem;
      flex: none;
    }

    .row .label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--text-sm);
    }

    .row .meta {
      font-size: 0.65rem;
      color: var(--ink-3);
      flex: none;
    }

    .row.all {
      justify-content: space-between;
      margin-top: 2px;
      border-top: 1px solid var(--border);
      border-radius: 0;
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .none {
      padding: var(--sp-4) var(--sp-3);
      font-size: var(--text-sm);
      color: var(--ink-3);
    }

    .type-btn {
      width: auto;
      gap: 0.4rem;
      padding-inline: 0.5rem;
    }

    .font-name {
      font-size: var(--text-xs);
      max-width: 8ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 860px) {
      .font-name,
      .repo {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .search-wrap .kbd {
        display: none;
      }

      .search-wrap {
        max-width: none;
      }
    }
  `,
})
export class Topbar {
  protected readonly ui = inject(UiService);
  protected readonly appearance = inject(AppearanceService);
  protected readonly search = inject(SearchService);
  private readonly router = inject(Router);

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  protected readonly github = GITHUB_URL;
  protected readonly query = signal('');
  protected readonly focused = signal(false);
  protected readonly cursor = signal(0);

  protected readonly results = computed(() => {
    const ready = this.search.ready();
    if (!ready || this.query().length < 2) return [];
    return this.search.search(this.query(), 8);
  });

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.cursor.set(0);
    this.search.preload();
  }

  protected onKey(event: KeyboardEvent): void {
    const size = this.results().length;

    switch (event.key) {
      case 'Escape':
        this.query.set('');
        this.focused.set(false);
        this.box()?.nativeElement.blur();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.cursor.set(size === 0 ? 0 : (this.cursor() + 1) % size);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.cursor.set(size === 0 ? 0 : (this.cursor() - 1 + size) % size);
        break;
      case 'Enter': {
        const result = this.results()[this.cursor()];
        if (result) this.go(result);
        break;
      }
    }
  }

  protected go(result: SearchResult): void {
    this.query.set('');
    this.focused.set(false);
    this.box()?.nativeElement.blur();

    if (result.external) {
      window.open(result.href, '_blank', 'noopener');
      return;
    }

    const [path, queryString] = result.href.split('?');
    void this.router.navigate([path], {
      queryParams: Object.fromEntries(new URLSearchParams(queryString ?? '')),
    });
  }

  /** `/` focuses search, Ctrl/Cmd+K opens the palette — from anywhere. */
  @HostListener('document:keydown', ['$event'])
  protected onGlobalKey(event: KeyboardEvent): void {
    const typing =
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.ui.togglePalette();
      return;
    }

    if (event.key === '/' && !typing) {
      event.preventDefault();
      this.search.preload();
      this.box()?.nativeElement.focus();
    }
  }

  /** A click anywhere else dismisses the results without losing the query. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const wrap = this.box()?.nativeElement.closest('.search-wrap');
    if (wrap && !wrap.contains(event.target as Node)) this.focused.set(false);
  }
}
