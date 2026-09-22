import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

/* ---- Tokenizer ----------------------------------------------------------- */

const SUFFIXES = ['isation', 'ization', 'ation', 'ings', 'ing', 'tion', 'ness', 'ment', 'able', 'ers', 'ed', 'es', 'er', 'ly', 's'];
const PREFIXES = ['un', 're', 'pre', 'inter', 'multi', 'trans'];
const COMMON = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'are', 'was', 'for', 'with', 'model',
  'data', 'text', 'token', 'learn', 'train', 'this', 'that', 'it', 'on', 'as', 'by', 'from',
]);

/**
 * An approximation of subword tokenisation.
 *
 * This is not a real BPE vocabulary — it splits on whitespace, punctuation and
 * a list of common affixes. The point of the figure is the *shape* of the
 * result: common words are one token, longer or rarer words break into pieces,
 * and the count is not the word count.
 */
function tokenise(text: string): string[] {
  const tokens: string[] = [];

  for (const raw of text.match(/\s*[A-Za-z]+|\s*\d+|\s*[^\sA-Za-z\d]/g) ?? []) {
    const lead = raw.startsWith(' ') ? ' ' : '';
    const word = raw.trim();

    if (!/^[A-Za-z]{5,}$/.test(word) || COMMON.has(word.toLowerCase())) {
      tokens.push(lead + word);
      continue;
    }

    let head = word;
    const tail: string[] = [];

    for (const suffix of SUFFIXES) {
      if (head.length - suffix.length >= 3 && head.toLowerCase().endsWith(suffix)) {
        tail.unshift(head.slice(head.length - suffix.length));
        head = head.slice(0, head.length - suffix.length);
        break;
      }
    }

    const prefix = PREFIXES.find((p) => head.toLowerCase().startsWith(p) && head.length - p.length >= 4);
    if (prefix) {
      tokens.push(lead + head.slice(0, prefix.length));
      tokens.push(head.slice(prefix.length));
    } else {
      tokens.push(lead + head);
    }

    tokens.push(...tail);
  }

  return tokens;
}

@Component({
  selector: 'app-viz-tokenizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="field">
      <input
        type="text"
        [value]="text()"
        (input)="text.set($any($event.target).value)"
        aria-label="Text to tokenise"
        placeholder="Type some text"
      />
    </label>

    <div class="tokens" role="list">
      @for (token of tokens(); track $index) {
        <span class="token" role="listitem">{{ token.replace(' ', '␣') }}</span>
      }
    </div>

    <div class="readout">
      <span>tokens <b>{{ tokens().length }}</b></span>
      <span>words <b>{{ words() }}</b></span>
      <span>characters <b>{{ text().length }}</b></span>
      <span>chars per token <b>{{ ratio() }}</b></span>
    </div>

    <p class="dim">
      An approximation of subword behaviour, not a real vocabulary: common words stay whole, longer
      ones split at affixes. Note that the token count is never the word count — which is why cost
      estimates based on words are wrong.
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: var(--sp-4);
    }

    .token {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      background: var(--accent-soft);
      border: 1px solid var(--accent-line);
      color: var(--ink);
      white-space: pre;
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-top: var(--sp-4);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .readout b {
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class TokenizerVisual {
  protected readonly text = signal('Tokenisation determines what the model reads and what you pay.');

  protected readonly tokens = computed(() => tokenise(this.text()));
  protected readonly words = computed(() => this.text().trim().split(/\s+/).filter(Boolean).length);
  protected readonly ratio = computed(() => {
    const count = this.tokens().length;
    return count === 0 ? '0' : (this.text().length / count).toFixed(1);
  });
}

/* ---- Embeddings ---------------------------------------------------------- */

interface Point {
  label: string;
  x: number;
  y: number;
  group: string;
}

const POINTS: Point[] = [
  { label: 'king', x: 0.18, y: 0.2, group: 'royalty' },
  { label: 'queen', x: 0.26, y: 0.14, group: 'royalty' },
  { label: 'prince', x: 0.12, y: 0.3, group: 'royalty' },
  { label: 'throne', x: 0.3, y: 0.28, group: 'royalty' },
  { label: 'python', x: 0.72, y: 0.22, group: 'code' },
  { label: 'function', x: 0.82, y: 0.3, group: 'code' },
  { label: 'variable', x: 0.68, y: 0.36, group: 'code' },
  { label: 'compiler', x: 0.86, y: 0.16, group: 'code' },
  { label: 'invoice', x: 0.22, y: 0.76, group: 'finance' },
  { label: 'payment', x: 0.3, y: 0.84, group: 'finance' },
  { label: 'refund', x: 0.14, y: 0.86, group: 'finance' },
  { label: 'balance', x: 0.34, y: 0.7, group: 'finance' },
  { label: 'kitten', x: 0.74, y: 0.78, group: 'animals' },
  { label: 'puppy', x: 0.84, y: 0.84, group: 'animals' },
  { label: 'cat', x: 0.66, y: 0.86, group: 'animals' },
  { label: 'dog', x: 0.88, y: 0.72, group: 'animals' },
];

@Component({
  selector: 'app-viz-embeddings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <span class="dim">Query:</span>
      @for (point of points; track point.label) {
        @if (point.group === 'royalty' || point.label === 'python' || point.label === 'refund' || point.label === 'kitten') {
          <button
            type="button"
            class="chip"
            [attr.aria-pressed]="query().label === point.label"
            (click)="query.set(point)"
          >
            {{ point.label }}
          </button>
        }
      }
    </div>

    <svg viewBox="0 0 320 230" role="img" aria-label="A two-dimensional projection of an embedding space">
      <rect x="10" y="10" width="300" height="210" rx="8" fill="var(--bg-soft)" stroke="var(--border)" />

      @for (point of ranked(); track point.label) {
        @if (point.rank > 0 && point.rank <= 3) {
          <line
            [attr.x1]="px(query().x)"
            [attr.y1]="py(query().y)"
            [attr.x2]="px(point.x)"
            [attr.y2]="py(point.y)"
            stroke="var(--accent)"
            stroke-width="1"
            stroke-dasharray="3 3"
            opacity="0.7"
          />
        }
        <circle
          [attr.cx]="px(point.x)"
          [attr.cy]="py(point.y)"
          [attr.r]="point.label === query().label ? 6 : 4"
          [attr.fill]="point.label === query().label ? 'var(--accent)' : point.rank <= 3 ? 'var(--accent-soft)' : 'var(--surface)'"
          [attr.stroke]="point.rank <= 3 ? 'var(--accent)' : 'var(--border-strong)'"
          stroke-width="1.3"
        />
        <text
          [attr.x]="px(point.x) + 7"
          [attr.y]="py(point.y) + 3"
          font-size="8"
          [attr.fill]="point.rank <= 3 ? 'var(--ink)' : 'var(--ink-3)'"
        >
          {{ point.label }}
        </text>
      }
    </svg>

    <ol class="near">
      @for (point of nearest(); track point.label) {
        <li>
          <span>{{ point.label }}</span>
          <span class="score">{{ point.similarity.toFixed(3) }}</span>
        </li>
      }
    </ol>

    <p class="dim">
      A real embedding has hundreds of dimensions; this is a projection to two so it can be drawn.
      Neighbourhoods are what retrieval exploits — and the reason unrelated groups sit far apart.
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
      margin-bottom: var(--sp-3);
    }

    svg {
      width: 100%;
      height: auto;
      max-width: 460px;
    }

    .near {
      list-style: none;
      padding: 0;
      margin-top: var(--sp-3);
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }

    .near li {
      margin: 0;
      display: flex;
      gap: var(--sp-2);
      align-items: baseline;
      padding: 0.2rem 0.5rem;
      border-radius: 99px;
      background: var(--surface-2);
      font-size: var(--text-xs);
    }

    .score {
      font-family: var(--font-mono);
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class EmbeddingsVisual {
  protected readonly points = POINTS;
  protected readonly query = signal<Point>(POINTS[0]);

  private readonly scored = computed(() =>
    POINTS.map((point) => ({
      ...point,
      similarity: 1 - Math.hypot(point.x - this.query().x, point.y - this.query().y),
    })).sort((a, b) => b.similarity - a.similarity),
  );

  protected readonly nearest = computed(() => this.scored().slice(1, 4));

  protected readonly ranked = computed(() => {
    const order = this.scored();
    return POINTS.map((point) => ({
      ...point,
      rank: order.findIndex((entry) => entry.label === point.label),
    }));
  });

  protected px(x: number): number {
    return 20 + x * 280;
  }

  protected py(y: number): number {
    return 20 + y * 190;
  }
}

/* ---- Attention ----------------------------------------------------------- */

const SENTENCE = ['The', 'animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'];

/** Hand-set links that dominate this sentence's attention pattern. */
const LINKS: Record<number, Record<number, number>> = {
  1: { 0: 3 },
  3: { 2: 2.5, 4: 2 },
  4: { 1: 2.5, 6: 2.5 },
  6: { 5: 2.5, 4: 1.5 },
  7: { 4: 2, 10: 2 },
  8: { 1: 4, 6: 1.2 },
  9: { 8: 2.5, 10: 2 },
  10: { 8: 2.2, 1: 1.5 },
};

@Component({
  selector: 'app-viz-attention',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="eyebrow">Select a token to see what it attends to</p>

    <div class="sentence">
      @for (word of sentence; track $index; let i = $index) {
        <button
          type="button"
          class="word"
          [class.query]="focus() === i"
          [style.background]="focus() === i ? 'var(--accent)' : heat(i)"
          [style.color]="focus() === i ? 'var(--accent-ink)' : 'var(--ink)'"
          (click)="focus.set(i)"
        >
          {{ word }}
        </button>
      }
    </div>

    <ul class="weights" role="list">
      @for (entry of top(); track entry.index) {
        <li>
          <span class="token">{{ sentence[entry.index] }}</span>
          <span class="bar"><span [style.width.%]="entry.weight * 100"></span></span>
          <span class="value">{{ entry.weight.toFixed(3) }}</span>
        </li>
      }
    </ul>

    <p class="dim">
      @if (best() !== undefined) {
        "{{ sentence[focus()] }}" attends most strongly to <b>{{ sentence[best()!] }}</b>.
      } @else {
        "{{ sentence[focus()] }}" is the first token, so causal masking leaves it nothing to attend
        to but itself.
      }
      Weights are illustrative, not from a trained model, but
      the shape is real: this is how a pronoun gets bound to its referent, and why the same word can
      have a different representation in every sentence.
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .sentence {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: var(--sp-3) 0 var(--sp-4);
    }

    .word {
      padding: 0.3rem 0.55rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      font-size: var(--text-base);
      transition: background var(--dur) var(--ease);
    }

    .word.query {
      border-color: var(--accent);
      font-weight: 600;
    }

    .weights {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.3rem;
      max-width: 420px;
    }

    .weights li {
      margin: 0;
      display: grid;
      grid-template-columns: 5.5rem 1fr 3.2rem;
      gap: var(--sp-3);
      align-items: center;
    }

    .token {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--ink-2);
      text-align: right;
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
    }

    .value {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-4);
    }

    b {
      color: var(--accent);
    }
  `,
})
export class AttentionVisual {
  protected readonly sentence = SENTENCE;
  protected readonly focus = signal(8);

  /** Softmax over recency plus the hand-set links, masked to the past. */
  protected readonly weights = computed(() => {
    const i = this.focus();
    const scores = SENTENCE.map((_, j) => {
      if (j > i) return -Infinity;
      const recency = -0.35 * (i - j);
      const boost = LINKS[i]?.[j] ?? 0;
      return recency + boost + (j === i ? 1.2 : 0);
    });

    const max = Math.max(...scores.filter(Number.isFinite));
    const exp = scores.map((score) => (Number.isFinite(score) ? Math.exp(score - max) : 0));
    const total = exp.reduce((sum, value) => sum + value, 0);
    return exp.map((value) => value / total);
  });

  protected readonly top = computed(() =>
    this.weights()
      .map((weight, index) => ({ weight, index }))
      .filter((entry) => entry.index !== this.focus() && entry.weight > 0.01)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 4),
  );

  /** Index of the strongest non-self link, or undefined for the first token. */
  protected readonly best = computed<number | undefined>(() => this.top()[0]?.index);

  protected heat(index: number): string {
    const weight = this.weights()[index];
    return `color-mix(in srgb, var(--accent) ${Math.round(weight * 85)}%, var(--surface))`;
  }
}

/* ---- Transformer block --------------------------------------------------- */

interface SubLayer {
  label: string;
  detail: string;
}

@Component({
  selector: 'app-viz-transformer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      @for (layer of layers; track layer.label; let i = $index) {
        <button
          type="button"
          class="block"
          [class.active]="active() === i"
          (click)="active.set(i)"
        >
          {{ layer.label }}
        </button>
        @if (i < layers.length - 1) {
          <span class="arrow" aria-hidden="true">↓</span>
        }
      }
    </div>

    <p class="detail">{{ layers[active()].detail }}</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .stack {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
      max-width: 420px;
    }

    .block {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface-2);
      padding: 0.55rem 0.85rem;
      font-size: var(--text-sm);
      text-align: left;
      transition:
        border-color var(--dur) var(--ease),
        background var(--dur) var(--ease);
    }

    .block:hover {
      border-color: var(--accent-line);
    }

    .block.active {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--ink);
    }

    .arrow {
      color: var(--ink-3);
      font-size: 0.8rem;
      text-align: center;
      line-height: 1;
    }

    .detail {
      margin-top: var(--sp-4);
      color: var(--ink-2);
      font-size: var(--text-base);
      max-width: 62ch;
    }
  `,
})
export class TransformerVisual {
  protected readonly layers: SubLayer[] = [
    {
      label: 'Token + positional embedding',
      detail:
        'Each token id becomes a learned vector, and position is injected — additively for sinusoidal and learned schemes, or by rotating queries and keys for RoPE. Without this step the block would treat the input as an unordered set.',
    },
    {
      label: 'Layer norm (pre-norm)',
      detail:
        'Normalises across the feature dimension of each token independently. Applying it before the sub-layer rather than after trains more reliably at depth, which is why modern models are pre-norm.',
    },
    {
      label: 'Multi-head self-attention',
      detail:
        'Every token reads every other token (masked to the past in a decoder). Several heads run in parallel on lower-dimensional projections, each learning a different kind of relationship, then concatenate.',
    },
    {
      label: '+ residual',
      detail:
        'The sub-layer output is added back to its input. This gives gradients an unobstructed path to earlier layers and is the reason hundred-layer stacks train at all.',
    },
    {
      label: 'Layer norm',
      detail: 'The same normalisation again, before the feed-forward sub-layer.',
    },
    {
      label: 'Feed-forward network',
      detail:
        'A two-layer MLP applied to each token independently, usually four times the model width with a GELU between. Most of the parameters in a transformer live here, and evidence suggests much of the stored knowledge does too.',
    },
    {
      label: '+ residual → next block',
      detail:
        'Another residual addition, and the result is handed to the next identical block. Stacking dozens of these, with a final projection to vocabulary logits, is the whole architecture.',
    },
  ];

  protected readonly active = signal(2);
}

/* ---- Sampling ------------------------------------------------------------ */

const CANDIDATES = [
  { token: ' the', logit: 3.2 },
  { token: ' a', logit: 2.6 },
  { token: ' this', logit: 1.9 },
  { token: ' our', logit: 1.4 },
  { token: ' one', logit: 0.9 },
  { token: ' some', logit: 0.4 },
  { token: ' any', logit: -0.2 },
  { token: ' banana', logit: -2.4 },
];

@Component({
  selector: 'app-viz-sampling',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <div class="control">
        <label for="temp">Temperature <b>{{ temperature().toFixed(2) }}</b></label>
        <input id="temp" type="range" min="0.05" max="2" step="0.05" [value]="temperature()" (input)="setTemp($event)" />
      </div>
      <div class="control">
        <label for="topp">Top-p <b>{{ topP().toFixed(2) }}</b></label>
        <input id="topp" type="range" min="0.1" max="1" step="0.05" [value]="topP()" (input)="setTopP($event)" />
      </div>
    </div>

    <ul class="bars" role="list">
      @for (row of rows(); track row.token) {
        <li [class.cut]="row.cut">
          <span class="token">{{ row.token.trim() }}</span>
          <span class="bar"><span [style.width.%]="row.probability * 100"></span></span>
          <span class="value">{{ (row.probability * 100).toFixed(1) }}%</span>
        </li>
      }
    </ul>

    <p class="dim">
      {{ kept() }} of {{ rows().length }} candidates survive top-p. {{ verdict() }}
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-bottom: var(--sp-4);
    }

    .control {
      flex: 1;
      min-width: 160px;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
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

    .bars {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.3rem;
      max-width: 440px;
    }

    .bars li {
      margin: 0;
      display: grid;
      grid-template-columns: 4.5rem 1fr 3.2rem;
      gap: var(--sp-3);
      align-items: center;
    }

    .bars li.cut {
      opacity: 0.32;
    }

    .token {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      text-align: right;
      color: var(--ink-2);
    }

    .bar {
      height: 9px;
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

    .value {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class SamplingVisual {
  protected readonly temperature = signal(0.7);
  protected readonly topP = signal(0.9);

  protected readonly rows = computed(() => {
    const t = Math.max(0.05, this.temperature());
    const scaled = CANDIDATES.map((candidate) => candidate.logit / t);
    const max = Math.max(...scaled);
    const exp = scaled.map((value) => Math.exp(value - max));
    const total = exp.reduce((sum, value) => sum + value, 0);

    let cumulative = 0;
    let crossed = false;

    return CANDIDATES.map((candidate, index) => {
      const probability = exp[index] / total;
      const cut = crossed;
      cumulative += probability;
      if (cumulative >= this.topP()) crossed = true;
      return { token: candidate.token, probability, cut };
    });
  });

  protected readonly kept = computed(() => this.rows().filter((row) => !row.cut).length);

  protected readonly verdict = computed(() => {
    const t = this.temperature();
    if (t <= 0.2) return 'Near-deterministic: the top token wins almost every time.';
    if (t >= 1.4) return 'Very flat: unlikely tokens become reachable, and output drifts.';
    return 'A usable balance for prose — too random for extraction.';
  });

  protected setTemp(event: Event): void {
    this.temperature.set(Number((event.target as HTMLInputElement).value));
  }

  protected setTopP(event: Event): void {
    this.topP.set(Number((event.target as HTMLInputElement).value));
  }
}
