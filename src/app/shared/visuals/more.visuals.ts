import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepPlayer } from './step-player';

/* ---- The RLHF pipeline ----------------------------------------------------- */

/** Three stages, and the leash that stops the third wandering off. */
@Component({
  selector: 'app-viz-rlhf-pipeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 200" role="img" aria-label="The three stages of reinforcement learning from human feedback">
      @for (stage of stages; track stage.label; let i = $index) {
        <rect [attr.x]="22 + i * 130" y="40" width="112" height="58" rx="10"
          [attr.fill]="i <= step() ? 'var(--accent-soft)' : 'var(--surface-2)'"
          [attr.stroke]="i === step() ? 'var(--accent)' : 'var(--border-strong)'" stroke-width="1.5" />
        <text [attr.x]="78 + i * 130" y="62" font-size="9" font-weight="600"
          fill="var(--ink)" text-anchor="middle">{{ stage.label }}</text>
        <text [attr.x]="78 + i * 130" y="76" font-size="6.5" fill="var(--ink-3)" text-anchor="middle">
          {{ stage.input }}
        </text>
        <text [attr.x]="78 + i * 130" y="88" font-size="6.5" fill="var(--ink-3)" text-anchor="middle">
          {{ stage.output }}
        </text>

        @if (i < 2) {
          <path [attr.d]="'M' + (134 + i * 130) + ' 69 H' + (152 + i * 130)"
            stroke-width="1.6" fill="none"
            [attr.stroke]="i < step() ? 'var(--accent)' : 'var(--border)'" />
        }
      }

      <text x="22" y="26" font-size="8" font-weight="600" fill="var(--ink-2)">
        preferences are easy to compare and hard to write
      </text>

      @if (step() >= 2) {
        <path d="M78 110 V132 H338 V104" fill="none" stroke="var(--warn)" stroke-width="1.6"
          stroke-dasharray="4 3" />
        <text x="208" y="148" font-size="8" fill="var(--warn)" text-anchor="middle">
          KL penalty — stay close to the supervised model
        </text>
        <text x="208" y="164" font-size="7" fill="var(--ink-3)" text-anchor="middle">
          without it the policy drifts into text that scores well and reads badly
        </text>
      }
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1900"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    rect, path { transition: fill var(--dur) var(--ease), stroke var(--dur) var(--ease); }
  `,
})
export class RlhfPipelineVisual {
  protected readonly step = signal(0);

  protected readonly stages = [
    { label: 'Supervised', input: 'demonstrations', output: 'answers, not continuations' },
    { label: 'Reward model', input: 'ranked pairs', output: 'a score for any answer' },
    { label: 'Policy tuning', input: 'the reward model', output: 'a model that scores well' },
  ];

  protected readonly captions = [
    'First, demonstrations teach the shape of an answer. This sets the format, not the quality bar.',
    'Then humans rank pairs of responses, and a reward model learns to score them. Comparing is reliable; scoring out of ten is not.',
    'Finally the policy is tuned to score highly — with a KL penalty holding it near the supervised model, or it finds text that games the reward.',
  ];
}

/* ---- Logistic regression --------------------------------------------------- */

/** A linear score squashed into a probability, then cut by a threshold. */
@Component({
  selector: 'app-viz-sigmoid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 200" role="img" aria-label="A linear score passed through a sigmoid and cut by a threshold">
      <line x1="40" y1="160" x2="390" y2="160" stroke="var(--border-strong)" stroke-width="1" />
      <line x1="215" y1="24" x2="215" y2="166" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 3" />
      <text x="215" y="178" font-size="7" fill="var(--ink-3)" text-anchor="middle">score = w·x + b = 0</text>

      @if (step() >= 1) {
        <line x1="40" y1="92" x2="390" y2="92" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 3" />
        <text x="34" y="95" font-size="7" fill="var(--ink-3)" text-anchor="end">0.5</text>
        <text x="34" y="34" font-size="7" fill="var(--ink-3)" text-anchor="end">1.0</text>
        <text x="34" y="163" font-size="7" fill="var(--ink-3)" text-anchor="end">0.0</text>
      }

      @if (step() === 0) {
        <polyline [attr.points]="line" fill="none" stroke="var(--ink-3)" stroke-width="1.6"
          stroke-dasharray="4 3" />
        <text x="46" y="38" font-size="7" fill="var(--ink-3)">score runs off the scale in both directions</text>
      } @else {
        <polyline [attr.points]="curve" fill="none" stroke="var(--accent)" stroke-width="2" />
      }

      @if (step() >= 2) {
        <line x1="40" [attr.y1]="thresholdY()" x2="390" [attr.y2]="thresholdY()"
          stroke="var(--warn)" stroke-width="1.6" stroke-dasharray="5 3" />
        <text x="394" [attr.y]="thresholdY() - 4" font-size="7" fill="var(--warn)" text-anchor="end">
          threshold {{ threshold.toFixed(2) }}
        </text>
      }

      @for (p of points; track $index) {
        <circle [attr.cx]="p.x" [attr.cy]="pointY(p)" r="3.4"
          [attr.fill]="step() >= 2 ? (p.prob >= threshold ? 'var(--accent)' : 'var(--ink-3)') : 'var(--ink-3)'"
          opacity="0.85" />
      }

      <text x="40" y="18" font-size="8" fill="var(--ink-3)">
        {{ step() === 0 ? 'raw linear score' : 'probability of the positive class' }}
      </text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="1700"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    circle { transition: cy var(--dur-slow) var(--ease-out), fill var(--dur) var(--ease); }
    line, polyline { transition: opacity var(--dur) var(--ease); }
  `,
})
export class SigmoidVisual {
  protected readonly step = signal(0);
  protected readonly threshold = 0.5;

  protected readonly captions = [
    'A linear model produces an unbounded score. It is not a probability — it can be 7, or −3.',
    'The sigmoid squashes any score into (0, 1). Now it reads as a probability, and the model is trained on that.',
    'A class only appears when you pick a threshold. 0.5 is a default, not a law — move it and precision and recall trade off.',
  ];

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  protected readonly curve = Array.from({ length: 80 }, (_, i) => {
    const x = 40 + (i / 79) * 350;
    const z = ((x - 215) / 350) * 14;
    const y = 160 - this.sigmoid(z) * 128;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  protected readonly points = Array.from({ length: 26 }, (_, i) => {
    const x = 52 + ((Math.sin(i * 9.17) + 1) / 2) * 326;
    const z = ((x - 215) / 350) * 14;
    return { x, z, prob: this.sigmoid(z) };
  });

  /**
   * Before the squash the points sit on the raw linear score, which runs well
   * outside the 0-1 band. That mismatch is the thing the sigmoid fixes, so the
   * figure has to show it rather than start with the answer.
   */
  protected pointY(p: { z: number; prob: number }): number {
    if (this.step() === 0) return 92 - p.z * 11;
    return 160 - p.prob * 128;
  }

  /** The unbounded score, clipped by the viewBox on purpose. */
  protected readonly line = Array.from({ length: 2 }, (_, i) => {
    const x = i === 0 ? 40 : 390;
    const z = ((x - 215) / 350) * 14;
    return `${x},${(92 - z * 11).toFixed(1)}`;
  }).join(' ');

  protected thresholdY(): number {
    return 160 - this.threshold * 128;
  }
}

/* ---- What RMSE punishes that MAE does not ---------------------------------- */

/** One point drifts away; RMSE climbs far faster than MAE. */
@Component({
  selector: 'app-viz-metric-sensitivity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 200" role="img" aria-label="RMSE rising faster than MAE as one error grows">
      <line x1="40" y1="150" x2="250" y2="150" stroke="var(--border-strong)" />
      <text x="40" y="166" font-size="7" fill="var(--ink-3)">ten predictions, one drifting</text>

      @for (e of errors(); track $index; let i = $index) {
        <rect [attr.x]="46 + i * 20" [attr.y]="150 - e * 5" width="13" [attr.height]="e * 5" rx="2"
          [attr.fill]="i === 9 ? 'var(--danger)' : 'var(--ink-3)'"
          [attr.opacity]="i === 9 ? 0.9 : 0.5" />
      }

      <text x="286" y="40" font-size="8" fill="var(--ink-3)">MAE</text>
      <rect x="286" y="48" width="110" height="14" rx="3" fill="var(--surface-3)" />
      <rect x="286" y="48" [attr.width]="maeBar()" height="14" rx="3" fill="var(--info)" />
      <text x="396" y="76" font-size="9" font-weight="700" fill="var(--info)" text-anchor="end"
        font-family="var(--font-mono)">{{ mae().toFixed(1) }}</text>

      <text x="286" y="104" font-size="8" fill="var(--ink-3)">RMSE</text>
      <rect x="286" y="112" width="110" height="14" rx="3" fill="var(--surface-3)" />
      <rect x="286" y="112" [attr.width]="rmseBar()" height="14" rx="3" fill="var(--danger)" />
      <text x="396" y="140" font-size="9" font-weight="700" fill="var(--danger)" text-anchor="end"
        font-family="var(--font-mono)">{{ rmse().toFixed(1) }}</text>

      <text x="286" y="166" font-size="7" fill="var(--ink-3)">squaring makes one</text>
      <text x="286" y="176" font-size="7" fill="var(--ink-3)">big miss dominate</text>
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
    rect { transition: width var(--dur) var(--ease), height var(--dur) var(--ease); }
  `,
})
export class MetricSensitivityVisual {
  protected readonly step = signal(0);

  protected readonly captions = [
    'Ten predictions, all off by a little. MAE and RMSE agree.',
    'One prediction starts to drift. MAE moves a little.',
    'It drifts further. RMSE is pulling away — squaring weights the large error far more heavily.',
    'One bad miss now dominates RMSE while MAE barely notices. Which behaviour you want is a property of the problem, not of the metric.',
  ];

  private readonly base = [2, 1, 3, 2, 1, 2, 3, 1, 2];

  protected readonly errors = computed(() => [...this.base, [2, 6, 12, 20][this.step()]]);

  protected readonly mae = computed(
    () => this.errors().reduce((s, e) => s + e, 0) / this.errors().length,
  );

  protected readonly rmse = computed(() =>
    Math.sqrt(this.errors().reduce((s, e) => s + e * e, 0) / this.errors().length),
  );

  protected maeBar(): number {
    return Math.min(110, (this.mae() / 12) * 110);
  }

  protected rmseBar(): number {
    return Math.min(110, (this.rmse() / 12) * 110);
  }
}