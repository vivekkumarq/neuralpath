import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { SeoService } from '../../core/services/seo.service';
import { AppearanceService } from '../../core/services/appearance.service';
import { moduleBySlug, neighbours, topicBySlug } from '../../data/curriculum';
import { BookmarkButton } from '../../shared/bookmark-button';
import { ContentBlocks } from '../../shared/content-blocks';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-topic-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, ContentBlocks, BookmarkButton],
  template: `
    @if (topic(); as data) {
      <div class="container page article-grid">
        <article class="article-main">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a routerLink="/learn">Learn</a>
            <app-icon name="chevron-right" [size]="12" />
            <a [routerLink]="['/learn', data.module]">{{ moduleTitle() }}</a>
            <app-icon name="chevron-right" [size]="12" />
            <span>{{ data.title }}</span>
          </nav>

          <header class="head">
            <h1>{{ data.title }}</h1>
            <p class="lede">{{ data.summary }}</p>

            <div class="meta">
              <span class="level level-{{ data.level }}">{{ data.level }}</span>
              <span><app-icon name="clock" [size]="12" /> {{ data.minutes }} min read</span>
              <span>Stage {{ stage() }} · {{ moduleTitle() }}</span>
            </div>

            <div class="row actions">
              <button
                type="button"
                class="btn btn-sm"
                [attr.aria-pressed]="done()"
                (click)="progress.toggle(data.slug)"
              >
                <app-icon [name]="done() ? 'check' : 'plus'" [size]="14" />
                {{ done() ? 'Completed' : 'Mark complete' }}
              </button>

              <app-bookmark-button
                kind="topic"
                [id]="data.slug"
                [title]="data.title"
                [href]="'/learn/' + data.module + '/' + data.slug"
              />

              <button
                type="button"
                class="btn btn-sm"
                [attr.aria-pressed]="appearance.focusMode()"
                (click)="appearance.toggleFocus()"
              >
                <app-icon name="focus" [size]="14" />
                Focus
              </button>
            </div>
          </header>

          <section class="why">
            <p class="eyebrow">Why this exists</p>
            <p>{{ data.why }}</p>
          </section>

          @if (prerequisites().length > 0) {
            <section class="prereq">
              <p class="eyebrow">Read first</p>
              <div class="tag-list">
                @for (item of prerequisites(); track item.slug) {
                  <a class="chip" [routerLink]="['/learn', item.module, item.slug]">
                    {{ item.title }}
                  </a>
                }
              </div>
            </section>
          }

          <section class="outcomes">
            <p class="eyebrow">After this you can</p>
            <ul role="list">
              @for (outcome of data.outcomes; track outcome) {
                <li>{{ outcome }}</li>
              }
            </ul>
          </section>

          <app-content-blocks [blocks]="data.blocks" />

          @if (data.resources?.length) {
            <section class="resources">
              <h2>Primary sources</h2>
              <ul role="list">
                @for (resource of data.resources ?? []; track resource.url) {
                  <li>
                    <a [href]="resource.url" target="_blank" rel="noopener">
                      {{ resource.label }}
                      <app-icon name="external" [size]="12" />
                    </a>
                    <span class="chip chip-mono">{{ resource.kind }}</span>
                  </li>
                }
              </ul>
            </section>
          }

          @if (related().length > 0) {
            <section class="related">
              <h2>Related topics</h2>
              <div class="grid cols-2">
                @for (item of related(); track item.slug) {
                  <a class="card card-sm card-link" [routerLink]="['/learn', item.module, item.slug]">
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.summary }}</p>
                  </a>
                }
              </div>
            </section>
          }

          <nav class="siblings" aria-label="Adjacent topics">
            @if (previous(); as prev) {
              <a class="card card-link" [routerLink]="['/learn', prev.module, prev.slug]">
                <span class="dim"><app-icon name="arrow-left" [size]="13" /> Previous</span>
                <strong>{{ prev.title }}</strong>
              </a>
            }
            @if (next(); as following) {
              <a
                class="card card-link align-end"
                [routerLink]="['/learn', following.module, following.slug]"
              >
                <span class="dim">Next <app-icon name="arrow-right" [size]="13" /></span>
                <strong>{{ following.title }}</strong>
              </a>
            }
          </nav>
        </article>

        <aside class="page-aside">
          <div class="toc">
            @if (headings().length > 0) {
              <p class="eyebrow">On this page</p>
              <ul role="list">
                @for (heading of headings(); track heading.id) {
                  <li><a [href]="'#' + heading.id">{{ heading.text }}</a></li>
                }
              </ul>
            }

            <div class="aside-progress" [class.first]="headings().length === 0">
              <p class="eyebrow">{{ moduleTitle() }}</p>
              <div class="bar"><span [style.width.%]="modulePercent()"></span></div>
              <p class="dim">{{ modulePercent() }}% of this stage</p>
            </div>
          </div>
        </aside>
      </div>
    } @else {
      <div class="container page empty">
        That topic does not exist. <a routerLink="/learn">Browse the curriculum</a>.
      </div>
    }
  `,
  styles: `
    .article-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 220px;
      gap: var(--sp-6);
      align-items: start;
    }

    @media (max-width: 1080px) {
      .article-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .page-aside {
        display: none;
      }
    }

    .head {
      padding-bottom: var(--sp-5);
      border-bottom: 1px solid var(--border);
    }

    .head h1 {
      margin-bottom: var(--sp-3);
    }

    .head .meta {
      margin-top: var(--sp-4);
    }

    .actions {
      margin-top: var(--sp-4);
    }

    .article-main > section {
      margin-top: var(--sp-5);
    }

    .why p:last-child {
      font-size: var(--text-md);
      color: var(--ink-2);
      line-height: 1.75;
      max-width: var(--prose-max);
      margin-top: var(--sp-2);
    }

    .outcomes ul {
      margin-top: var(--sp-2);
      display: grid;
      gap: 0.2rem;
      padding-left: 1.1rem;
      max-width: var(--prose-max);
    }

    .outcomes li {
      list-style: '→ ';
      padding-left: 0.35rem;
      color: var(--ink-2);
      font-size: var(--text-base);
    }

    .prereq .tag-list {
      margin-top: var(--sp-2);
    }

    app-content-blocks {
      margin-top: var(--sp-6);
    }

    .resources,
    .related {
      margin-top: var(--sp-7);
      padding-top: var(--sp-5);
      border-top: 1px solid var(--border);
    }

    .resources h2,
    .related h2 {
      font-size: var(--text-lg);
      margin-bottom: var(--sp-3);
    }

    .resources ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-2);
    }

    .resources li {
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
    }

    .resources a {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: var(--text-base);
      text-decoration-color: var(--accent-line);
    }

    .resources a:hover {
      color: var(--accent);
    }

    .related strong {
      font-weight: 600;
    }

    .related p {
      font-size: var(--text-sm);
      margin-top: 0.3rem;
    }

    .siblings {
      display: grid;
      gap: var(--sp-3);
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      margin-top: var(--sp-6);
    }

    .siblings strong {
      display: block;
      margin-top: 0.3rem;
      font-weight: 500;
    }

    .siblings .dim {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .align-end {
      text-align: right;
    }

    .toc {
      position: sticky;
      top: calc(var(--header-h) + var(--sp-5));
    }

    .toc ul {
      list-style: none;
      padding: 0;
      margin-top: var(--sp-2);
      display: grid;
      gap: 0.15rem;
      border-left: 1px solid var(--border);
    }

    .toc li {
      margin: 0;
    }

    .toc a {
      display: block;
      padding: 0.25rem 0 0.25rem 0.7rem;
      margin-left: -1px;
      border-left: 1px solid transparent;
      font-size: var(--text-xs);
      color: var(--ink-3);
      text-decoration: none;
      line-height: 1.5;
    }

    .toc a:hover {
      color: var(--accent);
      border-left-color: var(--accent);
    }

    .aside-progress {
      margin-top: var(--sp-6);
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
    }

    /* Without a table of contents there is nothing above it to separate from. */
    .aside-progress.first {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .aside-progress .bar {
      margin: var(--sp-2) 0;
    }
  `,
})
export class TopicPage {
  /** Bound from the route parameters. */
  readonly module = input<string>('');
  readonly slug = input<string>('');

  protected readonly progress = inject(ProgressService);
  protected readonly appearance = inject(AppearanceService);
  private readonly seo = inject(SeoService);

  protected readonly topic = computed(() => topicBySlug(this.slug()));
  protected readonly moduleTitle = computed(() => moduleBySlug(this.module())?.title ?? 'Learn');
  protected readonly stage = computed(() => moduleBySlug(this.module())?.stage ?? 0);

  protected readonly done = computed(() => this.progress.isDone(this.slug()));

  protected readonly modulePercent = computed(
    () => this.progress.byModule().find((entry) => entry.slug === this.module())?.percent ?? 0,
  );

  protected readonly previous = computed(() => neighbours(this.slug()).previous);
  protected readonly next = computed(() => neighbours(this.slug()).next);

  protected readonly prerequisites = computed(() =>
    (this.topic()?.prerequisites ?? [])
      .map((slug) => topicBySlug(slug))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined),
  );

  protected readonly related = computed(() =>
    (this.topic()?.related ?? [])
      .map((slug) => topicBySlug(slug))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined),
  );

  /** Table of contents, derived from the heading blocks. */
  protected readonly headings = computed(() =>
    (this.topic()?.blocks ?? [])
      .filter((block) => block.kind === 'heading')
      .map((block) => ({
        text: (block as { text: string }).text,
        id: (block as { text: string }).text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      })),
  );

  constructor() {
    effect(() => {
      const data = this.topic();
      if (!data) return;
      this.seo.update(data.title, data.summary, `/learn/${data.module}/${data.slug}`);
      this.progress.markVisited(data.slug, data.title);
    });
  }
}
