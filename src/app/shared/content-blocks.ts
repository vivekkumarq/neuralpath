import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Block } from '../core/models/content.models';
import { CodeBlock } from './code-block';
import { InlineMarkdown } from './markdown.pipe';
import { QuizCard } from './quiz-card';
import { Visual } from './visuals/visual';

/**
 * Renders a topic's `Block[]`.
 *
 * All article content flows through here, so a new block kind is added to the
 * `Block` union and to this switch — never by writing bespoke markup in a page
 * component.
 */
@Component({
  selector: 'app-content-blocks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock, QuizCard, Visual, InlineMarkdown],
  template: `
    @for (block of blocks(); track $index) {
      @switch (block.kind) {
        @case ('text') {
          <p class="body" [innerHTML]="block.body | inline"></p>
        }
        @case ('heading') {
          <h3 [id]="anchor(block.text)">{{ block.text }}</h3>
        }
        @case ('list') {
          @if (block.ordered) {
            <ol class="body">
              @for (item of block.items; track $index) {
                <li [innerHTML]="item | inline"></li>
              }
            </ol>
          } @else {
            <ul class="body">
              @for (item of block.items; track $index) {
                <li [innerHTML]="item | inline"></li>
              }
            </ul>
          }
        }
        @case ('steps') {
          <ol class="steps">
            @for (step of block.items; track $index) {
              <li>
                <strong>{{ step.title }}</strong>
                <span [innerHTML]="step.body | inline"></span>
              </li>
            }
          </ol>
        }
        @case ('code') {
          <app-code-block [code]="block.code" [lang]="block.lang" [caption]="block.caption ?? ''" />
        }
        @case ('note') {
          <aside class="note note-{{ block.tone }}">
            <strong>{{ block.title }}</strong>
            <span [innerHTML]="block.body | inline"></span>
          </aside>
        }
        @case ('table') {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  @for (heading of block.head; track $index) {
                    <th scope="col">{{ heading }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of block.rows; track $index) {
                  <tr>
                    @for (cell of row; track $index) {
                      <td [innerHTML]="cell | inline"></td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (block.caption) {
            <p class="dim">{{ block.caption }}</p>
          }
        }
        @case ('math') {
          <div class="math">
            <code>{{ block.expr }}</code>
            @if (block.note) {
              <p [innerHTML]="block.note | inline"></p>
            }
          </div>
        }
        @case ('visual') {
          <app-visual [id]="block.id" [caption]="block.caption ?? ''" />
        }
        @case ('quiz') {
          <app-quiz-card [quiz]="block.quiz" />
        }
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
    }

    /* A section heading inside long prose needs a mark of its own, or it
       reads as just another bold line. A short accent rule does it. */
    h3 {
      position: relative;
      margin-top: var(--sp-4);
      padding-top: var(--sp-4);
      scroll-margin-top: calc(var(--header-h) + 1.5rem);
      border-top: 1px solid var(--border);
    }

    h3::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 0;
      width: 36px;
      height: 2px;
      background: var(--accent);
    }

    :host > h3:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    :host > h3:first-child::before {
      display: none;
    }

    .body {
      font-size: var(--text-md);
      line-height: 1.75;
      color: var(--ink-2);
      max-width: var(--prose-max);
    }

    .body strong {
      color: var(--ink);
      font-weight: 600;
    }

    .steps {
      list-style: none;
      counter-reset: step;
      padding: 0;
      display: grid;
      gap: var(--sp-3);
      max-width: var(--prose-max);
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
      color: var(--ink);
      display: block;
    }

    .note {
      max-width: var(--prose-max);
    }

    .note strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .note span {
      color: var(--ink-2);
    }

    .math {
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius);
      background: var(--sunken);
      box-shadow: var(--shadow-sm);
      padding: var(--sp-4) var(--sp-5);
      max-width: var(--prose-max);
      overflow-x: auto;
    }

    .math code {
      font-size: var(--text-lg);
      background: none;
      border: none;
      padding: 0;
      color: var(--ink);
      white-space: normal;
    }

    .math p {
      margin-top: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--ink-3);
    }
  `,
})
export class ContentBlocks {
  readonly blocks = input.required<Block[]>();

  /** Stable ids so the table of contents can link to a heading. */
  protected anchor(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
