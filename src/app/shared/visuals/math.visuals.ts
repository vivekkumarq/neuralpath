import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

const VIZ_HOST = `
  :host {
    display: block;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4);
    align-items: center;
    margin-bottom: var(--sp-4);
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 170px;
    flex: 1;
  }

  .control label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--ink-3);
    display: flex;
    justify-content: space-between;
    gap: var(--sp-2);
  }

  .control label b {
    color: var(--accent);
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4);
    margin-top: var(--sp-4);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--ink-2);
  }

  .readout b {
    color: var(--ink);
  }
`;

/**
 * Gradient descent on f(w) = (w - 3)², where the reader sets the learning rate
 * and watches the path. Divergence at a high rate is the point of the figure.
 */
@Component({
  selector: 'app-viz-gradient-descent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <div class="control">
        <label for="gd-lr">Learning rate <b>{{ rate().toFixed(2) }}</b></label>
        <input
          id="gd-lr"
          type="range"
          min="0.02"
          max="1.05"
          step="0.01"
          [value]="rate()"
          (input)="setRate($event)"
        />
      </div>
      <div class="control">
        <label for="gd-steps">Steps <b>{{ steps() }}</b></label>
        <input
          id="gd-steps"
          type="range"
          min="1"
          max="20"
          step="1"
          [value]="steps()"
          (input)="setSteps($event)"
        />
      </div>
    </div>

    <svg viewBox="0 0 420 210" role="img" aria-label="Gradient descent path on a parabola">
      <path [attr.d]="curve()" fill="none" stroke="var(--border-strong)" stroke-width="1.5" />
      <line x1="30" y1="185" x2="400" y2="185" stroke="var(--border)" />
      <line [attr.x1]="x(3)" y1="20" [attr.x2]="x(3)" y2="185" stroke="var(--accent-line)" stroke-dasharray="3 4" />
      <text [attr.x]="x(3)" y="202" fill="var(--ink-3)" font-size="9" text-anchor="middle">minimum w=3</text>

      @for (point of path(); track $index; let i = $index) {
        @if (i > 0) {
          <line
            [attr.x1]="x(path()[i - 1].w)"
            [attr.y1]="y(path()[i - 1].loss)"
            [attr.x2]="x(point.w)"
            [attr.y2]="y(point.loss)"
            stroke="var(--accent)"
            stroke-width="1.2"
            opacity="0.7"
          />
        }
        <circle
          [attr.cx]="x(point.w)"
          [attr.cy]="y(point.loss)"
          [attr.r]="i === path().length - 1 ? 5 : 3"
          [attr.fill]="i === path().length - 1 ? 'var(--accent)' : 'var(--surface)'"
          stroke="var(--accent)"
          stroke-width="1.4"
        />
      }
    </svg>

    <div class="readout">
      <span>final w <b>{{ final().w.toFixed(3) }}</b></span>
      <span>loss <b>{{ final().loss.toFixed(4) }}</b></span>
      <span>{{ verdict() }}</span>
    </div>
  `,
  styles: VIZ_HOST,
})
export class GradientDescentVisual {
  protected readonly rate = signal(0.25);
  protected readonly steps = signal(8);

  protected readonly path = computed(() => {
    const lr = this.rate();
    const out: { w: number; loss: number }[] = [];
    let w = -1.5;
    for (let i = 0; i <= this.steps(); i++) {
      out.push({ w, loss: (w - 3) ** 2 });
      w = w - lr * 2 * (w - 3);
      if (!Number.isFinite(w) || Math.abs(w) > 40) break;
    }
    return out;
  });

  protected readonly final = computed(() => this.path()[this.path().length - 1]);

  protected readonly verdict = computed(() => {
    const lr = this.rate();
    if (lr > 1) return 'diverging — every step overshoots further';
    if (lr > 0.85) return 'oscillating across the minimum';
    if (lr < 0.08) return 'stable but slow';
    return 'converging';
  });

  protected readonly curve = computed(() => {
    const points: string[] = [];
    for (let w = -2; w <= 8.05; w += 0.25) {
      points.push(`${this.x(w).toFixed(1)},${this.y((w - 3) ** 2).toFixed(1)}`);
    }
    return `M${points.join(' L')}`;
  });

  protected x(w: number): number {
    return 30 + ((Math.max(-3, Math.min(9, w)) + 3) / 12) * 370;
  }

  protected y(loss: number): number {
    return 185 - (Math.min(loss, 30) / 30) * 165;
  }

  protected setRate(event: Event): void {
    this.rate.set(Number((event.target as HTMLInputElement).value));
  }

  protected setSteps(event: Event): void {
    this.steps.set(Number((event.target as HTMLInputElement).value));
  }
}

const ACTIVATIONS = [
  {
    id: 'sigmoid',
    label: 'Sigmoid',
    f: (x: number) => 1 / (1 + Math.exp(-x)),
    d: (x: number) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
    note: 'Range (0,1). Derivative peaks at 0.25 and vanishes at the tails — output layers only.',
  },
  {
    id: 'tanh',
    label: 'Tanh',
    f: (x: number) => Math.tanh(x),
    d: (x: number) => 1 - Math.tanh(x) ** 2,
    note: 'Zero-centred and still saturating. Used in RNN gates.',
  },
  {
    id: 'relu',
    label: 'ReLU',
    f: (x: number) => Math.max(0, x),
    d: (x: number) => (x > 0 ? 1 : 0),
    note: 'Derivative 1 for positive inputs, so gradients pass undamped. Units stuck negative stop learning.',
  },
  {
    id: 'leaky',
    label: 'Leaky ReLU',
    f: (x: number) => (x > 0 ? x : 0.1 * x),
    d: (x: number) => (x > 0 ? 1 : 0.1),
    note: 'A small negative slope keeps dead units learning.',
  },
  {
    id: 'gelu',
    label: 'GELU',
    f: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    d: (x: number) => {
      const h = 1e-4;
      const f = (v: number) =>
        0.5 * v * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (v + 0.044715 * v ** 3)));
      return (f(x + h) - f(x - h)) / (2 * h);
    },
    note: 'Smooth and non-monotonic near zero. The transformer default.',
  },
];

/** Activation curves with their derivatives, which is where the story is. */
@Component({
  selector: 'app-viz-activations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      @for (option of options; track option.id) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="chosen().id === option.id"
          (click)="choose(option.id)"
        >
          {{ option.label }}
        </button>
      }
    </div>

    <svg viewBox="0 0 420 200" role="img" [attr.aria-label]="chosen().label + ' activation curve'">
      <line x1="20" y1="110" x2="400" y2="110" stroke="var(--border)" />
      <line x1="210" y1="15" x2="210" y2="190" stroke="var(--border)" />
      <path [attr.d]="fn()" fill="none" stroke="var(--accent)" stroke-width="2" />
      <path [attr.d]="deriv()" fill="none" stroke="var(--info)" stroke-width="1.4" stroke-dasharray="4 4" />
      <text x="396" y="124" fill="var(--ink-3)" font-size="9" text-anchor="end">input</text>
    </svg>

    <div class="readout">
      <span style="color: var(--accent)">— f(x)</span>
      <span style="color: var(--info)">-- f'(x)</span>
      <span>{{ chosen().note }}</span>
    </div>
  `,
  styles: VIZ_HOST,
})
export class ActivationsVisual {
  protected readonly options = ACTIVATIONS;
  private readonly active = signal('relu');

  protected readonly chosen = computed(
    () => ACTIVATIONS.find((option) => option.id === this.active()) ?? ACTIVATIONS[2],
  );

  protected readonly fn = computed(() => this.trace(this.chosen().f));
  protected readonly deriv = computed(() => this.trace(this.chosen().d));

  protected choose(id: string): void {
    this.active.set(id);
  }

  private trace(fn: (x: number) => number): string {
    const points: string[] = [];
    for (let x = -5; x <= 5.01; x += 0.1) {
      const px = 210 + x * 38;
      const py = 110 - Math.max(-2.2, Math.min(2.2, fn(x))) * 40;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return `M${points.join(' L')}`;
  }
}

/** Total error as capacity grows, decomposed into bias and variance. */
@Component({
  selector: 'app-viz-bias-variance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <div class="control">
        <label for="bv">Model capacity <b>{{ capacity() }}</b></label>
        <input id="bv" type="range" min="1" max="20" step="1" [value]="capacity()" (input)="set($event)" />
      </div>
    </div>

    <svg viewBox="0 0 420 210" role="img" aria-label="Bias, variance and total error against model capacity">
      <line x1="34" y1="180" x2="404" y2="180" stroke="var(--border)" />
      <line x1="34" y1="16" x2="34" y2="180" stroke="var(--border)" />

      <path [attr.d]="biasPath" fill="none" stroke="var(--warn)" stroke-width="1.5" />
      <path [attr.d]="variancePath" fill="none" stroke="var(--info)" stroke-width="1.5" />
      <path [attr.d]="totalPath" fill="none" stroke="var(--accent)" stroke-width="2.2" />

      <line [attr.x1]="cx()" y1="16" [attr.x2]="cx()" y2="180" stroke="var(--ink-3)" stroke-dasharray="3 4" />
      <circle [attr.cx]="cx()" [attr.cy]="cy()" r="5" fill="var(--accent)" />

      <text x="40" y="26" fill="var(--ink-3)" font-size="9">error</text>
      <text x="400" y="196" fill="var(--ink-3)" font-size="9" text-anchor="end">capacity</text>
    </svg>

    <div class="readout">
      <span style="color: var(--warn)">bias² <b>{{ bias().toFixed(2) }}</b></span>
      <span style="color: var(--info)">variance <b>{{ variance().toFixed(2) }}</b></span>
      <span style="color: var(--accent)">total <b>{{ total().toFixed(2) }}</b></span>
      <span>{{ verdict() }}</span>
    </div>
  `,
  styles: VIZ_HOST,
})
export class BiasVarianceVisual {
  protected readonly capacity = signal(8);

  protected readonly biasPath = this.trace((c) => 9 / c);
  protected readonly variancePath = this.trace((c) => 0.09 * c);
  protected readonly totalPath = this.trace((c) => 9 / c + 0.09 * c + 0.6);

  protected readonly bias = computed(() => 9 / this.capacity());
  protected readonly variance = computed(() => 0.09 * this.capacity());
  protected readonly total = computed(() => this.bias() + this.variance() + 0.6);

  protected readonly verdict = computed(() => {
    const c = this.capacity();
    if (c <= 4) return 'underfitting — bias dominates';
    if (c >= 14) return 'overfitting — variance dominates';
    return 'near the sweet spot';
  });

  protected cx(): number {
    return this.px(this.capacity());
  }

  protected cy(): number {
    return this.py(this.total());
  }

  protected set(event: Event): void {
    this.capacity.set(Number((event.target as HTMLInputElement).value));
  }

  private px(c: number): number {
    return 34 + ((c - 1) / 19) * 370;
  }

  private py(error: number): number {
    return 180 - (Math.min(error, 6) / 6) * 164;
  }

  private trace(fn: (capacity: number) => number): string {
    const points: string[] = [];
    for (let c = 1; c <= 20; c += 0.5) {
      points.push(`${this.px(c).toFixed(1)},${this.py(fn(c)).toFixed(1)}`);
    }
    return `M${points.join(' L')}`;
  }
}
