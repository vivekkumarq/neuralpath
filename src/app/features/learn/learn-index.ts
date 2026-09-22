import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level, Topic } from '../../core/models/content.models';
import { ProgressService } from '../../core/services/progress.service';
import { CURRICULUM_STATS, MODULES, allTopics } from '../../data/curriculum';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-learn-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Learn</p>
        <h1>Every topic in the curriculum</h1>
        <p class="lede">
          {{ stats.topics }} topics across {{ stats.modules }} stages, roughly
          {{ hours }} hours of reading, {{ stats.quizzes }} self-checks and
          {{ stats.visuals }} interactive figures. Filter, or search anything with
          <kbd class="kbd">Ctrl</kbd> <kbd class="kbd">K</kbd>.
        </p>
      </header>

      <div class="controls">
        <label class="field search">
          <app-icon name="search" [size]="15" />
          <input
            type="search"
            placeholder="Filter topics"
            [value]="term()"
            (input)="term.set($any($event.target).value)"
            aria-label="Filter topics"
          />
        </label>

        <div class="tag-list">
          <button type="button" class="chip" [attr.aria-pressed]="level() === null" (click)="level.set(null)">
            All
          </button>
          @for (option of levels; track option) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="level() === option"
              (click)="level.set(option)"
            >
              <span class="level level-{{ option }}">{{ option }}</span>
            </button>
          }
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="hideDone()"
            (click)="hideDone.set(!hideDone())"
          >
            Hide completed
          </button>
        </div>
      </div>

      <p class="dim count">{{ matches().length }} of {{ stats.topics }} topics</p>

      @for (module of grouped(); track module.slug) {
        <section class="module">
          <div class="spread module-head">
            <h2>
              <a [routerLink]="['/learn', module.slug]">
                <span class="stage">{{ module.stage }}</span>
                {{ module.title }}
              </a>
            </h2>
            <span class="dim">{{ module.topics.length }} shown</span>
          </div>

          <ul class="topics" role="list">
            @for (topic of module.topics; track topic.slug) {
              <li>
                <a class="card-link card card-sm" [routerLink]="['/learn', module.slug, topic.slug]">
                  <div class="spread">
                    <h3>{{ topic.title }}</h3>
                    @if (progress.isDone(topic.slug)) {
                      <span class="done"><app-icon name="check" [size]="14" /></span>
                    }
                  </div>
                  <p>{{ topic.summary }}</p>
                  <div class="meta">
                    <span class="level level-{{ topic.level }}">{{ topic.level }}</span>
                    <span><app-icon name="clock" [size]="12" /> {{ topic.minutes }} min</span>
                    @for (tag of topic.tags?.slice(0, 2) ?? []; track tag) {
                      <span class="chip chip-mono">{{ tag }}</span>
                    }
                  </div>
                </a>
              </li>
            }
          </ul>
        </section>
      }

      @if (matches().length === 0) {
        <div class="empty">
          No topics match those filters. Clear them, or try the
          <a routerLink="/glossary">glossary</a> for a term.
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
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--border);
    }

    .search {
      flex: 1;
      min-width: 220px;
      max-width: 340px;
    }

    .count {
      margin: var(--sp-4) 0;
    }

    .module + .module {
      margin-top: var(--sp-6);
    }

    .module-head {
      margin-bottom: var(--sp-3);
      padding-bottom: var(--sp-2);
      border-bottom: 1px solid var(--border);
    }

    .module-head h2 {
      font-size: var(--text-lg);
    }

    .module-head a {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      text-decoration: none;
    }

    .module-head a:hover {
      color: var(--accent);
    }

    .stage {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.1rem 0.4rem;
    }

    .topics {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    }

    .topics li {
      margin: 0;
    }

    .topics h3 {
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0;
    }

    .topics p {
      font-size: var(--text-sm);
      margin: var(--sp-2) 0 var(--sp-3);
    }

    .done {
      color: var(--accent);
      flex: none;
    }
  `,
})
export class LearnIndex {
  protected readonly progress = inject(ProgressService);
  protected readonly stats = CURRICULUM_STATS;
  protected readonly hours = Math.round(CURRICULUM_STATS.minutes / 60);
  protected readonly levels: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  protected readonly term = signal('');
  protected readonly level = signal<Level | null>(null);
  protected readonly hideDone = signal(false);

  protected readonly matches = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const level = this.level();
    const hide = this.hideDone();

    return allTopics().filter((topic) => {
      if (level && topic.level !== level) return false;
      if (hide && this.progress.isDone(topic.slug)) return false;
      if (!needle) return true;
      return `${topic.title} ${topic.summary} ${topic.tags?.join(' ') ?? ''}`
        .toLowerCase()
        .includes(needle);
    });
  });

  protected readonly grouped = computed(() => {
    const kept = new Set(this.matches().map((topic) => topic.slug));
    return MODULES.map((module) => ({
      slug: module.slug,
      title: module.title,
      stage: module.stage,
      topics: module.topics.filter((topic) => kept.has(topic.slug)) as Topic[],
    })).filter((module) => module.topics.length > 0);
  });
}
