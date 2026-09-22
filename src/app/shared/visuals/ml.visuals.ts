import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

/**
 * An editable confusion matrix.
 *
 * Every classification metric is a ratio of the same four counts, so letting
 * the reader move the counts and watch precision and recall pull in opposite
 * directions teaches the trade-off faster than the formulae do.
 */
@Component({
  selector: 'app-viz-confusion-matrix',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid-wrap">
      <table>
        <caption class="dim">Adjust any count. Metrics update immediately.</caption>
        <thead>
          <tr>
            <th></th>
            <th scope="col">Predicted positive</th>
            <th scope="col">Predicted negative</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Actually positive</th>
            <td>
              <label>
                <span>TP</span>
                <input type="number" min="0" [value]="tp()" (input)="set('tp', $event)" />
              </label>
            </td>
            <td>
              <label class="bad">
                <span>FN</span>
                <input type="number" min="0" [value]="fn()" (input)="set('fn', $event)" />
              </label>
            </td>
          </tr>
          <tr>
            <th scope="row">Actually negative</th>
            <td>
              <label class="bad">
                <span>FP</span>
                <input type="number" min="0" [value]="fp()" (input)="set('fp', $event)" />
              </label>
            </td>
            <td>
              <label>
                <span>TN</span>
                <input type="number" min="0" [value]="tn()" (input)="set('tn', $event)" />
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <ul class="metrics" role="list">
        @for (metric of metrics(); track metric.label) {
          <li>
            <span class="label">{{ metric.label }}</span>
            <span class="value">{{ metric.value }}</span>
            <span class="formula">{{ metric.formula }}</span>
          </li>
        }
      </ul>
    </div>

    <p class="note note-tip">{{ commentary() }}</p>

    <div class="presets">
      <span class="dim">Try:</span>
      <button type="button" class="chip" (click)="preset(40, 10, 60, 890)">rare positives</button>
      <button type="button" class="chip" (click)="preset(90, 40, 10, 860)">recall-first</button>
      <button type="button" class="chip" (click)="preset(45, 2, 55, 898)">precision-first</button>
      <button type="button" class="chip" (click)="preset(0, 0, 100, 900)">majority-class model</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .grid-wrap {
      display: grid;
      gap: var(--sp-5);
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      align-items: start;
    }

    @media (max-width: 760px) {
      .grid-wrap {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    table {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    caption {
      caption-side: bottom;
      text-align: left;
      padding-top: var(--sp-2);
    }

    th {
      font-size: var(--text-xs);
      font-weight: 600;
    }

    td {
      padding: var(--sp-2);
    }

    label {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }

    label span {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--accent);
      width: 1.6rem;
    }

    label.bad span {
      color: var(--danger);
    }

    input {
      width: 100%;
      min-width: 0;
      border: 1px solid var(--border);
      background: var(--bg-soft);
      border-radius: var(--radius-sm);
      padding: 0.3rem 0.4rem;
      font-family: var(--font-mono);
      font-size: var(--text-sm);
    }

    input:focus {
      border-color: var(--accent-line);
      outline: none;
    }

    .metrics {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.35rem;
    }

    .metrics li {
      display: grid;
      grid-template-columns: 5.5rem 3.8rem 1fr;
      gap: var(--sp-2);
      align-items: baseline;
      padding: 0.3rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--surface-2);
      margin: 0;
    }

    .label {
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .value {
      font-family: var(--font-mono);
      font-weight: 500;
      color: var(--accent);
    }

    .formula {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--ink-3);
    }

    .note {
      margin-top: var(--sp-4);
    }

    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      align-items: center;
      margin-top: var(--sp-4);
    }
  `,
})
export class ConfusionMatrixVisual {
  protected readonly tp = signal(40);
  protected readonly fp = signal(10);
  protected readonly fn = signal(60);
  protected readonly tn = signal(890);

  protected readonly metrics = computed(() => {
    const [tp, fp, fn, tn] = [this.tp(), this.fp(), this.fn(), this.tn()];
    const precision = safe(tp, tp + fp);
    const recall = safe(tp, tp + fn);

    return [
      { label: 'Accuracy', value: fmt(safe(tp + tn, tp + tn + fp + fn)), formula: '(TP+TN)/all' },
      { label: 'Precision', value: fmt(precision), formula: 'TP/(TP+FP)' },
      { label: 'Recall', value: fmt(recall), formula: 'TP/(TP+FN)' },
      {
        label: 'F1',
        value: fmt(precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)),
        formula: '2PR/(P+R)',
      },
      { label: 'Specificity', value: fmt(safe(tn, tn + fp)), formula: 'TN/(TN+FP)' },
      { label: 'FPR', value: fmt(safe(fp, fp + tn)), formula: 'FP/(FP+TN)' },
    ];
  });

  protected readonly commentary = computed(() => {
    const [tp, fp, fn, tn] = [this.tp(), this.fp(), this.fn(), this.tn()];
    const total = tp + fp + fn + tn;
    const positives = tp + fn;
    const accuracy = safe(tp + tn, total);
    const recall = safe(tp, positives);
    const precision = safe(tp, tp + fp);

    if (positives === 0) return 'No actual positives at all — recall is undefined and accuracy is meaningless.';
    if (tp === 0) return `This model finds nothing, and still scores ${fmt(accuracy)} accuracy. That is the imbalance trap in one number.`;
    if (positives / total < 0.05 && accuracy > 0.9 && recall < 0.6)
      return `Accuracy ${fmt(accuracy)} looks strong, but recall is only ${fmt(recall)} — on rare positives, accuracy measures the base rate rather than the model.`;
    if (precision > 0.9 && recall < 0.5)
      return 'High precision, low recall: almost every alert is real, and most real cases are missed. Lower the threshold if misses cost more than false alarms.';
    if (recall > 0.9 && precision < 0.5)
      return 'High recall, low precision: nearly everything is caught, at the cost of a flood of false alarms. Raise the threshold if review capacity is the constraint.';
    return 'Reasonably balanced. Which side you would rather err on is a business decision, not a modelling one.';
  });

  protected set(field: 'tp' | 'fp' | 'fn' | 'tn', event: Event): void {
    const value = Math.max(0, Math.round(Number((event.target as HTMLInputElement).value) || 0));
    this[field].set(value);
  }

  protected preset(tp: number, fp: number, fn: number, tn: number): void {
    this.tp.set(tp);
    this.fp.set(fp);
    this.fn.set(fn);
    this.tn.set(tn);
  }
}

function safe(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function fmt(value: number): string {
  return value.toFixed(3);
}

interface Split {
  label: string;
  /** Vertical cut position, as a fraction of the width. */
  x?: number;
  /** Horizontal cut position, as a fraction of the height. */
  y?: number;
}

const SPLITS: Split[] = [
  { label: 'Root: no split yet' },
  { label: 'tenure < 12 months', x: 0.45 },
  { label: '+ spend > 60', x: 0.45, y: 0.5 },
];

const POINTS = [
  { x: 0.12, y: 0.22, positive: true },
  { x: 0.2, y: 0.42, positive: true },
  { x: 0.3, y: 0.18, positive: true },
  { x: 0.18, y: 0.72, positive: false },
  { x: 0.33, y: 0.83, positive: false },
  { x: 0.58, y: 0.28, positive: true },
  { x: 0.74, y: 0.2, positive: false },
  { x: 0.84, y: 0.37, positive: false },
  { x: 0.62, y: 0.68, positive: false },
  { x: 0.79, y: 0.79, positive: false },
  { x: 0.9, y: 0.6, positive: false },
  { x: 0.5, y: 0.9, positive: false },
];

/** How a tree carves the feature space into rectangles, one split at a time. */
@Component({
  selector: 'app-viz-tree-splits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      @for (split of splits; track split.label; let i = $index) {
        <button type="button" class="chip" [attr.aria-pressed]="depth() === i" (click)="depth.set(i)">
          {{ i === 0 ? 'Depth 0' : 'Depth ' + i }}
        </button>
      }
      <span class="dim">{{ splits[depth()].label }}</span>
    </div>

    <svg viewBox="0 0 320 210" role="img" aria-label="Decision tree splits over a two-feature space">
      <rect x="20" y="10" width="280" height="180" fill="var(--bg-soft)" stroke="var(--border)" />

      @if (depth() >= 1) {
        <line
          [attr.x1]="20 + 280 * 0.45"
          y1="10"
          [attr.x2]="20 + 280 * 0.45"
          y2="190"
          stroke="var(--accent)"
          stroke-width="1.6"
        />
      }
      @if (depth() >= 2) {
        <line
          [attr.x1]="20 + 280 * 0.45"
          [attr.y1]="10 + 180 * 0.5"
          x2="300"
          [attr.y2]="10 + 180 * 0.5"
          stroke="var(--accent)"
          stroke-width="1.6"
        />
      }

      @for (point of points; track $index) {
        <circle
          [attr.cx]="20 + 280 * point.x"
          [attr.cy]="10 + 180 * point.y"
          r="5"
          [attr.fill]="point.positive ? 'var(--accent)' : 'transparent'"
          [attr.stroke]="point.positive ? 'var(--accent)' : 'var(--ink-3)'"
          stroke-width="1.6"
        />
      }

      <text x="20" y="204" fill="var(--ink-3)" font-size="9">tenure →</text>
    </svg>

    <p class="dim">
      Each split is a single threshold on one feature, so the regions are always axis-aligned
      rectangles. A forest averages many such partitions; boosting adds them in sequence.
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

    svg {
      width: 100%;
      height: auto;
      max-width: 420px;
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class TreeSplitsVisual {
  protected readonly splits = SPLITS;
  protected readonly points = POINTS;
  protected readonly depth = signal(1);
}
