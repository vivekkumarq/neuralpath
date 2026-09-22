import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The wordmark. Typographic rather than a stock mark: a node glyph built from
 * three connected dots (the smallest possible picture of a network) beside the
 * name, with the personal byline underneath.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
        <path d="M7 20.5 14 7.5l7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="14" cy="7.5" r="3" fill="currentColor" />
        <circle cx="7" cy="20.5" r="2.4" fill="var(--bg)" stroke="currentColor" stroke-width="1.6" />
        <circle cx="21" cy="20.5" r="2.4" fill="var(--bg)" stroke="currentColor" stroke-width="1.6" />
      </svg>
    </span>

    <span class="words">
      <span class="name">neural<span class="accent">path</span></span>
      @if (byline()) {
        <span class="byline">Vivek Kumar · AI/ML Engineering</span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      color: var(--ink);
    }

    .mark {
      color: var(--accent);
      display: inline-flex;
    }

    .words {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.0625rem;
      letter-spacing: -0.03em;
    }

    .accent {
      color: var(--accent);
    }

    .byline {
      font-family: var(--font-mono);
      font-size: 0.5625rem;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ink-3);
      margin-top: 2px;
    }
  `,
})
export class Logo {
  readonly byline = input(true);
}
