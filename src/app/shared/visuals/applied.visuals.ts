import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { StepPlayer } from './step-player';

/* ---- The reinforcement learning loop -------------------------------------- */

/**
 * Agent and environment exchanging action, state and reward.
 *
 * The point the figure has to make is that the reward arrives *after* the
 * action and often long after the action that caused it, so the running return
 * is shown accumulating while the agent keeps acting.
 */
@Component({
  selector: 'app-viz-mdp-loop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 210" role="img" aria-label="An agent acting in an environment and receiving reward">
      <rect x="24" y="62" width="110" height="56" rx="10"
        [attr.fill]="lit('agent') ? 'var(--accent-soft)' : 'var(--surface-2)'"
        [attr.stroke]="lit('agent') ? 'var(--accent)' : 'var(--border-strong)'" stroke-width="1.5" />
      <text x="79" y="86" font-size="11" font-weight="600" fill="var(--ink)" text-anchor="middle">Agent</text>
      <text x="79" y="102" font-size="7.5" fill="var(--ink-3)" text-anchor="middle">policy π(a|s)</text>

      <rect x="286" y="62" width="110" height="56" rx="10"
        [attr.fill]="lit('env') ? 'var(--accent-soft)' : 'var(--surface-2)'"
        [attr.stroke]="lit('env') ? 'var(--accent)' : 'var(--border-strong)'" stroke-width="1.5" />
      <text x="341" y="86" font-size="11" font-weight="600" fill="var(--ink)" text-anchor="middle">Environment</text>
      <text x="341" y="102" font-size="7.5" fill="var(--ink-3)" text-anchor="middle">transition + reward</text>

      <!-- action, agent to environment -->
      <path d="M134 78 H286" fill="none" stroke-width="1.8" marker-end="url(#mdp-arrow)"
        [attr.stroke]="lit('action') ? 'var(--accent)' : 'var(--border)'" />
      <text x="210" y="70" font-size="8" text-anchor="middle"
        [attr.fill]="lit('action') ? 'var(--accent)' : 'var(--ink-3)'">action a{{ sub }}</text>

      <!-- state and reward, environment back to agent -->
      <path d="M286 104 H134" fill="none" stroke-width="1.8" marker-end="url(#mdp-arrow)"
        [attr.stroke]="lit('back') ? 'var(--info)' : 'var(--border)'" />
      <text x="210" y="118" font-size="8" text-anchor="middle"
        [attr.fill]="lit('back') ? 'var(--info)' : 'var(--ink-3)'">state s′, reward r</text>

      <defs>
        <marker id="mdp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)" />
        </marker>
      </defs>

      <!-- the rewards collected so far -->
      <text x="24" y="156" font-size="8" fill="var(--ink-3)">reward received each step</text>
      @for (r of rewards; track $index; let i = $index) {
        <rect [attr.x]="24 + i * 30" [attr.y]="190 - bar(i)" width="20" [attr.rx]="3"
          [attr.height]="bar(i)"
          [attr.fill]="i < collected() ? (r > 0 ? 'var(--accent)' : 'var(--danger)') : 'var(--surface-3)'"
          [attr.opacity]="i < collected() ? 1 : 0.5" />
        <text [attr.x]="34 + i * 30" y="202" font-size="6.5" fill="var(--ink-3)" text-anchor="middle">
          {{ i < collected() ? r : '·' }}
        </text>
      }

      <text x="300" y="166" font-size="8" fill="var(--ink-3)">return so far</text>
      <text x="300" y="186" font-size="18" font-weight="700" fill="var(--accent)"
        font-family="var(--font-mono)">{{ total() }}</text>
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
    rect, path, text { transition: fill var(--dur) var(--ease), stroke var(--dur) var(--ease); }
  `,
})
export class MdpLoopVisual {
  protected readonly sub = '\u209C';
  protected readonly rewards = [0, 0, -1, 0, 2, 0, 5];
  protected readonly step = signal(0);

  protected readonly captions = [
    'The agent observes the current state.',
    'It chooses an action from its policy.',
    'The environment moves to a new state and returns a reward — here, nothing.',
    'Another action. Still no reward; nothing says whether this was a good move.',
    'A penalty arrives. Which earlier action caused it is not stated — that is the credit assignment problem.',
    'More acting. The agent is accumulating experience, not instructions.',
    'A large reward lands at the end. Learning means spreading its credit back over the actions that led here.',
  ];

  protected readonly collected = computed(() => Math.min(this.step() + 1, this.rewards.length));

  protected readonly total = computed(() =>
    this.rewards.slice(0, this.collected()).reduce((sum, r) => sum + r, 0),
  );

  protected lit(part: 'agent' | 'env' | 'action' | 'back'): boolean {
    const phase = this.step() % 2;
    if (part === 'agent' || part === 'action') return phase === 0;
    return phase === 1;
  }

  protected bar(index: number): number {
    const r = this.rewards[index];
    return Math.max(3, Math.abs(r) * 6 + 3);
  }
}

/* ---- Time series decomposition -------------------------------------------- */

const N = 48;

/** Observed = trend + seasonality + residual, revealed one component at a time. */
@Component({
  selector: 'app-viz-decomposition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 232" role="img" aria-label="A time series split into trend, seasonality and residual">
      @for (row of rows; track row.label; let r = $index) {
        <text x="4" [attr.y]="r * 54 + 22" font-size="8" font-weight="600"
          [attr.fill]="r <= step() ? 'var(--ink-2)' : 'var(--ink-3)'">{{ row.label }}</text>
        <text x="4" [attr.y]="r * 54 + 33" font-size="6.5" fill="var(--ink-3)">{{ row.note }}</text>

        <line x1="92" [attr.y1]="r * 54 + 46" x2="414" [attr.y2]="r * 54 + 46"
          stroke="var(--border)" stroke-width="1" stroke-dasharray="2 3" />

        @if (r <= step()) {
          <polyline [attr.points]="row.points" fill="none" stroke-width="1.6"
            [attr.stroke]="row.colour" />
        }
      }
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
  `,
})
export class DecompositionVisual {
  protected readonly step = signal(0);

  protected readonly captions = [
    'The series as recorded. Rising, but not smoothly — something repeats inside it.',
    'The trend: the long-run direction once the repetition is averaged out.',
    'The seasonality: a cycle of fixed period, here repeating every twelve points.',
    'The residual: what is left. If a pattern is still visible here, the model has missed something.',
  ];

  private readonly trendValues = Array.from({ length: N }, (_, i) => 8 + i * 0.42);
  private readonly seasonalValues = Array.from({ length: N }, (_, i) =>
    7 * Math.sin((i / 12) * Math.PI * 2),
  );
  // Deterministic pseudo-noise, so the figure is identical on every render.
  private readonly residualValues = Array.from(
    { length: N },
    (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1 * 5 - 2.5,
  );

  protected readonly rows = [
    { label: 'Observed', note: 'what you measured', colour: 'var(--ink-2)', points: '' },
    { label: 'Trend', note: 'long-run direction', colour: 'var(--accent)', points: '' },
    { label: 'Seasonal', note: 'fixed repeating cycle', colour: 'var(--info)', points: '' },
    { label: 'Residual', note: 'the unexplained part', colour: 'var(--warn)', points: '' },
  ].map((row, r) => ({ ...row, points: this.series(r) }));

  /**
   * Each component is scaled to its own band. Sharing one scale would leave the
   * residual as a flat line against the trend, which hides the thing the row
   * exists to show.
   */
  private series(rowIndex: number): string {
    const values = Array.from({ length: N }, (_, i) => {
      if (rowIndex === 0) {
        return this.trendValues[i] + this.seasonalValues[i] + this.residualValues[i];
      }
      if (rowIndex === 1) return this.trendValues[i];
      if (rowIndex === 2) return this.seasonalValues[i];
      return this.residualValues[i];
    });

    const low = Math.min(...values);
    const span = Math.max(...values) - low || 1;
    const baseline = rowIndex * 54 + 46;

    return values
      .map((value, i) => {
        const x = 92 + (i / (N - 1)) * 320;
        const y = baseline - ((value - low) / span) * 32;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}

/* ---- Why k-fold leaks on ordered data ------------------------------------- */

/** Random folds against walk-forward, with the leaking folds marked. */
@Component({
  selector: 'app-viz-walk-forward',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepPlayer],
  template: `
    <svg viewBox="0 0 420 208" role="img" aria-label="Random k-fold compared with walk-forward validation">
      <text x="6" y="12" font-size="9" font-weight="600" fill="var(--ink)">time →</text>

      @if (mode() === 'kfold') {
        <text x="6" y="34" font-size="9" font-weight="600" fill="var(--danger)">Random k-fold — invalid here</text>
        @for (fold of kfold; track $index; let f = $index) {
          <text x="6" [attr.y]="56 + f * 28" font-size="7" fill="var(--ink-3)">fold {{ f + 1 }}</text>
          @for (cell of fold; track $index; let c = $index) {
            <rect [attr.x]="52 + c * 36" [attr.y]="46 + f * 28" width="32" height="16" rx="3"
              [attr.fill]="cell === 1 ? 'var(--warn)' : 'var(--surface-3)'"
              [attr.opacity]="cell === 1 ? 0.85 : 1" />
          }
          @if (leaks[f]) {
            <text x="412" [attr.y]="58 + f * 28" font-size="7" fill="var(--danger)" text-anchor="end">
              trains on the future
            </text>
          }
        }
      } @else {
        <text x="6" y="34" font-size="9" font-weight="600" fill="var(--accent)">Walk-forward — every fold trains on its own past</text>
        @for (fold of walk; track $index; let f = $index) {
          <text x="6" [attr.y]="56 + f * 28" font-size="7" fill="var(--ink-3)">fold {{ f + 1 }}</text>
          @for (cell of fold; track $index; let c = $index) {
            <rect [attr.x]="52 + c * 36" [attr.y]="46 + f * 28" width="32" height="16" rx="3"
              [attr.fill]="cell === 1 ? 'var(--accent)' : cell === 2 ? 'var(--surface-3)' : 'var(--accent-soft)'"
              [attr.opacity]="cell === 2 ? 0.4 : 1" />
          }
        }
      }

      <rect x="52" y="188" width="14" height="10" rx="2" fill="var(--accent-soft)" />
      <text x="72" y="197" font-size="7" fill="var(--ink-3)">train</text>
      <rect x="110" y="188" width="14" height="10" rx="2" [attr.fill]="mode() === 'kfold' ? 'var(--warn)' : 'var(--accent)'" />
      <text x="130" y="197" font-size="7" fill="var(--ink-3)">validate</text>
      <rect x="180" y="188" width="14" height="10" rx="2" fill="var(--surface-3)" opacity="0.4" />
      <text x="200" y="197" font-size="7" fill="var(--ink-3)">unused</text>
    </svg>

    <app-step-player
      [steps]="captions.length"
      [interval]="2600"
      [caption]="captions[step()]"
      (stepChange)="step.set($event)"
    />
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; margin-bottom: var(--sp-3); }
    rect { transition: fill var(--dur) var(--ease); }
  `,
})
export class WalkForwardVisual {
  protected readonly step = signal(0);

  protected readonly captions = [
    'Random k-fold: the validation block lands anywhere, so four of five folds train on data recorded after the data they are scored on.',
    'Walk-forward: train on a prefix, validate on the window straight after it, then roll forward. No fold ever sees its own future.',
  ];

  protected readonly mode = computed<'kfold' | 'walk'>(() => (this.step() === 0 ? 'kfold' : 'walk'));

  /** 1 = validation block, 0 = training. */
  protected readonly kfold = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  ];

  /** Folds 1-4 leak: there is training data to the right of the validation block. */
  protected readonly leaks = [true, true, true, true, false];

  /** 0 = train, 1 = validate, 2 = not yet available. */
  protected readonly walk = [
    [0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 1, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 1, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
  ];
}