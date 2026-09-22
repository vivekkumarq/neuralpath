import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { topicBySlug } from '../../data/curriculum';
import { PROJECTS, projectBySlug } from '../../data/projects';
import { BookmarkButton } from '../../shared/bookmark-button';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-project-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, BookmarkButton],
  template: `
    @if (project(); as data) {
      <div class="container page">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/projects">Projects</a>
          <app-icon name="chevron-right" [size]="12" />
          <span>{{ data.title }}</span>
        </nav>

        <header class="head">
          <p class="eyebrow">Project {{ position() }} of {{ total }}</p>
          <h1>{{ data.title }}</h1>
          <p class="lede">{{ data.summary }}</p>

          <div class="meta">
            <span class="level level-{{ data.level }}">{{ data.level }}</span>
            <span><app-icon name="clock" [size]="12" /> {{ data.effort }}</span>
          </div>

          <div class="row">
            <app-bookmark-button
              kind="project"
              [id]="data.slug"
              [title]="data.title"
              [href]="'/projects/' + data.slug"
            />
          </div>
        </header>

        <div class="grid cols-2 top">
          <section class="card">
            <p class="eyebrow">Read these first</p>
            <ul class="links" role="list">
              @for (item of prerequisites(); track item.slug) {
                <li>
                  <a [routerLink]="['/learn', item.module, item.slug]">{{ item.title }}</a>
                </li>
              }
            </ul>
          </section>

          <section class="card">
            <p class="eyebrow">Concepts exercised</p>
            <div class="tag-list">
              @for (concept of data.concepts; track concept) {
                <span class="chip">{{ concept }}</span>
              }
            </div>
            <p class="eyebrow stack-label">Suggested stack</p>
            <div class="tag-list">
              @for (item of data.stack; track item) {
                <span class="chip chip-mono">{{ item }}</span>
              }
            </div>
          </section>
        </div>

        <section>
          <h2>Architecture</h2>
          <ul class="arch" role="list">
            @for (line of data.architecture; track line) {
              <li>{{ line }}</li>
            }
          </ul>
        </section>

        <section>
          <h2>Implementation steps</h2>
          <ol class="steps" role="list">
            @for (step of data.steps; track step.title) {
              <li>
                <strong>{{ step.title }}</strong>
                <span>{{ step.body }}</span>
              </li>
            }
          </ol>
        </section>

        <section class="grid cols-2">
          <div class="card">
            <p class="eyebrow">Expected outcome</p>
            <p>{{ data.outcome }}</p>
          </div>
          <div class="card">
            <p class="eyebrow">Take it further</p>
            <ul role="list" class="ext">
              @for (idea of data.extensions; track idea) {
                <li>{{ idea }}</li>
              }
            </ul>
          </div>
        </section>

        <nav class="siblings" aria-label="Adjacent projects">
          @if (previous(); as prev) {
            <a class="card card-link" [routerLink]="['/projects', prev.slug]">
              <span class="dim"><app-icon name="arrow-left" [size]="13" /> Previous</span>
              <strong>{{ prev.title }}</strong>
            </a>
          }
          @if (next(); as following) {
            <a class="card card-link align-end" [routerLink]="['/projects', following.slug]">
              <span class="dim">Next <app-icon name="arrow-right" [size]="13" /></span>
              <strong>{{ following.title }}</strong>
            </a>
          }
        </nav>
      </div>
    } @else {
      <div class="container page empty">
        That project does not exist. <a routerLink="/projects">See all projects</a>.
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
      margin: var(--sp-4) 0 var(--sp-4);
    }

    section {
      margin-top: var(--sp-6);
    }

    .top {
      margin-top: 0;
    }

    h2 {
      font-size: var(--text-xl);
      margin-bottom: var(--sp-3);
    }

    .links {
      list-style: none;
      padding: 0;
      margin-top: var(--sp-2);
      display: grid;
      gap: 0.3rem;
    }

    .links li {
      margin: 0;
    }

    .links a {
      font-size: var(--text-base);
      text-decoration-color: var(--accent-line);
    }

    .links a:hover {
      color: var(--accent);
    }

    .stack-label {
      margin-top: var(--sp-4);
      margin-bottom: var(--sp-2);
    }

    .card .tag-list {
      margin-top: var(--sp-2);
    }

    .arch {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-2);
      max-width: 82ch;
    }

    .arch li {
      margin: 0;
      padding: 0.5rem 0.75rem;
      border-left: 2px solid var(--accent-line);
      background: var(--surface);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-size: var(--text-base);
      color: var(--ink-2);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
    }

    .steps {
      list-style: none;
      counter-reset: step;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
      max-width: 82ch;
    }

    .steps li {
      counter-increment: step;
      margin: 0;
      padding-left: 2.4rem;
      position: relative;
      color: var(--ink-2);
      font-size: var(--text-base);
      line-height: 1.7;
    }

    .steps li::before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: 0.1rem;
      width: 1.6rem;
      height: 1.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 99px;
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 0.7rem;
    }

    .steps strong {
      display: block;
      color: var(--ink);
    }

    .ext {
      padding-left: 1.1rem;
      margin-top: var(--sp-2);
    }

    .ext li {
      font-size: var(--text-base);
      color: var(--ink-2);
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
  `,
})
export class ProjectPage {
  /** Bound from the `:slug` route parameter. */
  readonly slug = input<string>('');

  private readonly seo = inject(SeoService);

  protected readonly total = PROJECTS.length;
  protected readonly project = computed(() => projectBySlug(this.slug()));

  private readonly index = computed(() =>
    PROJECTS.findIndex((project) => project.slug === this.slug()),
  );
  protected readonly position = computed(() => this.index() + 1);
  protected readonly previous = computed(() => PROJECTS[this.index() - 1]);
  protected readonly next = computed(() => PROJECTS[this.index() + 1]);

  protected readonly prerequisites = computed(() =>
    (this.project()?.prerequisites ?? [])
      .map((slug) => topicBySlug(slug))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined),
  );

  constructor() {
    effect(() => {
      const data = this.project();
      if (data) this.seo.update(data.title, data.summary, `/projects/${data.slug}`);
    });
  }
}
