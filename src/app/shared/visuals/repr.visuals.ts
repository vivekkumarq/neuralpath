import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepPlayer } from './step-player';

/* ---- Autoencoder ---------------------------------------------------------- */

/**
 * Encoder, bottleneck, decoder. The figure exists to make the bottleneck the
 * visible point: the code is narrower than the input, so copying is impossible
 * and the network has to compress.
 */
@Component({
  selector: 'app-viz-autoencoder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 200" role="img" aria-label="An autoencoder compressing an input through a narrow code and reconstructing it">
      @for (layer of layers; track layer.label; let l = $index) {
        <text [attr.x]="layer.x" y="18" font-size="7.5" text-anchor="middle"
          [attr.fill]="l <= reached() ? 'var(--ink-2)' : 'var(--ink-3)'">{{ layer.label }}</text>
        <text [attr.x]="layer.x" y="28" font-size="6.5" text-anchor="middle" fill="var(--ink-3)">
          {{ layer.n }}d
        </text>

        @for (node of nodeList(layer.n); track $index; let i = $index) {
          <circle [attr.cx]="layer.x" [attr.cy]="nodeY(layer.n, i)" r="5.5"
            [attr.fill]="l <= reached() ? (l === 2 ? 'var(--accent)' : 'var(--accent-soft)') : 'var(--surface-3)'"
            [attr.stroke]="l <= reached() ? 'var(--accent-line)' : 'var(--border)'" stroke-width="1" />
        }

        @if (l > 0) {
          @for (edge of edges(l); track $index) {
            <line [attr.x1]="layers[l - 1].x + 6" [attr.y1]="edge.y1"
              [attr.x2]="layer.x - 6" [attr.y2]="edge.y2"
              [attr.stroke]="l <= reached() ? 'var(--accent-line)' : 'var(--border)'"
              stroke-width="0.6" opacity="0.7" />
          }
        }
      }

      <text x="92" y="190" font-size="8" fill="var(--ink-3)" text-anchor="middle">encoder</text>
      <text x="210" y="190" font-size="8" font-weight="600" fill="var(--accent)" text-anchor="middle">
        bottleneck
      </text>
      <text x="328" y="190" font-size="8" fill="var(--ink-3)" text-anchor="middle">decoder</text>

      @if (step() >= 4) {
        <text x="210" y="172" font-size="8" fill="var(--warn)" text-anchor="middle">
          reconstruction error drives training
        </text>
      }
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1500"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    circle, line { transition: fill var(--dur) var(--ease), stroke var(--dur) var(--ease); }
  `,
})
export class AutoencoderVisual {
  protected readonly step = signal(0);

  protected readonly layers = [
    { label: 'input', n: 10, x: 40 },
    { label: 'encode', n: 6, x: 125 },
    { label: 'code', n: 2, x: 210 },
    { label: 'decode', n: 6, x: 295 },
    { label: 'output', n: 10, x: 380 },
  ];

  protected readonly captions = [
    'The input: ten numbers.',
    'The encoder compresses it.',
    'Everything has to pass through two numbers. There is no room to copy, so the network must keep only what matters.',
    'The decoder rebuilds ten numbers from those two.',
    'Training compares the output against the original input. No labels were used anywhere — the data supervised itself.',
  ];

  protected readonly reached = computed(() => this.step());

  protected nodeList(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  protected nodeY(n: number, index: number): number {
    const span = 110;
    const top = 95 - span / 2;
    return n === 1 ? 95 : top + (index / (n - 1)) * span;
  }

  protected edges(layerIndex: number): { y1: number; y2: number }[] {
    const from = this.layers[layerIndex - 1];
    const to = this.layers[layerIndex];
    const out: { y1: number; y2: number }[] = [];
    for (let a = 0; a < from.n; a++) {
      for (let b = 0; b < to.n; b++) {
        out.push({ y1: this.nodeY(from.n, a), y2: this.nodeY(to.n, b) });
      }
    }
    return out;
  }
}

/* ---- Matrix factorisation -------------------------------------------------- */

/** A sparse user-item matrix approximated by two small factor matrices. */
@Component({
  selector: 'app-viz-matrix-factorisation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 210" role="img" aria-label="A sparse ratings matrix factorised into user and item factors">
      <text x="14" y="14" font-size="8" font-weight="600" fill="var(--ink-2)">ratings R</text>
      <text x="14" y="24" font-size="6.5" fill="var(--ink-3)">users x items, mostly empty</text>

      @for (row of grid; track $index; let r = $index) {
        @for (cell of row; track $index; let c = $index) {
          <rect [attr.x]="14 + c * 21" [attr.y]="34 + r * 21" width="18" height="18" rx="3"
            [attr.fill]="cellFill(r, c)"
            [attr.stroke]="isTarget(r, c) ? 'var(--accent)' : 'var(--border)'"
            [attr.stroke-width]="isTarget(r, c) ? 1.6 : 0.8" />
          @if (cell > 0) {
            <text [attr.x]="23 + c * 21" [attr.y]="47 + r * 21" font-size="7.5"
              fill="var(--ink-2)" text-anchor="middle">{{ cell }}</text>
          }
          @if (isTarget(r, c) && step() >= 3) {
            <text [attr.x]="23 + c * 21" [attr.y]="47 + r * 21" font-size="7.5" font-weight="700"
              fill="var(--accent)" text-anchor="middle">{{ predicted }}</text>
          }
        }
      }

      <text x="152" y="108" font-size="16" fill="var(--ink-3)">≈</text>

      <!-- user factors -->
      <text x="178" y="24" font-size="8" font-weight="600"
        [attr.fill]="step() >= 1 ? 'var(--accent)' : 'var(--ink-3)'">P</text>
      @if (step() >= 1) {
        @for (row of users; track $index; let r = $index) {
          @for (v of row; track $index; let c = $index) {
            <rect [attr.x]="176 + c * 21" [attr.y]="34 + r * 21" width="18" height="18" rx="3"
              fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-width="0.8" />
            <text [attr.x]="185 + c * 21" [attr.y]="47 + r * 21" font-size="6.5"
              fill="var(--ink-2)" text-anchor="middle">{{ v }}</text>
          }
        }
        <text x="186" y="178" font-size="6.5" fill="var(--ink-3)" text-anchor="middle">2 factors</text>
      }

      <text x="226" y="108" font-size="14" fill="var(--ink-3)">×</text>

      <!-- item factors -->
      <text x="252" y="24" font-size="8" font-weight="600"
        [attr.fill]="step() >= 2 ? 'var(--info)' : 'var(--ink-3)'">Qᵀ</text>
      @if (step() >= 2) {
        @for (row of items; track $index; let r = $index) {
          @for (v of row; track $index; let c = $index) {
            <rect [attr.x]="250 + c * 21" [attr.y]="34 + r * 21" width="18" height="18" rx="3"
              fill="var(--info-soft)" stroke="var(--border-strong)" stroke-width="0.8" />
            <text [attr.x]="259 + c * 21" [attr.y]="47 + r * 21" font-size="6.5"
              fill="var(--ink-2)" text-anchor="middle">{{ v }}</text>
          }
        }
      }

      @if (step() >= 3) {
        <text x="14" y="196" font-size="8" fill="var(--accent)">
          the empty cell is the dot product of its user row and item column
        </text>
      }
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1800"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    rect { transition: fill var(--dur) var(--ease), stroke var(--dur) var(--ease); }
  `,
})
export class MatrixFactorisationVisual {
  protected readonly step = signal(0);
  protected readonly predicted = '4.1';

  protected readonly captions = [
    'Most of the matrix is empty: a user has touched a tiny fraction of the catalogue.',
    'Learn a short vector of latent factors for each user.',
    'And one for each item. Nobody labels what the factors mean; they come out of training.',
    'Every empty cell now has a prediction — the dot product of the matching user and item vectors.',
  ];

  /** 0 means unrated. */
  protected readonly grid = [
    [5, 0, 3, 0, 0, 1],
    [0, 0, 0, 4, 0, 0],
    [4, 2, 0, 0, 5, 0],
    [0, 0, 5, 0, 0, 2],
    [1, 0, 0, 3, 0, 0],
    [0, 4, 0, 0, 2, 0],
  ];

  protected readonly users = [
    [0.9, 0.2], [0.1, 0.8], [0.7, 0.6], [0.3, 0.9], [0.8, 0.1], [0.2, 0.7],
  ];

  protected readonly items = [
    [0.8, 0.3, 0.6, 0.2, 0.9, 0.4],
    [0.2, 0.7, 0.4, 0.8, 0.1, 0.6],
  ];

  protected isTarget(row: number, col: number): boolean {
    return row === 1 && col === 0;
  }

  protected cellFill(row: number, col: number): string {
    if (this.isTarget(row, col)) return this.step() >= 3 ? 'var(--accent-soft)' : 'var(--surface-2)';
    return this.grid[row][col] > 0 ? 'var(--surface-3)' : 'var(--surface-2)';
  }
}

/* ---- Isolation forest ------------------------------------------------------ */

/** Random splits isolate an outlier in a couple of cuts; a dense point takes many. */
@Component({
  selector: 'app-viz-isolation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 210" role="img" aria-label="Random splits isolating an outlier faster than a normal point">
      <rect x="14" y="14" width="250" height="180" rx="6" fill="var(--surface-2)" stroke="var(--border)" />

      @for (cut of visibleCuts(); track $index) {
        <line [attr.x1]="cut.x1" [attr.y1]="cut.y1" [attr.x2]="cut.x2" [attr.y2]="cut.y2"
          stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.8" />
      }

      @for (p of points; track $index) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="p.outlier ? 5 : 3.2"
          [attr.fill]="p.outlier ? 'var(--danger)' : 'var(--ink-3)'"
          [attr.opacity]="p.outlier ? 1 : 0.65" />
      }

      <text x="292" y="30" font-size="8" font-weight="600" fill="var(--ink-2)">splits to isolate</text>

      <circle cx="300" cy="52" r="5" fill="var(--danger)" />
      <text x="314" y="55" font-size="7.5" fill="var(--ink-2)">outlier</text>
      <rect x="292" y="62" width="110" height="12" rx="3" fill="var(--surface-3)" />
      <rect x="292" y="62" [attr.width]="outlierBar()" height="12" rx="3" fill="var(--danger)" />
      <text x="396" y="88" font-size="7" fill="var(--ink-3)" text-anchor="end">{{ outlierDepth() }} splits</text>

      <circle cx="300" cy="112" r="3.2" fill="var(--ink-3)" />
      <text x="314" y="115" font-size="7.5" fill="var(--ink-2)">dense point</text>
      <rect x="292" y="122" width="110" height="12" rx="3" fill="var(--surface-3)" />
      <rect x="292" y="122" [attr.width]="denseBar()" height="12" rx="3" fill="var(--ink-3)" />
      <text x="396" y="148" font-size="7" fill="var(--ink-3)" text-anchor="end">{{ denseDepth() }} splits</text>

      <text x="292" y="176" font-size="7" fill="var(--ink-3)">shallow depth</text>
      <text x="292" y="186" font-size="7" fill="var(--ink-3)">= anomalous</text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1400"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    rect, line { transition: width var(--dur) var(--ease), opacity var(--dur) var(--ease); }
  `,
})
export class IsolationVisual {
  protected readonly step = signal(0);

  protected readonly captions = [
    'A dense cluster and one point well away from it.',
    'Pick a feature and a split point at random. The outlier is already nearly alone.',
    'A second random cut isolates it completely — depth 2.',
    'The dense point needs cut after cut before anything separates it. That difference in depth is the anomaly score.',
  ];

  protected readonly points = [
    ...Array.from({ length: 34 }, (_, i) => {
      const a = i * 2.3994;
      const r = 26 * Math.sqrt(((Math.sin(i * 7.17) + 1) / 2));
      return { x: 108 + Math.cos(a) * r, y: 124 + Math.sin(a) * r * 0.9, outlier: false };
    }),
    { x: 224, y: 48, outlier: true },
  ];

  private readonly cuts = [
    { x1: 186, y1: 14, x2: 186, y2: 194 },
    { x1: 186, y1: 86, x2: 264, y2: 86 },
    { x1: 90, y1: 14, x2: 90, y2: 194 },
    { x1: 14, y1: 140, x2: 186, y2: 140 },
    { x1: 128, y1: 14, x2: 128, y2: 140 },
  ];

  protected visibleCuts(): { x1: number; y1: number; x2: number; y2: number }[] {
    if (this.step() === 0) return [];
    if (this.step() === 1) return this.cuts.slice(0, 1);
    if (this.step() === 2) return this.cuts.slice(0, 2);
    return this.cuts;
  }

  protected outlierDepth(): number {
    return Math.min(this.step(), 2);
  }

  protected denseDepth(): number {
    return this.step() >= 3 ? 9 : Math.max(0, this.step());
  }

  protected outlierBar(): number {
    return (this.outlierDepth() / 9) * 110;
  }

  protected denseBar(): number {
    return (this.denseDepth() / 9) * 110;
  }
}

/* ---- Residual block -------------------------------------------------------- */

/** Why a skip connection keeps a very deep network trainable. */
@Component({
  selector: 'app-viz-residual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 190" role="img" aria-label="A residual block with a skip connection around two weight layers">
      <circle cx="30" cy="96" r="12" fill="var(--surface-3)" stroke="var(--border-strong)" />
      <text x="30" y="100" font-size="10" fill="var(--ink-2)" text-anchor="middle">x</text>

      <rect x="86" y="78" width="78" height="36" rx="8"
        [attr.fill]="back() ? 'var(--warn-soft)' : 'var(--surface-2)'" stroke="var(--border-strong)" />
      <text x="125" y="100" font-size="8" fill="var(--ink-2)" text-anchor="middle">weight layer</text>

      <rect x="186" y="78" width="78" height="36" rx="8"
        [attr.fill]="back() ? 'var(--warn-soft)' : 'var(--surface-2)'" stroke="var(--border-strong)" />
      <text x="225" y="100" font-size="8" fill="var(--ink-2)" text-anchor="middle">weight layer</text>

      <circle cx="310" cy="96" r="13" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.4" />
      <text x="310" y="101" font-size="12" fill="var(--accent)" text-anchor="middle">+</text>

      <circle cx="378" cy="96" r="12" fill="var(--surface-3)" stroke="var(--border-strong)" />
      <text x="378" y="100" font-size="9" fill="var(--ink-2)" text-anchor="middle">y</text>

      <path d="M42 96 H86" stroke="var(--border-strong)" stroke-width="1.5" />
      <path d="M164 96 H186" stroke="var(--border-strong)" stroke-width="1.5" />
      <path d="M264 96 H297" stroke="var(--border-strong)" stroke-width="1.5" />
      <path d="M323 96 H366" stroke="var(--border-strong)" stroke-width="1.5" />

      <!-- the shortcut -->
      <path d="M30 84 V40 H310 V83" fill="none" stroke-width="2"
        [attr.stroke]="skipLit() ? 'var(--accent)' : 'var(--border-strong)'" />
      <text x="170" y="34" font-size="8" text-anchor="middle"
        [attr.fill]="skipLit() ? 'var(--accent)' : 'var(--ink-3)'">identity shortcut — no weights</text>

      @if (back()) {
        <text x="170" y="146" font-size="8" fill="var(--warn)" text-anchor="middle">
          gradient shrinks through each layer
        </text>
        <text x="170" y="162" font-size="8" fill="var(--accent)" text-anchor="middle">
          but arrives intact along the shortcut
        </text>
      }

      <text x="378" y="128" font-size="7.5" fill="var(--ink-3)" text-anchor="middle">y = F(x) + x</text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1600"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    rect, path, circle { transition: fill var(--dur) var(--ease), stroke var(--dur) var(--ease); }
  `,
})
export class ResidualVisual {
  protected readonly step = signal(0);

  protected readonly captions = [
    'The input passes through two weight layers, as in any network.',
    'A shortcut carries the same input straight past them and adds it back at the end.',
    'So the block only has to learn F(x), the difference it contributes. If it has nothing to add it can learn zero and pass the input through unchanged.',
    'On the backward pass the gradient decays through the weight layers — but the shortcut has no weights, so a copy reaches the earlier layers undiminished. That is what makes 150 layers trainable.',
  ];

  protected readonly skipLit = computed(() => this.step() >= 1);
  protected readonly back = computed(() => this.step() >= 3);
}