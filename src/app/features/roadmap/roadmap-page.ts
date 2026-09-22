import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../../core/models/content.models';
import { ProgressService } from '../../core/services/progress.service';
import { CURRICULUM_STATS, MODULES } from '../../data/curriculum';
import { PATH_PROFILES } from '../../data/now';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Roadmap</p>
        <h1>The whole path, in dependency order</h1>
        <p class="lede">
          {{ stats.modules }} stages and {{ stats.topics }} topics. Each stage exists because the one
          before it runs out — the mathematics stage is here because you cannot debug a model
          without it, and the transformers stage is here because sequence models could not be
          parallelised.
        </p>
      </header>

      <div class="controls">
        <div class="tag-list">
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="level() === null"
            (click)="level.set(null)"
          >
            All levels
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
        </div>

        <label class="field profile-picker">
          <app-icon name="filter" [size]="15" />
          <select [value]="progress.activeProfile()" (change)="setProfile($event)" aria-label="Learner profile">
            <option value="">Curriculum order</option>
            @for (entry of profiles; track entry.id) {
              <option [value]="entry.id">{{ entry.label }}</option>
            }
          </select>
        </label>
      </div>

      @if (activeProfile(); as chosen) {
        <p class="note note-tip">
          <strong>{{ chosen.label }}:</strong> {{ chosen.note }}
        </p>
      }

      <ol class="track" role="list">
        @for (module of ordered(); track module.slug) {
          <li>
            <div class="marker" aria-hidden="true">
              <span class="dot" [class.done]="percent(module.slug) === 100"></span>
            </div>

            <article class="card">
              <div class="spread head">
                <div>
                  <p class="eyebrow">Stage {{ module.stage }}</p>
                  <h2>
                    <a [routerLink]="['/learn', module.slug]">{{ module.title }}</a>
                  </h2>
                </div>
                <div class="row">
                  <span class="level level-{{ module.level }}">{{ module.level }}</span>
                  <span class="chip chip-mono">{{ module.topics.length }} topics</span>
                  <span class="chip chip-mono">{{ minutes(module.slug) }} min</span>
                </div>
              </div>

              <p class="muted">{{ module.description }}</p>

              <div class="progress-row">
                <div class="bar"><span [style.width.%]="percent(module.slug)"></span></div>
                <span class="dim">{{ percent(module.slug) }}%</span>
              </div>

              <ul class="topics" role="list">
                @for (topic of visibleTopics(module.slug); track topic.slug) {
                  <li>
                    <a
                      [routerLink]="['/learn', module.slug, topic.slug]"
                      [class.done]="progress.isDone(topic.slug)"
                    >
                      @if (progress.isDone(topic.slug)) {
                        <app-icon name="check" [size]="13" />
                      }
                      {{ topic.title }}
                      <span class="level level-{{ topic.level }}"></span>
                    </a>
                  </li>
                }
                @if (visibleTopics(module.slug).length === 0) {
                  <li class="dim">No topics at this level in this stage.</li>
                }
              </ul>
            </article>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-5);
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--border);
    }

    .profile-picker {
      max-width: 260px;
      gap: var(--sp-2);
    }

    .profile-picker select {
      cursor: pointer;
    }

    .note {
      margin-bottom: var(--sp-5);
    }

    .track {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-4);
    }

    .track li {
      margin: 0;
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      gap: var(--sp-4);
    }

    .marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 1.6rem;
    }

    .dot {
      width: 11px;
      height: 11px;
      border-radius: 99px;
      border: 2px solid var(--border-strong);
      background: var(--bg);
      flex: none;
    }

    .dot.done {
      background: var(--accent);
      border-color: var(--accent);
    }

    .marker::after {
      content: '';
      flex: 1;
      width: 1px;
      background: var(--border);
      margin-top: 6px;
    }

    .track li:last-child .marker::after {
      display: none;
    }

    .head h2 {
      font-size: var(--text-xl);
      margin-top: 2px;
    }

    .head a {
      text-decoration: none;
    }

    .head a:hover {
      color: var(--accent);
    }

    .card > .muted {
      margin-top: var(--sp-3);
      max-width: 72ch;
      font-size: var(--text-base);
    }

    .progress-row {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin: var(--sp-4) 0;
    }

    .progress-row .bar {
      flex: 1;
    }

    .topics {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }

    .topics li {
      margin: 0;
    }

    .topics a {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.28rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: 99px;
      background: var(--bg-soft);
      font-size: var(--text-xs);
      color: var(--ink-2);
      text-decoration: none;
    }

    .topics a:hover {
      border-color: var(--accent-line);
      color: var(--ink);
    }

    .topics a.done {
      border-color: var(--accent-line);
      color: var(--accent);
      background: var(--accent-soft);
    }

    .topics .level::before {
      width: 5px;
      height: 5px;
    }

    @media (max-width: 640px) {
      .track li {
        grid-template-columns: minmax(0, 1fr);
      }

      .marker {
        display: none;
      }
    }
  `,
})
export class RoadmapPage {
  protected readonly progress = inject(ProgressService);
  protected readonly stats = CURRICULUM_STATS;
  protected readonly profiles = PATH_PROFILES;
  protected readonly levels: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  protected readonly level = signal<Level | null>(null);

  protected readonly activeProfile = computed(() =>
    PATH_PROFILES.find((entry) => entry.id === this.progress.activeProfile()),
  );

  /** Curriculum order, unless a profile supplies its own. */
  protected readonly ordered = computed(() => {
    const chosen = this.activeProfile();
    if (!chosen) return MODULES;

    const ranked = chosen.modules
      .map((slug) => MODULES.find((module) => module.slug === slug))
      .filter((module): module is (typeof MODULES)[number] => module !== undefined);

    const rest = MODULES.filter((module) => !chosen.modules.includes(module.slug));
    return [...ranked, ...rest];
  });

  protected visibleTopics(moduleSlug: string) {
    const module = MODULES.find((entry) => entry.slug === moduleSlug);
    const chosen = this.level();
    if (!module) return [];
    return chosen ? module.topics.filter((topic) => topic.level === chosen) : module.topics;
  }

  protected percent(moduleSlug: string): number {
    return this.progress.byModule().find((entry) => entry.slug === moduleSlug)?.percent ?? 0;
  }

  protected minutes(moduleSlug: string): number {
    const module = MODULES.find((entry) => entry.slug === moduleSlug);
    return module?.topics.reduce((total, topic) => total + topic.minutes, 0) ?? 0;
  }

  protected setProfile(event: Event): void {
    this.progress.setProfile((event.target as HTMLSelectElement).value);
  }
}
