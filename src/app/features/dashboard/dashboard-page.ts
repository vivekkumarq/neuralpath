import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookmarkService } from '../../core/services/bookmark.service';
import { ProgressService } from '../../core/services/progress.service';
import { StorageService } from '../../core/services/storage.service';
import { CURRICULUM_STATS, MODULES, topicBySlug } from '../../data/curriculum';
import { PATH_PROFILES } from '../../data/now';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Dashboard</p>
        <h1>Your progress</h1>
        <p class="lede">
          Everything here is stored in this browser only — no account, no server, nothing sent
          anywhere. Clearing site data clears it, and it does not follow you to another device.
        </p>
      </header>

      @if (!storage.available) {
        <p class="note note-warn">
          <strong>Storage unavailable</strong>
          <span>
            This browser is blocking local storage (private mode, or site data disabled), so
            progress will not survive a reload.
          </span>
        </p>
      }

      <section class="overview">
        <div class="card headline">
          <p class="eyebrow">Overall</p>
          <p class="big">{{ progress.overallPercent() }}%</p>
          <div class="bar bar-lg"><span [style.width.%]="progress.overallPercent()"></span></div>
          <p class="dim">
            {{ progress.completedCount() }} of {{ stats.topics }} topics ·
            {{ answered() }} of {{ stats.quizzes }} checks answered ·
            {{ bookmarks.count() }} bookmarks
          </p>

          @if (progress.nextTopic(); as next) {
            <a class="btn btn-primary btn-sm" [routerLink]="['/learn', next.module, next.slug]">
              Next: {{ next.title }}
              <app-icon name="arrow-right" [size]="14" />
            </a>
          } @else {
            <p class="note note-tip">
              <strong>Every topic complete.</strong>
              <span>
                Pick an advanced <a routerLink="/projects">project</a> — at this point building
                teaches more than reading.
              </span>
            </p>
          }
        </div>

        <div class="card">
          <p class="eyebrow">By stage</p>
          <ul class="stages" role="list">
            @for (module of progress.byModule(); track module.slug) {
              <li>
                <a [routerLink]="['/learn', module.slug]">{{ module.short }}</a>
                <span class="bar"><span [style.width.%]="module.percent"></span></span>
                <span class="count">{{ module.done }}/{{ module.total }}</span>
              </li>
            }
          </ul>
        </div>
      </section>

      <section>
        <h2>Your learning path</h2>
        <div class="tag-list">
          @for (entry of profiles; track entry.id) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="progress.activeProfile() === entry.id"
              (click)="progress.setProfile(progress.activeProfile() === entry.id ? '' : entry.id)"
            >
              {{ entry.label }}
            </button>
          }
        </div>

        @if (profile(); as chosen) {
          <div class="card path">
            <p class="muted">{{ chosen.description }}</p>
            <ol class="order" role="list">
              @for (slug of chosen.modules; track slug; let i = $index) {
                @if (moduleTitle(slug); as title) {
                  <li>
                    <a [routerLink]="['/learn', slug]">
                      <span class="n">{{ i + 1 }}</span>
                      {{ title }}
                      <span class="pct">{{ percent(slug) }}%</span>
                    </a>
                  </li>
                }
              }
            </ol>
            <p class="note note-tip">{{ chosen.note }}</p>
          </div>
        } @else {
          <p class="dim">
            No profile selected, so the curriculum order applies. Choosing one reorders the
            <a routerLink="/roadmap">roadmap</a> without hiding anything.
          </p>
        }
      </section>

      @if (progress.recentTopics().length > 0) {
        <section>
          <h2>Recently opened</h2>
          <ul class="recent" role="list">
            @for (entry of progress.recentTopics(); track entry.slug) {
              @if (moduleOf(entry.slug); as module) {
                <li>
                  <a [routerLink]="['/learn', module, entry.slug]">{{ entry.title }}</a>
                  @if (progress.isDone(entry.slug)) {
                    <span class="done"><app-icon name="check" [size]="13" /> done</span>
                  }
                </li>
              }
            }
          </ul>
        </section>
      }

      <section class="danger">
        <h2>Reset</h2>
        <p class="dim">
          Clears completed topics, quiz answers, the chosen path and recent history. Bookmarks are
          managed separately on the <a routerLink="/bookmarks">bookmarks page</a>.
        </p>
        @if (confirming()) {
          <div class="row">
            <button type="button" class="btn btn-sm" (click)="confirming.set(false)">Cancel</button>
            <button type="button" class="btn btn-sm danger-btn" (click)="reset()">
              Yes, clear my progress
            </button>
          </div>
        } @else {
          <button type="button" class="btn btn-sm" (click)="confirming.set(true)">
            <app-icon name="refresh" [size]="14" />
            Reset progress
          </button>
        }
      </section>
    </div>
  `,
  styles: `
    .note {
      margin-bottom: var(--sp-5);
    }

    .note strong {
      display: block;
    }

    .overview {
      display: grid;
      gap: var(--sp-4);
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    @media (max-width: 840px) {
      .overview {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .big {
      font-family: var(--font-display);
      font-size: 3rem;
      font-weight: 600;
      letter-spacing: -0.04em;
      line-height: 1;
      margin: var(--sp-2) 0 var(--sp-3);
    }

    .headline .bar {
      margin-bottom: var(--sp-3);
    }

    .headline .btn {
      margin-top: var(--sp-4);
    }

    .stages {
      list-style: none;
      padding: 0;
      margin-top: var(--sp-3);
      display: grid;
      gap: 0.35rem;
    }

    .stages li {
      margin: 0;
      display: grid;
      grid-template-columns: 7.5rem minmax(0, 1fr) 3rem;
      gap: var(--sp-3);
      align-items: center;
    }

    .stages a {
      font-size: var(--text-xs);
      color: var(--ink-2);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stages a:hover {
      color: var(--accent);
    }

    .stages .count {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
      text-align: right;
    }

    section {
      margin-top: var(--sp-7);
    }

    h2 {
      font-size: var(--text-xl);
      margin-bottom: var(--sp-3);
    }

    .path {
      margin-top: var(--sp-4);
    }

    .order {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin: var(--sp-4) 0;
    }

    .order li {
      margin: 0;
    }

    .order a {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 0.3rem 0.65rem;
      border-radius: 99px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      font-size: var(--text-xs);
      text-decoration: none;
    }

    .order a:hover {
      border-color: var(--accent-line);
    }

    .order .n {
      font-family: var(--font-mono);
      color: var(--ink-3);
    }

    .order .pct {
      font-family: var(--font-mono);
      color: var(--accent);
    }

    .recent {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.35rem;
    }

    .recent li {
      margin: 0;
      display: flex;
      gap: var(--sp-3);
      align-items: center;
    }

    .recent a {
      font-size: var(--text-base);
      text-decoration-color: var(--accent-line);
    }

    .done {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: var(--text-xs);
      color: var(--accent);
    }

    .danger p {
      max-width: 72ch;
      margin-bottom: var(--sp-3);
    }

    .danger-btn {
      color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    }
  `,
})
export class DashboardPage {
  protected readonly progress = inject(ProgressService);
  protected readonly bookmarks = inject(BookmarkService);
  protected readonly storage = inject(StorageService);

  protected readonly stats = CURRICULUM_STATS;
  protected readonly profiles = PATH_PROFILES;
  protected readonly confirming = signal(false);

  protected readonly answered = computed(() => Object.keys(this.progress.answers()).length);

  protected readonly profile = computed(() =>
    PATH_PROFILES.find((entry) => entry.id === this.progress.activeProfile()),
  );

  protected moduleTitle(slug: string): string | undefined {
    return MODULES.find((module) => module.slug === slug)?.title;
  }

  protected percent(slug: string): number {
    return this.progress.byModule().find((entry) => entry.slug === slug)?.percent ?? 0;
  }

  protected moduleOf(slug: string): string | undefined {
    return topicBySlug(slug)?.module;
  }

  protected reset(): void {
    this.progress.reset();
    this.confirming.set(false);
  }
}
