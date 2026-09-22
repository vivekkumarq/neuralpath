import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchResult, SearchService } from '../core/services/search.service';
import { ThemeService } from '../core/services/theme.service';
import { UiService } from '../core/services/ui.service';
import { ALL_NAV } from '../data/navigation';
import { GITHUB_URL } from '../core/services/seo.service';
import { Icon } from '../shared/icon';

interface Command {
  label: string;
  hint: string;
  icon: string;
  run: () => void;
}

/**
 * Search and commands in one overlay (Ctrl/Cmd+K).
 *
 * With no query it lists commands — navigation, theme, focus mode. With a query
 * it searches every content type. Arrow keys move, Enter activates, Escape
 * closes; the whole thing is one keyboard surface.
 */
@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (ui.paletteOpen()) {
      <div class="scrim" (click)="ui.closePalette()">
        <div
          class="panel reveal"
          role="dialog"
          aria-modal="true"
          aria-label="Search and commands"
          (click)="$event.stopPropagation()"
        >
          <div class="input">
            <app-icon name="search" [size]="17" />
            <input
              #box
              type="text"
              placeholder="Search topics, questions, projects, terms — or run a command"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKey($event)"
              aria-label="Search"
            />
            <kbd class="kbd">Esc</kbd>
          </div>

          <div class="results" role="listbox">
            @if (query().length < 2) {
              <p class="group">Commands</p>
              @for (command of commands; track command.label; let i = $index) {
                <button
                  type="button"
                  class="row"
                  [class.on]="cursor() === i"
                  (mouseenter)="cursor.set(i)"
                  (click)="command.run()"
                >
                  <app-icon [name]="command.icon" [size]="15" />
                  <span class="label">{{ command.label }}</span>
                  <span class="meta">{{ command.hint }}</span>
                </button>
              }
            } @else if (!search.ready()) {
              <p class="none">Loading the index…</p>
            } @else if (results().length === 0) {
              <p class="none">
                Nothing matched “{{ query() }}”. Try a concept, a metric, a library or a term.
              </p>
            } @else {
              <p class="group">{{ results().length }} results</p>
              @for (result of results(); track result.href + result.title; let i = $index) {
                <button
                  type="button"
                  class="row"
                  [class.on]="cursor() === i"
                  (mouseenter)="cursor.set(i)"
                  (click)="go(result)"
                >
                  <span class="kind">{{ result.kind }}</span>
                  <span class="label">{{ result.title }}</span>
                  <span class="meta">{{ result.category }}</span>
                </button>
              }
            }
          </div>

          <div class="foot">
            <span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> move</span>
            <span><kbd class="kbd">↵</kbd> open</span>
            <span><kbd class="kbd">Ctrl K</kbd> toggle</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 120;
      background: color-mix(in srgb, var(--bg) 70%, transparent);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      padding: 8vh var(--sp-4) var(--sp-4);
    }

    .panel {
      width: min(680px, 100%);
      max-height: 76vh;
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .input {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4);
      border-bottom: 1px solid var(--border);
      color: var(--ink-3);
    }

    .input input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      outline: none;
      font-size: var(--text-md);
      color: var(--ink);
    }

    .results {
      overflow-y: auto;
      padding: var(--sp-2);
    }

    .group {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-3);
      padding: var(--sp-2) var(--sp-3);
    }

    .none {
      padding: var(--sp-5) var(--sp-3);
      color: var(--ink-3);
      font-size: var(--text-base);
    }

    .row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius);
      text-align: left;
      color: var(--ink-2);
    }

    .row.on {
      background: var(--accent-soft);
      color: var(--ink);
    }

    .label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--text-base);
    }

    .meta {
      font-size: var(--text-xs);
      color: var(--ink-3);
      flex: none;
    }

    .kind {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      width: 4.2rem;
      flex: none;
    }

    .foot {
      display: flex;
      gap: var(--sp-4);
      padding: var(--sp-3) var(--sp-4);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
      color: var(--ink-3);
      background: var(--bg-soft);
    }

    .foot .kbd {
      margin-right: 0.2rem;
    }

    @media (max-width: 560px) {
      .foot {
        display: none;
      }

      .kind {
        display: none;
      }
    }
  `,
})
export class CommandPalette {
  protected readonly ui = inject(UiService);
  protected readonly search = inject(SearchService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('box');

  protected readonly query = signal('');
  protected readonly cursor = signal(0);

  protected readonly results = computed(() => {
    // Reading `ready` re-runs this once the index has finished loading.
    const ready = this.search.ready();
    if (!ready || this.query().length < 2) return [];
    return this.search.search(this.query());
  });

  protected readonly commands: Command[] = [
    ...ALL_NAV.map((link) => ({
      label: `Go to ${link.label}`,
      hint: link.hint,
      icon: link.icon,
      run: () => this.navigate(link.path),
    })),
    {
      label: 'Toggle theme',
      hint: 'Dark and light',
      icon: 'moon',
      run: () => {
        this.theme.toggle();
        this.ui.closePalette();
      },
    },
    {
      label: 'Toggle focus mode',
      hint: 'Hide the chrome while reading',
      icon: 'focus',
      run: () => {
        this.theme.toggleFocus();
        this.ui.closePalette();
      },
    },
    {
      label: 'Open GitHub repository',
      hint: 'Source and issues',
      icon: 'github',
      run: () => {
        window.open(GITHUB_URL, '_blank', 'noopener');
        this.ui.closePalette();
      },
    },
  ];

  constructor() {
    effect(() => {
      if (this.ui.paletteOpen()) {
        this.query.set('');
        this.cursor.set(0);
        this.search.preload();
        // The input is created in the same tick the overlay opens.
        setTimeout(() => this.box()?.nativeElement.focus(), 0);
      }
    });
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.cursor.set(0);
  }

  protected onKey(event: KeyboardEvent): void {
    const size = this.query().length < 2 ? this.commands.length : this.results().length;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.ui.closePalette();
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
        event.preventDefault();
        if (this.query().length < 2) this.commands[this.cursor()]?.run();
        else {
          const result = this.results()[this.cursor()];
          if (result) this.go(result);
        }
        break;
      }
    }
  }

  protected go(result: SearchResult): void {
    if (result.external) {
      window.open(result.href, '_blank', 'noopener');
      this.ui.closePalette();
      return;
    }
    this.navigate(result.href);
  }

  private navigate(href: string): void {
    const [path, queryString] = href.split('?');
    const queryParams = Object.fromEntries(new URLSearchParams(queryString ?? ''));
    this.ui.closePalette();
    void this.router.navigate([path], { queryParams });
  }
}
