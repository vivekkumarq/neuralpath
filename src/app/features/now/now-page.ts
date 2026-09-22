import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CURRENT_ITEMS, LAST_REVIEWED, NOW_BUCKETS } from '../../data/now';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-now-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">What to learn now · reviewed {{ reviewed }}</p>
        <h1>What is worth your time in AI right now</h1>
        <p class="lede">
          The curriculum is stable; the tooling is not. This page is deliberately dated, and every
          item links to a primary source so you can check it yourself. Read it as
          <em>true when reviewed</em>, not as a permanent claim — and if the review date is old,
          trust the linked source over this page.
        </p>
      </header>

      <div class="note note-info">
        <strong>How to read this</strong>
        <span>
          Core skills stay valuable regardless of which model is current. Emerging skills are a bet.
          Tools and frameworks change fastest, so learn what they abstract before learning them.
        </span>
      </div>

      @for (bucket of buckets; track bucket.id) {
        <section class="bucket">
          <div class="head">
            <h2>{{ bucket.label }}</h2>
            <p class="dim">{{ bucket.description }}</p>
          </div>

          <ul role="list">
            @for (item of itemsIn(bucket.id); track item.title) {
              <li>
                <div class="spread">
                  <h3>{{ item.title }}</h3>
                  <span class="chip chip-mono">{{ item.reviewed }}</span>
                </div>
                <p>{{ item.why }}</p>
                <a [href]="item.source.url" target="_blank" rel="noopener">
                  {{ item.source.label }}
                  <app-icon name="external" [size]="12" />
                </a>
              </li>
            }
          </ul>
        </section>
      }

      <div class="card closing">
        <h2>Where this list comes from</h2>
        <p class="muted">
          It is a judgement, not a measurement: what appears in job descriptions, what production
          systems actually need, and what the papers and release notes point at. Anything genuinely
          uncertain is in the emerging or research buckets rather than stated as fact. For the
          durable material, go to the <a routerLink="/roadmap">roadmap</a>; for the sources, the
          <a routerLink="/resources">resource library</a>.
        </p>
      </div>
    </div>
  `,
  styles: `
    .note {
      margin-bottom: var(--sp-6);
      max-width: 82ch;
    }

    .note strong {
      display: block;
      margin-bottom: 0.2rem;
    }

    .bucket + .bucket {
      margin-top: var(--sp-7);
    }

    .head {
      padding-bottom: var(--sp-3);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-4);
    }

    .head h2 {
      font-size: var(--text-xl);
    }

    .head p {
      margin-top: 0.3rem;
      max-width: 70ch;
    }

    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    li {
      margin: 0;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      padding: var(--sp-4);
    }

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0;
    }

    li p {
      margin: var(--sp-2) 0 var(--sp-3);
      font-size: var(--text-sm);
      color: var(--ink-2);
      line-height: 1.7;
    }

    li a {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: var(--text-xs);
      color: var(--ink-3);
      text-decoration: none;
    }

    li a:hover {
      color: var(--accent);
    }

    .closing {
      margin-top: var(--sp-7);
      background: var(--surface-2);
    }

    .closing h2 {
      font-size: var(--text-lg);
      margin-bottom: var(--sp-2);
    }

    .closing p {
      max-width: 80ch;
    }
  `,
})
export class NowPage {
  protected readonly buckets = NOW_BUCKETS;
  protected readonly reviewed = LAST_REVIEWED;

  protected itemsIn(bucket: string) {
    return CURRENT_ITEMS.filter((item) => item.bucket === bucket);
  }
}
