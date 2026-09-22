import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RESOURCES, RESOURCE_CATEGORIES } from '../../data/resources';
import { BookmarkButton } from '../../shared/bookmark-button';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-resources-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, BookmarkButton],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Resources</p>
        <h1>Primary sources first</h1>
        <p class="lede">
          {{ total }} curated resources. Official documentation is listed ahead of tutorials about
          it, because documentation stays current and tutorials do not. Free resources are marked as
          such; the two paid courses are labelled clearly and are not affiliated with this site.
        </p>
      </header>

      <div class="controls">
        <label class="field search">
          <app-icon name="search" [size]="15" />
          <input
            type="search"
            placeholder="Filter resources"
            [value]="term()"
            (input)="term.set($any($event.target).value)"
            aria-label="Filter resources"
          />
        </label>

        <div class="row">
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="freeOnly()"
            (click)="freeOnly.set(!freeOnly())"
          >
            Free only
          </button>
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="officialOnly()"
            (click)="officialOnly.set(!officialOnly())"
          >
            Official sources
          </button>
        </div>
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

      @for (group of grouped(); track group.category) {
        <section class="group">
          <h2>{{ group.category }}</h2>
          <ul role="list">
            @for (resource of group.items; track resource.url) {
              <li>
                <div class="head">
                  <a [href]="resource.url" target="_blank" rel="noopener">
                    {{ resource.label }}
                    <app-icon name="external" [size]="12" />
                  </a>
                  <span class="badges">
                    <span class="chip chip-mono">{{ resource.kind }}</span>
                    @if (resource.official) {
                      <span class="chip chip-mono official">official</span>
                    }
                    @if (resource.free) {
                      <span class="chip chip-mono free">free</span>
                    } @else {
                      <span class="chip chip-mono paid">paid</span>
                    }
                    <app-bookmark-button
                      kind="resource"
                      [id]="resource.url"
                      [title]="resource.label"
                      [href]="resource.url"
                      [label]="false"
                    />
                  </span>
                </div>
                <p>{{ resource.note }}</p>
              </li>
            }
          </ul>
        </section>
      }

      @if (matches().length === 0) {
        <div class="empty">
          Nothing matches those filters. The <a routerLink="/now">what to learn now</a> page has a
          shorter, dated list.
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
      min-width: 220px;
      max-width: 360px;
    }

    .filters {
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-5);
    }

    .group + .group {
      margin-top: var(--sp-6);
    }

    .group h2 {
      font-size: var(--text-lg);
      padding-bottom: var(--sp-2);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-3);
    }

    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
    }

    li {
      margin: 0;
      padding-bottom: var(--sp-3);
      border-bottom: 1px dashed var(--border);
    }

    li:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      align-items: center;
      justify-content: space-between;
    }

    .head a {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: var(--text-md);
      font-weight: 500;
      text-decoration-color: var(--accent-line);
    }

    .head a:hover {
      color: var(--accent);
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      align-items: center;
    }

    .official {
      color: var(--info);
      border-color: color-mix(in srgb, var(--info) 40%, transparent);
    }

    .free {
      color: var(--accent);
      border-color: var(--accent-line);
    }

    .paid {
      color: var(--warn);
      border-color: color-mix(in srgb, var(--warn) 40%, transparent);
    }

    p {
      margin-top: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--ink-2);
      max-width: 82ch;
    }
  `,
})
export class ResourcesPage {
  protected readonly total = RESOURCES.length;
  protected readonly categories = RESOURCE_CATEGORIES;

  protected readonly term = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly freeOnly = signal(false);
  protected readonly officialOnly = signal(false);

  protected readonly matches = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const category = this.category();

    return RESOURCES.filter((resource) => {
      if (category && resource.category !== category) return false;
      if (this.freeOnly() && !resource.free) return false;
      if (this.officialOnly() && !resource.official) return false;
      if (!needle) return true;
      return `${resource.label} ${resource.note} ${resource.kind}`.toLowerCase().includes(needle);
    });
  });

  protected readonly grouped = computed(() =>
    RESOURCE_CATEGORIES.map((category) => ({
      category,
      items: this.matches().filter((resource) => resource.category === category),
    })).filter((group) => group.items.length > 0),
  );
}
