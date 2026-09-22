import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InterviewQuestion, Level } from '../../core/models/content.models';
import { QUESTIONS, QUESTION_CATEGORIES } from '../../data/interview';
import { BookmarkButton } from '../../shared/bookmark-button';
import { CodeBlock } from '../../shared/code-block';
import { Icon } from '../../shared/icon';
import { InlineMarkdown } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-interview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, CodeBlock, BookmarkButton, InlineMarkdown],
  template: `
    <div class="container page">
      <header class="section-head">
        <p class="eyebrow">Interview preparation</p>
        <h1>{{ total }} questions, with the reasoning</h1>
        <p class="lede">
          Every question carries the answer, why it is the answer, the mistake that sounds right, and
          the follow-ups an interviewer asks next. Browse by category, or switch to practice mode and
          answer before revealing.
        </p>
      </header>

      <div class="controls">
        <label class="field search">
          <app-icon name="search" [size]="15" />
          <input
            type="search"
            placeholder="Filter questions"
            [value]="term()"
            (input)="term.set($any($event.target).value)"
            aria-label="Filter questions"
          />
        </label>

        <div class="row">
          <button
            type="button"
            class="btn btn-sm"
            [attr.aria-pressed]="practice()"
            (click)="togglePractice()"
          >
            <app-icon name="play" [size]="14" />
            Practice mode
          </button>
          <button type="button" class="btn btn-sm" (click)="random()">
            <app-icon name="dice" [size]="14" />
            Random question
          </button>
        </div>
      </div>

      <div class="tag-list filters">
        <button type="button" class="chip" [attr.aria-pressed]="level() === null" (click)="level.set(null)">
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
            ({{ countLevel(option) }})
          </button>
        }
      </div>

      <div class="tag-list filters">
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="category() === null"
          (click)="category.set(null)"
        >
          Every category
        </button>
        @for (name of categories; track name) {
          @if (countCategory(name) > 0) {
            <button
              type="button"
              class="chip"
              [attr.aria-pressed]="category() === name"
              (click)="category.set(name)"
            >
              {{ name }} ({{ countCategory(name) }})
            </button>
          }
        }
      </div>

      @if (practice()) {
        <section class="practice">
          @if (drill(); as question) {
            <div class="spread">
              <div class="meta">
                <span class="chip chip-mono">{{ question.category }}</span>
                <span class="level level-{{ question.difficulty }}">{{ question.difficulty }}</span>
                <span class="chip chip-mono">{{ question.kind }}</span>
              </div>
              <span class="dim">{{ drilled() }} answered this session</span>
            </div>

            <h2>{{ question.question }}</h2>

            @if (revealed()) {
              <div class="answer reveal">
                <p [innerHTML]="question.answer | inline"></p>

                @if (question.code) {
                  <app-code-block [code]="question.code.code" [lang]="question.code.lang" />
                }
                @if (question.explanation) {
                  <p class="dim" [innerHTML]="question.explanation | inline"></p>
                }
                @if (question.mistake) {
                  <p class="note note-warn">
                    <strong>Common mistake</strong>
                    <span [innerHTML]="question.mistake | inline"></span>
                  </p>
                }
                @if (question.followUps?.length) {
                  <p class="eyebrow">Expect next</p>
                  <ul class="follow" role="list">
                    @for (item of question.followUps ?? []; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
              </div>
            } @else {
              <p class="dim prompt">
                Answer out loud, in full sentences, before revealing. Saying it is the exercise —
                recognising it is not.
              </p>
            }

            <div class="row">
              <button type="button" class="btn btn-primary btn-sm" (click)="revealed.set(!revealed())">
                {{ revealed() ? 'Hide answer' : 'Show answer' }}
              </button>
              <button type="button" class="btn btn-sm" (click)="nextDrill()">
                Next question
                <app-icon name="arrow-right" [size]="14" />
              </button>
              <app-bookmark-button
                kind="question"
                [id]="question.id"
                [title]="question.question"
                [href]="'/interview?q=' + question.id"
              />
            </div>
          } @else {
            <p class="dim">No questions match the current filters.</p>
          }
        </section>
      } @else {
        <p class="dim count">{{ matches().length }} of {{ total }} questions</p>

        <ul class="list" role="list">
          @for (question of matches(); track question.id) {
            <li>
              <article class="card" [class.open]="isOpen(question.id)" [id]="question.id">
                <div class="meta">
                  <span class="chip chip-mono">{{ question.category }}</span>
                  <span class="level level-{{ question.difficulty }}">{{ question.difficulty }}</span>
                  <span class="chip chip-mono">{{ question.kind }}</span>
                </div>

                <button type="button" class="question" (click)="toggle(question.id)">
                  <h2>{{ question.question }}</h2>
                  <app-icon [name]="isOpen(question.id) ? 'minus' : 'plus'" [size]="16" />
                </button>

                @if (isOpen(question.id)) {
                  <div class="answer reveal">
                    <p [innerHTML]="question.answer | inline"></p>

                    @if (question.code) {
                      <app-code-block [code]="question.code.code" [lang]="question.code.lang" />
                    }
                    @if (question.explanation) {
                      <p class="dim" [innerHTML]="question.explanation | inline"></p>
                    }
                    @if (question.mistake) {
                      <p class="note note-warn">
                        <strong>Common mistake</strong>
                        <span [innerHTML]="question.mistake | inline"></span>
                      </p>
                    }
                    @if (question.followUps?.length) {
                      <p class="eyebrow">Expect next</p>
                      <ul class="follow" role="list">
                        @for (item of question.followUps ?? []; track item) {
                          <li>{{ item }}</li>
                        }
                      </ul>
                    }

                    <app-bookmark-button
                      kind="question"
                      [id]="question.id"
                      [title]="question.question"
                      [href]="'/interview?q=' + question.id"
                    />
                  </div>
                }
              </article>
            </li>
          }
        </ul>

        @if (matches().length === 0) {
          <div class="empty">
            Nothing matches. Clear the filters, or read the
            <a routerLink="/learn">topic</a> first and come back.
          </div>
        }
      }
    </div>
  `,
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-4);
    }

    .search {
      flex: 1;
      min-width: 220px;
      max-width: 340px;
    }

    .filters {
      padding-bottom: var(--sp-3);
    }

    .filters + .filters {
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-4);
    }

    .count {
      margin-bottom: var(--sp-3);
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

    .card {
      scroll-margin-top: calc(var(--header-h) + 1.5rem);
    }

    .card.open {
      border-color: var(--accent-line);
    }

    .question {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--sp-4);
      width: 100%;
      text-align: left;
      margin-top: var(--sp-3);
      color: var(--ink-3);
    }

    .question h2 {
      font-size: var(--text-md);
      font-weight: 500;
      color: var(--ink);
      margin: 0;
    }

    .question:hover {
      color: var(--accent);
    }

    .answer {
      margin-top: var(--sp-4);
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      max-width: 82ch;
    }

    .answer p {
      font-size: var(--text-base);
      line-height: 1.75;
      color: var(--ink-2);
    }

    .answer .note strong {
      display: block;
      margin-bottom: 0.2rem;
    }

    .follow {
      padding-left: 1.1rem;
      display: grid;
      gap: 0.2rem;
    }

    .follow li {
      font-size: var(--text-sm);
      color: var(--ink-2);
      list-style: '↳ ';
      padding-left: 0.35rem;
    }

    .practice {
      border: 1px solid var(--accent-line);
      border-radius: var(--radius-lg);
      background: var(--surface);
      padding: var(--sp-5);
    }

    .practice h2 {
      font-size: var(--text-xl);
      margin: var(--sp-4) 0;
      max-width: 60ch;
    }

    .practice .prompt {
      max-width: 60ch;
      margin-bottom: var(--sp-4);
    }

    .practice .row {
      margin-top: var(--sp-5);
    }
  `,
})
export class InterviewPage {
  /** `?q=<id>` opens a single question, so a result can be linked. */
  readonly q = input<string>('');

  protected readonly total = QUESTIONS.length;
  protected readonly categories = QUESTION_CATEGORIES;
  protected readonly levels: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  protected readonly term = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly level = signal<Level | null>(null);
  protected readonly open = signal<string[]>([]);

  protected readonly practice = signal(false);
  protected readonly revealed = signal(false);
  protected readonly drilled = signal(0);
  private readonly drillIndex = signal(0);

  protected readonly matches = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const category = this.category();
    const level = this.level();

    return QUESTIONS.filter((question) => {
      if (category && question.category !== category) return false;
      if (level && question.difficulty !== level) return false;
      if (!needle) return true;
      return `${question.question} ${question.answer} ${question.category}`
        .toLowerCase()
        .includes(needle);
    });
  });

  protected readonly drill = computed<InterviewQuestion | undefined>(() => {
    const pool = this.matches();
    return pool.length === 0 ? undefined : pool[this.drillIndex() % pool.length];
  });

  constructor() {
    effect(() => {
      const id = this.q();
      if (!id) return;
      const found = QUESTIONS.find((question) => question.id === id);
      if (!found) return;
      this.open.set([id]);
      // The list renders in the same tick; scroll once it exists.
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'center' }), 60);
    });
  }

  protected countLevel(level: Level): number {
    return QUESTIONS.filter((question) => question.difficulty === level).length;
  }

  protected countCategory(category: string): number {
    return QUESTIONS.filter((question) => question.category === category).length;
  }

  protected isOpen(id: string): boolean {
    return this.open().includes(id);
  }

  protected toggle(id: string): void {
    this.open.update((list) =>
      list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id],
    );
  }

  protected togglePractice(): void {
    this.practice.update((on) => !on);
    this.revealed.set(false);
    if (this.practice()) this.random();
  }

  protected nextDrill(): void {
    this.drilled.update((count) => count + 1);
    this.revealed.set(false);
    this.drillIndex.update((index) => index + 1);
  }

  protected random(): void {
    const pool = this.matches();
    if (pool.length === 0) return;
    this.practice.set(true);
    this.revealed.set(false);
    this.drillIndex.set(Math.floor(Math.random() * pool.length));
  }
}
