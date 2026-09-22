import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GLOSSARY, GLOSSARY_CATEGORIES, termBySlug } from '../../data/glossary';
import { BookmarkButton } from '../../shared/bookmark-button';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-glossary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, BookmarkButton],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Glossary</p>
        <h1>{{ total }} terms, defined twice</h1>
        <p class="lede">
          A plain definition for when you need to follow a conversation, and a technical one for
          when you need to use the idea. Most entries carry an example and links to the related
          concepts.
        </p>
      </header>

      <div class="controls">
        <label class="field search">
          <app-icon name="search" [size]="15" />
          <input
            type="search"
            placeholder="Search terms and definitions"
            [value]="term()"
            (input)="term.set($any($event.target).value)"
            aria-label="Search the glossary"
          />
        </label>
        <span class="dim">{{ matches().length }} shown</span>
      </div>

      <div class="tag-list filters">
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="category() === null"
          (click)="category.set(null)"
        >
          All
        </button>
        @for (name of categories; track name) {
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="category() === name"
            (click)="category.set(name)"
          >
            {{ name }}
          </button>
        }
      </div>

      <div class="letters">
        @for (letter of letters(); track letter) {
          <a [href]="'#letter-' + letter">{{ letter }}</a>
        }
      </div>

      @for (group of grouped(); track group.letter) {
        <section class="group">
          <h2 [id]="'letter-' + group.letter">{{ group.letter }}</h2>

          <div class="grid cols-2">
            @for (entry of group.terms; track entry.slug) {
              <article class="card card-sm" [id]="entry.slug" [class.focused]="focus() === entry.slug">
                <div class="spread">
                  <h3>{{ entry.term }}</h3>
                  <app-bookmark-button
                    kind="term"
                    [id]="entry.slug"
                    [title]="entry.term"
                    [href]="'/glossary?t=' + entry.slug"
                    [label]="false"
                  />
                </div>
                <span class="chip chip-mono">{{ entry.category }}</span>

                <p class="plain">{{ entry.simple }}</p>
                <p class="tech">{{ entry.technical }}</p>

                @if (entry.example) {
                  <p class="example"><strong>Example.</strong> {{ entry.example }}</p>
                }

                @if (entry.related?.length) {
                  <div class="tag-list related">
                    @for (slug of entry.related ?? []; track slug) {
                      @if (label(slug); as name) {
                        <a class="chip" [routerLink]="[]" [queryParams]="{ t: slug }">{{ name }}</a>
                      }
                    }
                  </div>
                }
              </article>
            }
          </div>
        </section>
      }

      @if (matches().length === 0) {
        <div class="empty">
          No term matches “{{ term() }}”. It may be in the
          <a routerLink="/learn">curriculum</a> under a different name.
        </div>
      }
    </div>
  `,
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-4);
    }

    .search {
      flex: 1;
      min-width: 240px;
      max-width: 420px;
    }

    .filters {
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--border);
    }

    .letters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
      margin: var(--sp-4) 0;
    }

    .letters a {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
      text-decoration: none;
      border: 1px solid var(--border);
    }

    .letters a:hover {
      color: var(--accent);
      border-color: var(--accent-line);
    }

    .group + .group {
      margin-top: var(--sp-6);
    }

    .group h2 {
      font-family: var(--font-mono);
      font-size: var(--text-md);
      color: var(--ink-3);
      padding-bottom: var(--sp-2);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-3);
      scroll-margin-top: calc(var(--header-h) + 1rem);
    }

    article {
      scroll-margin-top: calc(var(--header-h) + 1.5rem);
    }

    article.focused {
      border-color: var(--accent);
      background: var(--accent-soft);
    }

    h3 {
      font-size: var(--text-md);
      margin: 0;
    }

    .card > .chip {
      margin-top: var(--sp-2);
    }

    .plain {
      margin-top: var(--sp-3);
      color: var(--ink);
      font-size: var(--text-base);
    }

    .tech {
      margin-top: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--ink-2);
    }

    .example {
      margin-top: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--ink-3);
    }

    .example strong {
      color: var(--ink-2);
    }

    .related {
      margin-top: var(--sp-3);
      padding-top: var(--sp-3);
      border-top: 1px solid var(--border);
    }
  `,
})
export class GlossaryPage {
  /** `?t=<slug>` highlights and scrolls to one term. */
  readonly t = input<string>('');

  protected readonly total = GLOSSARY.length;
  protected readonly categories = GLOSSARY_CATEGORIES;

  protected readonly term = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly focus = signal('');

  protected readonly matches = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const category = this.category();

    return GLOSSARY.filter((entry) => {
      if (category && entry.category !== category) return false;
      if (!needle) return true;
      return `${entry.term} ${entry.simple} ${entry.technical}`.toLowerCase().includes(needle);
    });
  });

  protected readonly grouped = computed(() => {
    const groups = new Map<string, typeof GLOSSARY>();
    for (const entry of this.matches()) {
      const letter = entry.term[0].toUpperCase();
      groups.set(letter, [...(groups.get(letter) ?? []), entry]);
    }
    return [...groups.entries()].map(([letter, terms]) => ({ letter, terms }));
  });

  protected readonly letters = computed(() => this.grouped().map((group) => group.letter));

  constructor() {
    effect(() => {
      const slug = this.t();
      if (!slug) return;
      this.focus.set(slug);
      // Clear any filter that would hide the requested term.
      this.term.set('');
      this.category.set(null);
      setTimeout(() => document.getElementById(slug)?.scrollIntoView({ block: 'center' }), 60);
    });
  }

  protected label(slug: string): string | undefined {
    return termBySlug(slug)?.term;
  }
}
