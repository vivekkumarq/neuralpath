import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../../core/models/content.models';
import { PROJECTS } from '../../data/projects';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Projects</p>
        <h1>Build things that prove you can build things</h1>
        <p class="lede">
          {{ projects.length }} projects in increasing order of difficulty, each specified rather
          than sketched: prerequisites, architecture, implementation steps, suggested stack, the
          outcome to aim for and where to take it next. Two finished projects you can defend in
          detail beat eight half-built ones.
        </p>
      </header>

      <div class="tag-list filters">
        <button type="button" class="chip" [attr.aria-pressed]="level() === null" (click)="level.set(null)">
          All {{ projects.length }}
        </button>
        @for (option of levels; track option) {
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="level() === option"
            (click)="level.set(option)"
          >
            <span class="level level-{{ option }}">{{ option }}</span>
            ({{ countOf(option) }})
          </button>
        }
      </div>

      <ol class="list" role="list">
        @for (project of visible(); track project.slug; let i = $index) {
          <li>
            <a class="card card-link" [routerLink]="['/projects', project.slug]">
              <div class="spread">
                <div class="title">
                  <span class="n">{{ index(project.slug) }}</span>
                  <h2>{{ project.title }}</h2>
                </div>
                <span class="level level-{{ project.level }}">{{ project.level }}</span>
              </div>

              <p>{{ project.summary }}</p>

              <div class="meta">
                <span><app-icon name="clock" [size]="12" /> {{ project.effort }}</span>
                @for (concept of project.concepts.slice(0, 4); track concept) {
                  <span class="chip chip-mono">{{ concept }}</span>
                }
              </div>

              <div class="stack">
                @for (item of project.stack; track item) {
                  <span>{{ item }}</span>
                }
              </div>
            </a>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    .filters {
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-5);
    }

    .list {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
    }

    .list li {
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

    h2 {
      font-size: var(--text-lg);
      margin: 0;
    }

    .card p {
      margin: var(--sp-2) 0 var(--sp-3);
      max-width: 78ch;
    }

    .stack {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      margin-top: var(--sp-3);
      padding-top: var(--sp-3);
      border-top: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--ink-3);
    }
  `,
})
export class ProjectsPage {
  protected readonly projects = PROJECTS;
  protected readonly levels: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  protected readonly level = signal<Level | null>(null);

  protected readonly visible = computed(() => {
    const chosen = this.level();
    return chosen ? PROJECTS.filter((project) => project.level === chosen) : PROJECTS;
  });

  protected countOf(level: Level): number {
    return PROJECTS.filter((project) => project.level === level).length;
  }

  /** Position in the full list, so numbering survives filtering. */
  protected index(slug: string): number {
    return PROJECTS.findIndex((project) => project.slug === slug) + 1;
  }
}
