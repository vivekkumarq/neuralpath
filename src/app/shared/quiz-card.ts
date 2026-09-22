import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Quiz } from '../core/models/content.models';
import { ProgressService } from '../core/services/progress.service';
import { Icon } from './icon';
import { InlineMarkdown } from './markdown.pipe';

/**
 * A single multiple-choice check.
 *
 * The chosen option is stored by quiz id, so an answered question stays
 * answered when the reader comes back to the topic.
 */
@Component({
  selector: 'app-quiz-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, InlineMarkdown],
  template: `
    <section class="quiz" [class.answered]="answered()">
      <p class="eyebrow">Check yourself</p>
      <p class="prompt" [innerHTML]="quiz().prompt | inline"></p>

      <ul role="list">
        @for (option of quiz().options; track option; let i = $index) {
          <li>
            <button
              type="button"
              [class.correct]="answered() && i === quiz().answer"
              [class.wrong]="chosen() === i && i !== quiz().answer"
              [disabled]="answered()"
              (click)="choose(i)"
            >
              <span class="marker">{{ letters[i] }}</span>
              <span class="text" [innerHTML]="option | inline"></span>
              @if (answered() && i === quiz().answer) {
                <app-icon name="check" [size]="16" />
              }
              @if (chosen() === i && i !== quiz().answer) {
                <app-icon name="close" [size]="16" />
              }
            </button>
          </li>
        }
      </ul>

      @if (answered()) {
        <div class="explain reveal">
          <strong>{{ correct() ? 'Correct.' : 'Not quite.' }}</strong>
          <span [innerHTML]="quiz().explanation | inline"></span>
        </div>
      }
    </section>
  `,
  styles: `
    .quiz {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      padding: var(--sp-5);
    }

    .prompt {
      font-weight: 500;
      font-size: var(--text-md);
      margin: var(--sp-2) 0 var(--sp-4);
    }

    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--sp-2);
    }

    li + li {
      margin-top: 0;
    }

    button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      text-align: left;
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-soft);
      font-size: var(--text-base);
      transition:
        border-color var(--dur) var(--ease),
        background var(--dur) var(--ease);
    }

    button:hover:not(:disabled) {
      border-color: var(--accent-line);
      background: var(--surface-2);
    }

    button:disabled {
      cursor: default;
      opacity: 0.75;
    }

    button.correct {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--ink);
      opacity: 1;
    }

    button.wrong {
      border-color: var(--danger);
      background: var(--danger-soft);
      opacity: 1;
    }

    .marker {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
      flex: none;
    }

    .text {
      flex: 1;
    }

    .explain {
      margin-top: var(--sp-4);
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
      font-size: var(--text-base);
      color: var(--ink-2);
    }

    .explain strong {
      color: var(--ink);
      margin-right: 0.35rem;
    }
  `,
})
export class QuizCard {
  readonly quiz = input.required<Quiz>();

  private readonly progress = inject(ProgressService);
  protected readonly letters = ['A', 'B', 'C', 'D', 'E'];

  protected readonly chosen = computed(() => this.progress.answers()[this.quiz().id]);
  protected readonly answered = computed(() => this.chosen() !== undefined);
  protected readonly correct = computed(() => this.chosen() === this.quiz().answer);

  protected choose(index: number): void {
    if (this.answered()) return;
    this.progress.answerQuiz(this.quiz().id, index);
  }
}
