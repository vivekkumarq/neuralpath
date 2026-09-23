import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepPlayer } from './step-player';

/* ---- Forward pass and backpropagation ------------------------------------ */

const NET = [3, 4, 4, 2];

const BACKPROP_STEPS = [
  'Input arrives at the first layer.',
  'Layer 1 computes its weighted sums and activations.',
  'Layer 2 does the same on layer 1’s output.',
  'The output layer produces a prediction, and the loss is measured against the label.',
  'The gradient of the loss flows back into the output layer.',
  'Each earlier layer receives its share through the chain rule.',
  'Every weight is nudged against its gradient, and the next batch begins.',
];

/**
 * Forward pass then backward pass, one layer at a time.
 *
 * The point of the figure is the direction change at step four: the same graph
 * is traversed in reverse, which is all backpropagation is.
 */
@Component({
  selector: 'app-viz-backprop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 400 190" role="img" aria-label="A forward pass followed by backpropagation">
      @for (layer of layers; track $index; let li = $index) {
        @if (li > 0) {
          @for (unit of layer; track $index; let ui = $index) {
            @for (prev of layers[li - 1]; track $index; let pi = $index) {
              <line
                [attr.x1]="cx(li - 1)"
                [attr.y1]="cy(pi, layers[li - 1].length)"
                [attr.x2]="cx(li)"
                [attr.y2]="cy(ui, layer.length)"
                [attr.stroke]="edgeColour(li)"
                [attr.stroke-width]="edgeActive(li) ? 1.6 : 0.5"
                [attr.opacity]="edgeActive(li) ? 0.9 : 0.25"
              />
            }
          }
        }
      }

      @for (layer of layers; track $index; let li = $index) {
        @for (unit of layer; track $index; let ui = $index) {
          <circle
            [attr.cx]="cx(li)"
            [attr.cy]="cy(ui, layer.length)"
            [attr.r]="nodeActive(li) ? 9 : 7"
            [attr.fill]="nodeFill(li)"
            [attr.stroke]="nodeStroke(li)"
            stroke-width="1.5"
          />
        }
      }

      @if (step() >= 3) {
        <g>
          <rect x="336" y="72" width="56" height="44" rx="8" fill="var(--surface-2)" [attr.stroke]="step() >= 4 ? 'var(--warn)' : 'var(--border-strong)'" />
          <text x="364" y="90" font-size="8" fill="var(--ink-3)" text-anchor="middle">loss</text>
          <text x="364" y="104" font-size="11" [attr.fill]="step() >= 4 ? 'var(--warn)' : 'var(--ink)'" text-anchor="middle">
            {{ loss() }}
          </text>
        </g>
      }

      <text x="14" y="182" font-size="8" [attr.fill]="backward() ? 'var(--warn)' : 'var(--accent)'">
        {{ backward() ? '← gradients' : 'activations →' }}
      </text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1600"
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

    circle,
    line {
      transition:
        fill var(--dur) var(--ease),
        stroke var(--dur) var(--ease),
        opacity var(--dur) var(--ease);
    }
  `,
})
export class BackpropVisual {
  protected readonly captions = BACKPROP_STEPS;
  protected readonly step = signal(0);
  protected readonly layers = NET.map((count) => Array.from({ length: count }, (_, i) => i));

  protected readonly backward = computed(() => this.step() >= 4);
  protected readonly loss = computed(() => (this.step() >= 6 ? '0.41' : '0.68'));

  protected cx(layer: number): number {
    return 40 + layer * 95;
  }

  protected cy(unit: number, count: number): number {
    const spacing = 150 / (count + 1);
    return 12 + spacing * (unit + 1);
  }

  /** Which layer the pass is currently touching, forward or backward. */
  private active(): number {
    const step = this.step();
    if (step <= 3) return step;
    return 3 - (step - 3);
  }

  protected nodeActive(layer: number): boolean {
    return layer === this.active();
  }

  protected nodeFill(layer: number): string {
    if (layer !== this.active()) return 'var(--surface-2)';
    return this.backward() ? 'var(--warn)' : 'var(--accent)';
  }

  protected nodeStroke(layer: number): string {
    if (layer !== this.active()) return 'var(--border-strong)';
    return this.backward() ? 'var(--warn)' : 'var(--accent)';
  }

  protected edgeActive(toLayer: number): boolean {
    return this.backward() ? toLayer === this.active() + 1 : toLayer === this.active();
  }

  protected edgeColour(toLayer: number): string {
    if (!this.edgeActive(toLayer)) return 'var(--border)';
    return this.backward() ? 'var(--warn)' : 'var(--accent)';
  }
}

/* ---- Training curve: the moment validation turns ------------------------- */

const EPOCHS = 24;

function trainLoss(epoch: number): number {
  return 0.92 * Math.exp(-epoch / 6) + 0.04;
}

function valLoss(epoch: number): number {
  // Falls with training, then rises as the model starts memorising.
  return 0.9 * Math.exp(-epoch / 5.5) + 0.12 + Math.max(0, (epoch - 9) * 0.022);
}

/** Training against validation loss, drawn epoch by epoch. */
@Component({
  selector: 'app-viz-training-curve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 400 200" role="img" aria-label="Training and validation loss across epochs">
      <line x1="34" y1="170" x2="386" y2="170" stroke="var(--border)" />
      <line x1="34" y1="14" x2="34" y2="170" stroke="var(--border)" />

      @if (epoch() >= best) {
        <line [attr.x1]="px(best)" y1="14" [attr.x2]="px(best)" y2="170" stroke="var(--accent-line)" stroke-dasharray="3 4" />
        <text [attr.x]="px(best) + 4" y="26" font-size="8" fill="var(--accent)">early stop</text>
      }

      <path [attr.d]="trainPath()" fill="none" stroke="var(--info)" stroke-width="2" />
      <path [attr.d]="valPath()" fill="none" stroke="var(--warn)" stroke-width="2" />

      <circle [attr.cx]="px(epoch())" [attr.cy]="py(train(epoch()))" r="4" fill="var(--info)" />
      <circle [attr.cx]="px(epoch())" [attr.cy]="py(val(epoch()))" r="4" fill="var(--warn)" />

      <text x="40" y="24" font-size="8" fill="var(--ink-3)">loss</text>
      <text x="382" y="186" font-size="8" fill="var(--ink-3)" text-anchor="end">epochs</text>
    </svg>

    <div class="readout">
      <span style="color: var(--info)">train <b>{{ train(epoch()).toFixed(3) }}</b></span>
      <span style="color: var(--warn)">validation <b>{{ val(epoch()).toFixed(3) }}</b></span>
      <span>epoch <b>{{ epoch() + 1 }}</b></span>
    </div>

    <app-step-player
      [steps]="epochs"
      [interval]="420"
      [caption]="verdict()"
      (stepChange)="epoch.set($event)"
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

    .readout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin: var(--sp-2) 0 var(--sp-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-2);
    }
  `,
})
export class TrainingCurveVisual {
  protected readonly epochs = EPOCHS;
  protected readonly epoch = signal(0);
  /** The epoch after which validation loss stops improving. */
  protected readonly best = 9;

  protected readonly verdict = computed(() => {
    const epoch = this.epoch();
    if (epoch < 4) return 'Both falling — the model is learning the pattern.';
    if (epoch < this.best) return 'Still improving on data it has never seen.';
    if (epoch < this.best + 4) return 'Validation flattens. This is where to stop.';
    return 'Training keeps falling, validation rises: memorisation, not learning.';
  });

  protected readonly trainPath = computed(() => this.trace(trainLoss));
  protected readonly valPath = computed(() => this.trace(valLoss));

  protected train = trainLoss;
  protected val = valLoss;

  protected px(epoch: number): number {
    return 34 + (epoch / (EPOCHS - 1)) * 352;
  }

  protected py(loss: number): number {
    return 170 - Math.min(loss, 1) * 156;
  }

  private trace(fn: (epoch: number) => number): string {
    const points: string[] = [];
    for (let e = 0; e <= this.epoch(); e++) {
      points.push(`${this.px(e).toFixed(1)},${this.py(fn(e)).toFixed(1)}`);
    }
    return points.length > 1 ? `M${points.join(' L')}` : '';
  }
}

/* ---- K-means iterations --------------------------------------------------- */

interface Point {
  x: number;
  y: number;
}

/** Three loose blobs, deterministic so the figure is stable between visits. */
const CLUSTER_POINTS: Point[] = [
  ...blob(0.24, 0.28, 9, 1),
  ...blob(0.72, 0.3, 9, 2),
  ...blob(0.5, 0.76, 9, 3),
];

function blob(cx: number, cy: number, count: number, seed: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 12345.6789;
    return {
      x: cx + ((a - Math.floor(a)) - 0.5) * 0.28,
      y: cy + ((b - Math.floor(b)) - 0.5) * 0.28,
    };
  });
}

const START_CENTROIDS: Point[] = [
  { x: 0.3, y: 0.62 },
  { x: 0.42, y: 0.34 },
  { x: 0.62, y: 0.6 },
];

/**
 * K-means, iteration by iteration: assign, move, repeat.
 *
 * Centroids are recomputed live rather than hard-coded, so the figure really is
 * the algorithm and not a drawing of it.
 */
@Component({
  selector: 'app-viz-kmeans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 320 230" role="img" aria-label="K-means clustering across iterations">
      <rect x="10" y="10" width="300" height="210" rx="8" fill="var(--bg-soft)" stroke="var(--border)" />

      @for (point of points; track $index; let i = $index) {
        <circle
          [attr.cx]="px(point.x)"
          [attr.cy]="py(point.y)"
          r="4"
          [attr.fill]="iteration() === 0 ? 'var(--surface-3)' : colour(assignment()[i])"
          [attr.stroke]="iteration() === 0 ? 'var(--border-strong)' : colour(assignment()[i])"
          stroke-width="1.2"
          opacity="0.9"
        />
      }

      @for (centroid of centroids(); track $index; let c = $index) {
        <g>
          <circle
            [attr.cx]="px(centroid.x)"
            [attr.cy]="py(centroid.y)"
            r="9"
            fill="none"
            [attr.stroke]="colour(c)"
            stroke-width="1.6"
            opacity="0.5"
          />
          <path
            [attr.d]="cross(centroid)"
            [attr.stroke]="colour(c)"
            stroke-width="2"
            stroke-linecap="round"
          />
        </g>
      }
    </svg>

    <app-step-player
      [steps]="6"
      [interval]="1500"
      [caption]="caption()"
      (stepChange)="iteration.set($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
      max-width: 440px;
      margin-bottom: var(--sp-3);
    }

    circle,
    path {
      transition:
        cx var(--dur) var(--ease),
        cy var(--dur) var(--ease),
        fill var(--dur) var(--ease),
        d var(--dur) var(--ease);
    }
  `,
})
export class KMeansVisual {
  protected readonly points = CLUSTER_POINTS;
  protected readonly iteration = signal(0);

  private readonly palette = ['var(--accent)', 'var(--info)', 'var(--warn)'];

  /** Centroid positions after `iteration` rounds of assign-and-move. */
  protected readonly centroids = computed(() => {
    let centroids = START_CENTROIDS;
    for (let round = 0; round < this.iteration(); round++) {
      const assigned = assign(this.points, centroids);
      centroids = centroids.map((centroid, index) => {
        const members = this.points.filter((_, i) => assigned[i] === index);
        if (members.length === 0) return centroid;
        return {
          x: members.reduce((sum, p) => sum + p.x, 0) / members.length,
          y: members.reduce((sum, p) => sum + p.y, 0) / members.length,
        };
      });
    }
    return centroids;
  });

  protected readonly assignment = computed(() => assign(this.points, this.centroids()));

  protected readonly caption = computed(() => {
    const round = this.iteration();
    if (round === 0) return 'Centroids start at arbitrary positions.';
    if (round === 1) return 'Each point joins its nearest centroid.';
    if (round < 4) return `Round ${round}: centroids move to the mean of their members.`;
    return 'Converged — assignments stop changing.';
  });

  protected colour(index: number): string {
    return this.palette[index] ?? 'var(--ink-3)';
  }

  protected px(x: number): number {
    return 20 + x * 280;
  }

  protected py(y: number): number {
    return 20 + y * 190;
  }

  protected cross(point: Point): string {
    const x = this.px(point.x);
    const y = this.py(point.y);
    return `M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`;
  }
}

function assign(points: Point[], centroids: Point[]): number[] {
  return points.map((point) => {
    let best = 0;
    let bestDistance = Infinity;
    centroids.forEach((centroid, index) => {
      const distance = (point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  });
}

/* ---- Threshold, precision and recall -------------------------------------- */

/** Two score distributions that overlap, as real ones do. */
const NEGATIVES = bell(0.32, 0.13, 220);
const POSITIVES = bell(0.68, 0.15, 60);

function bell(mean: number, spread: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const u = (i + 0.5) / count;
    // Inverse-ish normal shape, deterministic and good enough for a figure.
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * ((i * 0.618) % 1));
    return Math.min(0.999, Math.max(0.001, mean + z * spread));
  });
}

/**
 * The threshold dial: one slider that moves precision and recall in opposite
 * directions, over two overlapping score distributions.
 */
@Component({
  selector: 'app-viz-threshold',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="control">
      <label for="thr">Decision threshold <b>{{ threshold().toFixed(2) }}</b></label>
      <input
        id="thr"
        type="range"
        min="0.05"
        max="0.95"
        step="0.01"
        [value]="threshold()"
        (input)="set($event)"
      />
    </div>

    <svg viewBox="0 0 400 170" role="img" aria-label="Score distributions either side of a decision threshold">
      <path [attr.d]="negPath" fill="var(--info-soft)" stroke="var(--info)" stroke-width="1.4" />
      <path [attr.d]="posPath" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.4" />

      <line [attr.x1]="tx()" y1="12" [attr.x2]="tx()" y2="140" stroke="var(--ink)" stroke-width="1.6" />
      <text [attr.x]="tx()" y="8" font-size="8" fill="var(--ink-2)" text-anchor="middle">threshold</text>

      <line x1="20" y1="140" x2="386" y2="140" stroke="var(--border)" />
      <text x="20" y="156" font-size="8" fill="var(--ink-3)">predicted negative</text>
      <text x="386" y="156" font-size="8" fill="var(--ink-3)" text-anchor="end">predicted positive</text>
    </svg>

    <ul class="metrics" role="list">
      @for (metric of metrics(); track metric.label) {
        <li>
          <span>{{ metric.label }}</span>
          <span class="bar"><span [style.width.%]="metric.value * 100"></span></span>
          <b>{{ metric.value.toFixed(3) }}</b>
        </li>
      }
    </ul>

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
      max-width: 320px;
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

    .metrics {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.3rem;
      max-width: 420px;
      margin-top: var(--sp-3);
    }

    .metrics li {
      margin: 0;
      display: grid;
      grid-template-columns: 5rem 1fr 3.2rem;
      gap: var(--sp-3);
      align-items: center;
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .bar {
      height: 8px;
      border-radius: 99px;
      background: var(--surface-3);
      overflow: hidden;
    }

    .bar > span {
      display: block;
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width var(--dur) var(--ease);
    }

    .metrics b {
      font-family: var(--font-mono);
      color: var(--accent);
      text-align: right;
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class ThresholdVisual {
  protected readonly threshold = signal(0.5);

  protected readonly negPath = this.curve(NEGATIVES, 0.32, 0.13);
  protected readonly posPath = this.curve(POSITIVES, 0.68, 0.15);

  protected readonly counts = computed(() => {
    const t = this.threshold();
    const tp = POSITIVES.filter((score) => score >= t).length;
    const fn = POSITIVES.length - tp;
    const fp = NEGATIVES.filter((score) => score >= t).length;
    const tn = NEGATIVES.length - fp;
    return { tp, fn, fp, tn };
  });

  protected readonly metrics = computed(() => {
    const { tp, fn, fp, tn } = this.counts();
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    return [
      { label: 'Precision', value: precision },
      { label: 'Recall', value: recall },
      {
        label: 'F1',
        value: precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall),
      },
      { label: 'Accuracy', value: (tp + tn) / (tp + tn + fp + fn) },
    ];
  });

  protected readonly verdict = computed(() => {
    const t = this.threshold();
    const { fp, fn } = this.counts();
    if (t < 0.3) return `Low threshold: almost every positive is caught, at ${fp} false alarms.`;
    if (t > 0.75) return `High threshold: alerts are nearly all real, but ${fn} positives are missed.`;
    return `Balanced: ${fp} false alarms against ${fn} misses. Which is worse is a business question.`;
  });

  protected tx(): number {
    return 20 + this.threshold() * 366;
  }

  protected set(event: Event): void {
    this.threshold.set(Number((event.target as HTMLInputElement).value));
  }

  /** A filled bell outline for a distribution, in view coordinates. */
  private curve(_scores: number[], mean: number, spread: number): string {
    const points: string[] = [];
    for (let x = 0; x <= 1.001; x += 0.02) {
      const y = Math.exp(-((x - mean) ** 2) / (2 * spread ** 2));
      points.push(`${(20 + x * 366).toFixed(1)},${(140 - y * 120).toFixed(1)}`);
    }
    return `M20,140 L${points.join(' L')} L386,140 Z`;
  }
}
