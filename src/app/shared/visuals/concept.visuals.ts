import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepPlayer } from './step-player';

/* ---- RNN unrolling and the vanishing gradient ----------------------------- */

const SENTENCE = ['The', 'model', 'trained', 'on', 'data', 'from', 'last', 'year', 'is', 'stale'];

/**
 * A recurrent network unrolled across time, with the gradient that reaches each
 * step shrinking as it travels back. The decay is the whole argument for
 * attention, so the figure shows it rather than asserting it.
 */
@Component({
  selector: 'app-viz-rnn-unroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 180" role="img" aria-label="A recurrent network unrolled over ten time steps">
      @for (word of sentence; track $index; let i = $index) {
        @if (i > 0) {
          <line
            [attr.x1]="x(i - 1) + 13"
            y1="70"
            [attr.x2]="x(i) - 13"
            y2="70"
            [attr.stroke]="i <= step() ? 'var(--accent)' : 'var(--border)'"
            [attr.stroke-width]="i <= step() ? 1.8 : 1"
          />
        }

        <rect
          [attr.x]="x(i) - 13"
          y="57"
          width="26"
          height="26"
          rx="6"
          [attr.fill]="i <= step() ? 'var(--accent-soft)' : 'var(--surface-2)'"
          [attr.stroke]="i === step() ? 'var(--accent)' : 'var(--border-strong)'"
          stroke-width="1.4"
        />
        <text [attr.x]="x(i)" y="74" font-size="8" fill="var(--ink-2)" text-anchor="middle">h{{ i }}</text>

        <text [attr.x]="x(i)" y="102" font-size="7.5" fill="var(--ink-3)" text-anchor="middle">
          {{ word }}
        </text>

        @if (backward()) {
          <rect
            [attr.x]="x(i) - 11"
            y="118"
            width="22"
            [attr.height]="Math.max(1.5, gradient(i) * 40)"
            rx="2"
            fill="var(--warn)"
            [attr.opacity]="0.35 + gradient(i) * 0.65"
          />
          <text [attr.x]="x(i)" y="172" font-size="6.5" fill="var(--ink-3)" text-anchor="middle">
            {{ (gradient(i) * 100).toFixed(0) }}%
          </text>
        }
      }

      <text x="10" y="24" font-size="8" [attr.fill]="backward() ? 'var(--warn)' : 'var(--accent)'">
        {{ backward() ? 'gradient travelling back from the loss' : 'hidden state carried forward' }}
      </text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1000"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
      margin-bottom: var(--sp-3);
    }

    rect,
    line {
      transition:
        fill var(--dur) var(--ease),
        stroke var(--dur) var(--ease),
        height var(--dur) var(--ease);
    }
  `,
})
export class RnnUnrollVisual {
  protected readonly Math = Math;
  protected readonly sentence = SENTENCE;
  protected readonly step = signal(0);

  protected readonly captions = [
    'Step 0: the first token updates the hidden state.',
    ...SENTENCE.slice(1, 10).map(
      (word, i) => `Step ${i + 1}: "${word}" arrives; the state carries everything before it.`,
    ),
    'The loss is measured at the end of the sequence.',
    'Backpropagation through time: each step multiplies the gradient by roughly the same factor.',
    'By the first tokens almost nothing is left — long-range dependencies never get learned.',
  ];

  protected readonly backward = computed(() => this.step() >= 11);

  /** Gradient reaching step i after decaying back from the loss. */
  protected gradient(index: number): number {
    if (!this.backward()) return 0;
    const distance = SENTENCE.length - 1 - index;
    const decay = this.step() >= 12 ? 0.62 : 0.85;
    return Math.pow(decay, distance);
  }

  protected x(index: number): number {
    return 28 + index * 40;
  }
}

/* ---- Chunking a document -------------------------------------------------- */

const DOC_LINES = [
  { text: 'Billing', heading: true },
  { text: 'Invoices are issued on the first of each month.' },
  { text: 'A failed payment is retried three times.' },
  { text: 'Plan limits', heading: true },
  { text: 'The free plan allows 1,000 requests a day.' },
  { text: 'Webhooks are not available on the free plan.' },
  { text: 'Overage is billed at the standard rate.' },
  { text: 'Security', heading: true },
  { text: 'API keys can be rotated from the dashboard.' },
  { text: 'Keys are shown once and never again.' },
];

interface Chunk {
  from: number;
  to: number;
  label: string;
}

const NAIVE: Chunk[] = [
  { from: 0, to: 2, label: 'chunk 1' },
  { from: 3, to: 5, label: 'chunk 2' },
  { from: 6, to: 9, label: 'chunk 3' },
];

const STRUCTURED: Chunk[] = [
  { from: 0, to: 2, label: 'Billing' },
  { from: 3, to: 6, label: 'Plan limits' },
  { from: 7, to: 9, label: 'Security' },
];

/**
 * The same document split two ways.
 *
 * The naive split cuts "Webhooks are not available on the free plan" away from
 * its heading, which is exactly the failure that makes a retrieved chunk
 * useless. Switching modes makes the difference concrete.
 */
@Component({
  selector: 'app-viz-chunking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <button type="button" class="chip" [attr.aria-pressed]="!structured()" (click)="structured.set(false)">
        Fixed size
      </button>
      <button type="button" class="chip" [attr.aria-pressed]="structured()" (click)="structured.set(true)">
        Structure-aware
      </button>
      <label class="overlap">
        <input type="checkbox" [checked]="overlap()" (change)="overlap.set($any($event.target).checked)" />
        Overlap
      </label>
    </div>

    <div class="doc">
      @for (line of lines; track $index; let i = $index) {
        <div
          class="line"
          [class.heading]="line.heading"
          [style.--tint]="tint(i)"
          [class.shared]="overlap() && isShared(i)"
        >
          <span class="bar"></span>
          <span class="text">{{ line.text }}</span>
        </div>
      }
    </div>

    <div class="chunks">
      @for (chunk of chunks(); track chunk.label; let c = $index) {
        <span class="chunk" [style.--tint]="palette[c % palette.length]">{{ chunk.label }}</span>
      }
    </div>

    <p class="note" [class.note-warn]="!structured()" [class.note-tip]="structured()">
      <strong>{{ structured() ? 'Each chunk is a complete idea' : 'A chunk is cut mid-section' }}</strong>
      <span>{{ verdict() }}</span>
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      align-items: center;
      margin-bottom: var(--sp-4);
    }

    .overlap {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .doc {
      display: grid;
      gap: 2px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--sp-3);
      background: var(--bg-soft);
    }

    .line {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.22rem 0;
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .line.heading .text {
      font-weight: 600;
      color: var(--ink);
    }

    .bar {
      width: 4px;
      align-self: stretch;
      border-radius: 99px;
      background: var(--tint);
      flex: none;
      transition: background var(--dur) var(--ease);
    }

    .line.shared .bar {
      background: linear-gradient(var(--tint), var(--accent));
    }

    .chunks {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin-top: var(--sp-3);
    }

    .chunk {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      border: 1px solid var(--tint);
      color: var(--tint);
    }

    .note {
      margin-top: var(--sp-4);
    }

    .note strong {
      display: block;
      margin-bottom: 0.2rem;
    }
  `,
})
export class ChunkingVisual {
  protected readonly lines = DOC_LINES;
  protected readonly structured = signal(false);
  protected readonly overlap = signal(false);

  protected readonly palette = ['var(--accent)', 'var(--info)', 'var(--warn)'];
  protected readonly chunks = computed(() => (this.structured() ? STRUCTURED : NAIVE));

  protected readonly verdict = computed(() =>
    this.structured()
      ? 'Splitting on headings keeps every chunk answerable on its own. Prepending the heading path to the text makes it retrievable too.'
      : 'Chunk 2 ends after the webhook line, so "Overage is billed at the standard rate" is separated from the plan it belongs to. Retrieval can find it and the model still cannot use it.',
  );

  protected tint(index: number): string {
    const chunkIndex = this.chunks().findIndex((chunk) => index >= chunk.from && index <= chunk.to);
    return this.palette[chunkIndex % this.palette.length] ?? 'var(--border)';
  }

  /** With overlap on, the boundary lines belong to two chunks. */
  protected isShared(index: number): boolean {
    return this.chunks().some((chunk, i) => i > 0 && index === chunk.from);
  }
}

/* ---- LoRA: what is actually trained --------------------------------------- */

/**
 * The low-rank decomposition, to scale.
 *
 * The bars are proportional to real parameter counts, which is the point: at
 * rank 8 the trainable part is a sliver of the frozen matrix.
 */
@Component({
  selector: 'app-viz-lora',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="control">
      <label for="rank">Rank r <b>{{ rank() }}</b></label>
      <input id="rank" type="range" min="1" max="64" step="1" [value]="rank()" (input)="set($event)" />
    </div>

    <svg viewBox="0 0 400 200" role="img" aria-label="A frozen weight matrix beside its low-rank update">
      <rect x="20" y="30" width="120" height="120" rx="6" fill="var(--surface-2)" stroke="var(--border-strong)" />
      <text x="80" y="88" font-size="11" fill="var(--ink-2)" text-anchor="middle">W</text>
      <text x="80" y="104" font-size="8" fill="var(--ink-3)" text-anchor="middle">frozen</text>
      <text x="80" y="166" font-size="8" fill="var(--ink-3)" text-anchor="middle">{{ dim }} x {{ dim }}</text>

      <text x="156" y="95" font-size="14" fill="var(--ink-3)" text-anchor="middle">+</text>

      <rect [attr.x]="176" y="30" [attr.width]="barWidth()" height="120" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" />
      <text [attr.x]="176 + barWidth() / 2" y="95" font-size="9" fill="var(--accent)" text-anchor="middle">B</text>
      <text [attr.x]="176 + barWidth() / 2" y="166" font-size="7" fill="var(--ink-3)" text-anchor="middle">{{ dim }}xr</text>

      <text [attr.x]="176 + barWidth() + 14" y="95" font-size="12" fill="var(--ink-3)" text-anchor="middle">·</text>

      <rect
        [attr.x]="176 + barWidth() + 26"
        [attr.y]="90 - barWidth() / 2"
        width="120"
        [attr.height]="barWidth()"
        rx="4"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
      />
      <text [attr.x]="176 + barWidth() + 86" y="95" font-size="9" fill="var(--accent)" text-anchor="middle">A</text>
      <text [attr.x]="176 + barWidth() + 86" y="166" font-size="7" fill="var(--ink-3)" text-anchor="middle">rx{{ dim }}</text>
    </svg>

    <div class="readout">
      <span>frozen <b>{{ (frozen / 1e6).toFixed(1) }}M</b></span>
      <span>trainable <b>{{ (trainable() / 1e3).toFixed(0) }}K</b></span>
      <span>share <b>{{ share().toFixed(2) }}%</b></span>
    </div>

    <p class="dim">{{ verdict() }}</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .control {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      max-width: 300px;
      margin-bottom: var(--sp-3);
    }

    label {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
      display: flex;
      justify-content: space-between;
    }

    label b {
      color: var(--accent);
    }

    svg {
      width: 100%;
      height: auto;
    }

    rect {
      transition:
        width var(--dur) var(--ease),
        height var(--dur) var(--ease),
        x var(--dur) var(--ease),
        y var(--dur) var(--ease);
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-top: var(--sp-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .readout b {
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class LoraVisual {
  protected readonly dim = 4096;
  protected readonly frozen = 4096 * 4096;
  protected readonly rank = signal(8);

  protected readonly trainable = computed(() => 2 * this.dim * this.rank());
  protected readonly share = computed(() => (this.trainable() / this.frozen) * 100);

  protected readonly verdict = computed(() => {
    const rank = this.rank();
    if (rank <= 8) return 'Rank 8 is the usual starting point: enough for format, tone and a narrow skill.';
    if (rank <= 32) return 'Higher rank buys capacity for harder skills, at proportionally more trainable parameters.';
    return 'Past about 64 the saving shrinks and full fine-tuning becomes worth reconsidering.';
  });

  /** Bar width in view units, scaled so rank 64 stays inside the figure. */
  protected barWidth(): number {
    return 6 + (this.rank() / 64) * 40;
  }

  protected set(event: Event): void {
    this.rank.set(Number((event.target as HTMLInputElement).value));
  }
}

/* ---- Quantisation --------------------------------------------------------- */

const WEIGHTS = Array.from({ length: 48 }, (_, i) => {
  const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return (a - Math.floor(a)) * 2 - 1;
});

/** Continuous weights snapped to a grid of representable values. */
@Component({
  selector: 'app-viz-quantisation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      @for (option of options; track option.bits) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="bits() === option.bits"
          (click)="bits.set(option.bits)"
        >
          {{ option.label }}
        </button>
      }
    </div>

    <svg viewBox="0 0 400 150" role="img" aria-label="Weight values snapped to quantisation levels">
      <line x1="20" y1="75" x2="386" y2="75" stroke="var(--border)" />

      @for (level of levels(); track $index) {
        <line
          [attr.x1]="20"
          [attr.y1]="y(level)"
          x2="386"
          [attr.y2]="y(level)"
          stroke="var(--accent-line)"
          stroke-dasharray="2 5"
          opacity="0.6"
        />
      }

      @for (weight of weights; track $index; let i = $index) {
        <line
          [attr.x1]="x(i)"
          [attr.y1]="y(weight)"
          [attr.x2]="x(i)"
          [attr.y2]="y(snap(weight))"
          stroke="var(--warn)"
          stroke-width="1"
          opacity="0.5"
        />
        <circle [attr.cx]="x(i)" [attr.cy]="y(weight)" r="1.8" fill="var(--ink-3)" />
        <circle [attr.cx]="x(i)" [attr.cy]="y(snap(weight))" r="2.6" fill="var(--accent)" />
      }
    </svg>

    <div class="readout">
      <span>levels <b>{{ levels().length }}</b></span>
      <span>memory <b>{{ memory() }}</b></span>
      <span>mean error <b>{{ error().toFixed(4) }}</b></span>
    </div>

    <p class="dim">{{ verdict() }}</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin-bottom: var(--sp-3);
    }

    svg {
      width: 100%;
      height: auto;
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-top: var(--sp-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .readout b {
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class QuantisationVisual {
  protected readonly weights = WEIGHTS;
  protected readonly bits = signal(4);

  protected readonly options = [
    { bits: 16, label: '16-bit' },
    { bits: 8, label: '8-bit' },
    { bits: 4, label: '4-bit' },
    { bits: 2, label: '2-bit' },
  ];

  protected readonly levels = computed(() => {
    // Capped for drawing: 16-bit has 65,536 levels, which is a solid band.
    const count = Math.min(2 ** this.bits(), 33);
    return Array.from({ length: count }, (_, i) => -1 + (2 * i) / (count - 1));
  });

  protected readonly error = computed(() => {
    const total = this.weights.reduce((sum, w) => sum + Math.abs(w - this.snap(w)), 0);
    return total / this.weights.length;
  });

  protected readonly memory = computed(() => {
    const perParam = this.bits() / 8;
    return `${(7e9 * perParam) / 1e9} GB for 7B`;
  });

  protected readonly verdict = computed(() => {
    const bits = this.bits();
    if (bits >= 16) return 'Full precision: every value representable, and the largest memory footprint.';
    if (bits === 8) return 'Usually close to lossless, and half the memory. The safe default for serving.';
    if (bits === 4) return 'The practical floor for most models: a real quality trade, benchmarked on your own task.';
    return 'Aggressive: the grid is too coarse for most weights, and quality usually degrades visibly.';
  });

  protected snap(value: number): number {
    const levels = this.levels();
    let best = levels[0];
    for (const level of levels) {
      if (Math.abs(level - value) < Math.abs(best - value)) best = level;
    }
    return best;
  }

  protected x(index: number): number {
    return 24 + (index / (this.weights.length - 1)) * 358;
  }

  protected y(value: number): number {
    return 75 - value * 58;
  }
}

/* ---- Drift over time ------------------------------------------------------ */

/** A feature distribution sliding away from the one a model was trained on. */
@Component({
  selector: 'app-viz-drift',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 400 180" role="img" aria-label="A live feature distribution drifting away from the training distribution">
      <path [attr.d]="reference" fill="var(--info-soft)" stroke="var(--info)" stroke-width="1.4" />
      <path [attr.d]="live()" fill="var(--warn-soft)" stroke="var(--warn)" stroke-width="1.8" />

      <line x1="20" y1="145" x2="386" y2="145" stroke="var(--border)" />
      <text x="20" y="162" font-size="8" fill="var(--info)">training distribution</text>
      <text x="386" y="162" font-size="8" fill="var(--warn)" text-anchor="end">this week</text>
    </svg>

    <div class="readout">
      <span>week <b>{{ week() + 1 }}</b></span>
      <span>PSI <b>{{ psi().toFixed(3) }}</b></span>
      <span [style.color]="status().colour">{{ status().label }}</span>
    </div>

    <app-step-player
      [steps]="8"
      [interval]="1100"
      [caption]="caption()"
      (stepChange)="week.set($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
    }

    path {
      transition: d var(--dur) var(--ease);
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin: var(--sp-2) 0 var(--sp-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .readout b {
      color: var(--ink);
    }
  `,
})
export class DriftVisual {
  protected readonly week = signal(0);
  protected readonly reference = curve(0.38, 0.12);

  protected readonly live = computed(() => curve(0.38 + this.week() * 0.045, 0.12 + this.week() * 0.006));

  /** A stand-in for the population stability index, rising with the shift. */
  protected readonly psi = computed(() => (this.week() * 0.045 / 0.12) ** 2 * 0.55);

  protected readonly status = computed(() => {
    const psi = this.psi();
    if (psi < 0.1) return { label: 'stable', colour: 'var(--accent)' };
    if (psi < 0.25) return { label: 'watch', colour: 'var(--warn)' };
    return { label: 'drifted — investigate', colour: 'var(--danger)' };
  });

  protected readonly caption = computed(() => {
    const psi = this.psi();
    if (psi < 0.1) return 'Inputs match what the model was trained on.';
    if (psi < 0.25) return 'The distribution is moving. Worth an alert, not yet an incident.';
    return 'Well past the threshold: the model is scoring inputs it never saw in training.';
  });
}

function curve(mean: number, spread: number): string {
  const points: string[] = [];
  for (let x = 0; x <= 1.001; x += 0.02) {
    const y = Math.exp(-((x - mean) ** 2) / (2 * spread ** 2));
    points.push(`${(20 + x * 366).toFixed(1)},${(145 - y * 120).toFixed(1)}`);
  }
  return `M20,145 L${points.join(' L')} L386,145 Z`;
}
