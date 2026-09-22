import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { ProgressService } from '../../core/services/progress.service';
import { MODULES, moduleBySlug } from '../../data/curriculum';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-module-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    @if (current(); as data) {
      <div class="container page">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/learn">Learn</a>
          <app-icon name="chevron-right" [size]="12" />
          <span>{{ data.title }}</span>
        </nav>

        <header class="head">
          <p class="eyebrow">Stage {{ data.stage }} of {{ total - 1 }}</p>
          <h1>{{ data.title }}</h1>
          <p class="lede">{{ data.description }}</p>

          <div class="meta">
            <span class="level level-{{ data.level }}">{{ data.level }}</span>
            <span>{{ data.topics.length }} topics</span>
            <span><app-icon name="clock" [size]="12" /> {{ minutes() }} min total</span>
            <span>{{ percent() }}% complete</span>
          </div>

          <div class="bar"><span [style.width.%]="percent()"></span></div>
        </header>

        <ol class="topics" role="list">
          @for (topic of data.topics; track topic.slug; let i = $index) {
            <li>
              <a class="card card-link" [routerLink]="['/learn', data.slug, topic.slug]">
                <div class="spread">
                  <div class="title">
                    <span class="n">{{ i + 1 }}</span>
                    <h2>{{ topic.title }}</h2>
                  </div>
                  <span class="state" [class.done]="progress.isDone(topic.slug)">
                    @if (progress.isDone(topic.slug)) {
                      <app-icon name="check" [size]="14" /> Done
                    } @else {
                      <app-icon name="arrow-right" [size]="14" />
                    }
                  </span>
                </div>

                <p>{{ topic.summary }}</p>

                <ul class="outcomes" role="list">
                  @for (outcome of topic.outcomes; track outcome) {
                    <li>{{ outcome }}</li>
                  }
                </ul>

                <div class="meta">
                  <span class="level level-{{ topic.level }}">{{ topic.level }}</span>
                  <span>{{ topic.minutes }} min</span>
                  @for (tag of topic.tags ?? []; track tag) {
                    <span class="chip chip-mono">{{ tag }}</span>
                  }
                </div>
              </a>
            </li>
          }
        </ol>

        <nav class="siblings" aria-label="Adjacent stages">
          @if (previous(); as prev) {
            <a class="card card-link" [routerLink]="['/learn', prev.slug]">
              <span class="dim"><app-icon name="arrow-left" [size]="13" /> Previous stage</span>
              <strong>{{ prev.title }}</strong>
            </a>
          }
          @if (next(); as following) {
            <a class="card card-link align-end" [routerLink]="['/learn', following.slug]">
              <span class="dim">Next stage <app-icon name="arrow-right" [size]="13" /></span>
              <strong>{{ following.title }}</strong>
            </a>
          }
        </nav>
      </div>
    } @else {
      <div class="container page empty">
        That stage does not exist. <a routerLink="/learn">Browse the curriculum</a>.
      </div>
    }
  `,
  styles: `
    .head {
      padding-bottom: var(--sp-5);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-5);
    }

    .head h1 {
      margin: var(--sp-2) 0 var(--sp-3);
    }

    .head .meta {
      margin: var(--sp-4) 0 var(--sp-3);
    }

    .topics {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
    }

    .topics li {
      margin: 0;
    }

    .title {
      display: flex;
      align-items: baseline;
      gap: var(--sp-3);
      min-width: 0;
    }

    .n {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .topics h2 {
      font-size: var(--text-lg);
      margin: 0;
    }

    .state {
      font-size: var(--text-xs);
      color: var(--ink-3);
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      flex: none;
    }

    .state.done {
      color: var(--accent);
    }

    .topics p {
      margin: var(--sp-2) 0 var(--sp-3);
    }

    .outcomes {
      display: grid;
      gap: 0.2rem;
      margin-bottom: var(--sp-3);
      padding-left: 1.1rem;
    }

    .outcomes li {
      font-size: var(--text-sm);
      color: var(--ink-2);
      list-style: '→ ';
      padding-left: 0.3rem;
    }

    .siblings {
      display: grid;
      gap: var(--sp-3);
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  `,
})
export class ModulePage {
  /** Bound from the `:module` route parameter. */
  readonly module = input<string>('');

  protected readonly progress = inject(ProgressService);
  private readonly seo = inject(SeoService);

  protected readonly total = MODULES.length;
  protected readonly current = computed(() => moduleBySlug(this.module()));

  protected readonly index = computed(() =>
    MODULES.findIndex((entry) => entry.slug === this.module()),
  );
  protected readonly previous = computed(() => MODULES[this.index() - 1]);
  protected readonly next = computed(() => MODULES[this.index() + 1]);

  protected readonly minutes = computed(
    () => this.current()?.topics.reduce((total, topic) => total + topic.minutes, 0) ?? 0,
  );

  protected readonly percent = computed(
    () => this.progress.byModule().find((entry) => entry.slug === this.module())?.percent ?? 0,
  );

  constructor() {
    effect(() => {
      const data = this.current();
      if (data) this.seo.update(data.title, data.description, `/learn/${data.slug}`);
    });
  }
}
