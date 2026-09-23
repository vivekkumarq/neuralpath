import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The wordmark.
 *
 * The mark is the smallest possible picture of a network — three nodes and the
 * path between them — and a signal runs the path on a slow loop. Typographic
 * rather than a stock logo, and the animation stops entirely under
 * `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none">
        <path
          id="np-trace"
          d="M6.5 21 14 7.5 21.5 21"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.35"
        />
        <path
          class="trace"
          d="M6.5 21 14 7.5 21.5 21"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle class="node apex" cx="14" cy="7.5" r="2.9" fill="currentColor" />
        <circle class="node left" cx="6.5" cy="21" r="2.3" fill="var(--bg)" stroke="currentColor" stroke-width="1.5" />
        <circle class="node right" cx="21.5" cy="21" r="2.3" fill="var(--bg)" stroke="currentColor" stroke-width="1.5" />
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
      gap: 0.5rem;
      text-decoration: none;
      color: var(--ink);
    }

    .mark {
      color: var(--accent);
      display: inline-flex;
    }

    /* The bright stroke is a dash the length of the path, walked along it. */
    .trace {
      stroke-dasharray: 14 34;
      animation: trace 3.6s linear infinite;
    }

    @keyframes trace {
      from {
        stroke-dashoffset: 48;
      }
      to {
        stroke-dashoffset: 0;
      }
    }

    .node {
      transform-origin: center;
      transform-box: fill-box;
    }

    .apex {
      animation: pulse 3.6s var(--ease) infinite;
    }

    .left {
      animation: pulse 3.6s var(--ease) infinite 1.2s;
    }

    .right {
      animation: pulse 3.6s var(--ease) infinite 2.4s;
    }

    @keyframes pulse {
      0%,
      70%,
      100% {
        transform: scale(1);
      }
      12% {
        transform: scale(1.25);
      }
    }

    :host(:hover) .trace {
      animation-duration: 1.4s;
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

    @media (prefers-reduced-motion: reduce) {
      .trace,
      .node {
        animation: none;
      }
    }

    @media (max-width: 520px) {
      .byline {
        display: none;
      }
    }
  `,
})
export class Logo {
  readonly byline = input(true);
}
