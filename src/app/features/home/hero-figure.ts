import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Node {
  x: number;
  y: number;
  layer: number;
}

/** Four layers, mirroring the shape of the curriculum: broad in, narrow out. */
const LAYERS = [5, 7, 6, 3];

const NODES: Node[] = LAYERS.flatMap((count, layer) =>
  Array.from({ length: count }, (_, i) => ({
    layer,
    x: 40 + layer * 86,
    y: 24 + ((190 - 24) / (count + 1)) * (i + 1),
  })),
);

const EDGES = NODES.flatMap((from, fromIndex) =>
  NODES.map((to, toIndex) => ({ from, to, fromIndex, toIndex })).filter(
    ({ to }) => to.layer === from.layer + 1,
  ),
);

/** The four points the signal travels through, one per layer. */
const PATH = [NODES[2], NODES[7], NODES[14], NODES[19]];

/**
 * The hero figure: a network with a signal travelling through it.
 *
 * It is the brand mark at scale rather than a stock illustration, and it is the
 * one piece of purely decorative motion on the site — so it is slow, low
 * contrast, and disabled entirely under `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-hero-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <div class="chrome">
        <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="label">forward pass</span>
        <span class="shape">67 topics · 16 stages</span>
      </div>

      <svg viewBox="0 0 320 214" role="img" aria-label="An abstract neural network with a signal passing through it">
        <defs>
          <linearGradient id="np-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.05" />
            <stop offset="50%" stop-color="var(--accent)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        @for (edge of edges; track $index) {
          <line
            [attr.x1]="edge.from.x"
            [attr.y1]="edge.from.y"
            [attr.x2]="edge.to.x"
            [attr.y2]="edge.to.y"
            stroke="var(--border-strong)"
            stroke-width="0.5"
            opacity="0.5"
          />
        }

        <polyline
          [attr.points]="signalPath"
          fill="none"
          stroke="url(#np-edge)"
          stroke-width="2"
          stroke-linecap="round"
        />

        <circle r="3.5" fill="var(--accent)" class="pulse">
          <animateMotion [attr.path]="motionPath" dur="6s" repeatCount="indefinite" />
        </circle>

        @for (node of nodes; track $index) {
          <circle
            [attr.cx]="node.x"
            [attr.cy]="node.y"
            [attr.r]="onPath($index) ? 5 : 3.2"
            [attr.fill]="onPath($index) ? 'var(--accent)' : 'var(--surface-2)'"
            [attr.stroke]="onPath($index) ? 'var(--accent)' : 'var(--border-strong)'"
            stroke-width="1.2"
          />
        }

        <text x="40" y="208" font-size="7" fill="var(--ink-3)" text-anchor="middle">input</text>
        <text x="298" y="208" font-size="7" fill="var(--ink-3)" text-anchor="end">output</text>
      </svg>

      <dl class="readout">
        @for (row of readout; track row.label) {
          <div>
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        }
      </dl>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .panel {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, transparent), transparent 40%),
        var(--surface);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .chrome {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.5rem 0.85rem;
      border-bottom: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--ink-3);
      background: var(--bg-soft);
    }

    .dots {
      display: inline-flex;
      gap: 4px;
    }

    .dots i {
      width: 7px;
      height: 7px;
      border-radius: 99px;
      background: var(--border-strong);
    }

    .dots i:first-child {
      background: var(--accent);
      opacity: 0.6;
    }

    .shape {
      margin-left: auto;
    }

    svg {
      width: 100%;
      height: auto;
      display: block;
      padding: var(--sp-3) var(--sp-2) 0;
    }

    .pulse {
      filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 70%, transparent));
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-top: 1px solid var(--border);
    }

    .readout > div {
      padding: 0.65rem 0.85rem;
      border-right: 1px solid var(--border);
    }

    .readout > div:last-child {
      border-right: none;
    }

    dt {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    dd {
      margin: 2px 0 0;
      font-size: var(--text-sm);
      color: var(--ink);
      font-weight: 500;
    }

    @media (prefers-reduced-motion: reduce) {
      .pulse {
        display: none;
      }
    }
  `,
})
export class HeroFigure {
  protected readonly nodes = NODES;
  protected readonly edges = EDGES;

  protected readonly signalPath = PATH.map((node) => `${node.x},${node.y}`).join(' ');
  protected readonly motionPath = `M${PATH.map((node) => `${node.x} ${node.y}`).join(' L')}`;

  private readonly pathSet = new Set(PATH.map((node) => NODES.indexOf(node)));

  protected readonly readout = [
    { label: 'stage', value: 'Transformers' },
    { label: 'depth', value: '16 layers' },
    { label: 'state', value: 'learning' },
  ];

  protected onPath(index: number): boolean {
    return this.pathSet.has(index);
  }
}
