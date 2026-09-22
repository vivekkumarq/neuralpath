import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bookmark, BookmarkKind, BookmarkService } from '../../core/services/bookmark.service';
import { Icon } from '../../shared/icon';

const GROUPS: { kind: BookmarkKind; label: string; blurb: string }[] = [
  { kind: 'topic', label: 'Topics', blurb: 'Curriculum topics to come back to.' },
  { kind: 'question', label: 'Interview questions', blurb: 'The ones worth rehearsing out loud.' },
  { kind: 'project', label: 'Projects', blurb: 'Projects you intend to build.' },
  { kind: 'term', label: 'Glossary terms', blurb: 'Definitions you keep needing.' },
  { kind: 'resource', label: 'Resources', blurb: 'External documentation, papers and courses.' },
];

@Component({
  selector: 'app-bookmarks-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Bookmarks</p>
        <h1>My bookmarks</h1>
        <p class="lede">
          {{ bookmarks.count() }} saved {{ bookmarks.count() === 1 ? 'item' : 'items' }}, stored in
          this browser. Save anything with the bookmark button on a topic, question, project, term or
          resource.
        </p>
      </header>

      @if (bookmarks.count() === 0) {
        <div class="empty">
          Nothing saved yet. Start with the <a routerLink="/roadmap">roadmap</a>, or open
          <a routerLink="/interview">interview prep</a> and save the questions you want to rehearse.
        </div>
      } @else {
        @for (group of groups; track group.kind) {
          @if (itemsOf(group.kind).length > 0) {
            <section>
              <div class="head">
                <h2>{{ group.label }}</h2>
                <span class="dim">{{ itemsOf(group.kind).length }} · {{ group.blurb }}</span>
              </div>

              <ul role="list">
                @for (item of itemsOf(group.kind); track item.kind + item.id) {
                  <li>
                    @if (isExternal(item)) {
                      <a [href]="item.href" target="_blank" rel="noopener">
                        {{ item.title }}
                        <app-icon name="external" [size]="12" />
                      </a>
                    } @else {
                      <a [routerLink]="path(item)" [queryParams]="params(item)">{{ item.title }}</a>
                    }
                    <button
                      type="button"
                      class="btn btn-icon"
                      (click)="remove(item)"
                      [attr.aria-label]="'Remove ' + item.title"
                    >
                      <app-icon name="close" [size]="14" />
                    </button>
                  </li>
                }
              </ul>
            </section>
          }
        }

        <section class="danger">
          @if (confirming()) {
            <div class="row">
              <button type="button" class="btn btn-sm" (click)="confirming.set(false)">Cancel</button>
              <button type="button" class="btn btn-sm danger-btn" (click)="clear()">
                Yes, remove all {{ bookmarks.count() }}
              </button>
            </div>
          } @else {
            <button type="button" class="btn btn-sm" (click)="confirming.set(true)">
              <app-icon name="refresh" [size]="14" />
              Clear all bookmarks
            </button>
          }
        </section>
      }
    </div>
  `,
  styles: `
    section {
      margin-top: var(--sp-6);
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      align-items: baseline;
      justify-content: space-between;
      padding-bottom: var(--sp-2);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-3);
    }

    h2 {
      font-size: var(--text-lg);
    }

    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.3rem;
    }

    li {
      margin: 0;
      display: flex;
      gap: var(--sp-3);
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius-sm);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    li a {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: var(--text-base);
      min-width: 0;
      text-decoration-color: var(--accent-line);
    }

    li a:hover {
      color: var(--accent);
    }

    .danger-btn {
      color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    }
  `,
})
export class BookmarksPage {
  protected readonly bookmarks = inject(BookmarkService);
  protected readonly groups = GROUPS;
  protected readonly confirming = signal(false);

  protected readonly all = computed(() => this.bookmarks.all());

  protected itemsOf(kind: BookmarkKind): Bookmark[] {
    return this.all().filter((item) => item.kind === kind);
  }

  protected isExternal(item: Bookmark): boolean {
    return item.href.startsWith('http');
  }

  protected path(item: Bookmark): string[] {
    return [item.href.split('?')[0]];
  }

  protected params(item: Bookmark): Record<string, string> {
    const query = item.href.split('?')[1];
    return query ? Object.fromEntries(new URLSearchParams(query)) : {};
  }

  protected remove(item: Bookmark): void {
    this.bookmarks.toggle(item);
  }

  protected clear(): void {
    this.bookmarks.clear();
    this.confirming.set(false);
  }
}
