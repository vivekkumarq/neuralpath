import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface Stage {
  label: string;
  phase: 'offline' | 'online';
  what: string;
  fails: string;
}

const STAGES: Stage[] = [
  {
    label: 'Documents',
    phase: 'offline',
    what: 'Source material is loaded and parsed, preserving structure: headings, lists, code blocks and tables.',
    fails: 'A PDF parser that flattens two columns into interleaved lines, or a table turned into unreadable text. Everything downstream inherits this.',
  },
  {
    label: 'Chunking',
    phase: 'offline',
    what: 'Documents are split into retrievable units, typically 400–800 tokens with 10–15% overlap, cut on structure rather than character count.',
    fails: 'Splits mid-idea, so no single chunk contains a complete answer. The highest-leverage stage to get right.',
  },
  {
    label: 'Embedding',
    phase: 'offline',
    what: 'Each chunk becomes a vector from one embedding model, with the heading path prepended so it is interpretable alone.',
    fails: 'Chunks longer than the model’s input limit are silently truncated, or a model change is made without re-indexing.',
  },
  {
    label: 'Index',
    phase: 'offline',
    what: 'Vectors are stored with metadata — document id, version, access level — in an ANN index, alongside a lexical index.',
    fails: 'Filters applied after the search instead of during it, so a filtered query returns nothing despite matches existing.',
  },
  {
    label: 'Retrieval',
    phase: 'online',
    what: 'The query is embedded and searched against both indexes; 20–50 candidates are fused with reciprocal rank fusion.',
    fails: 'Dense-only retrieval that cannot find exact identifiers, or a top-k so small the right chunk never makes the shortlist.',
  },
  {
    label: 'Reranking',
    phase: 'online',
    what: 'A cross-encoder scores each query/chunk pair jointly and the best three to five are kept.',
    fails: 'Skipping it. The right chunk sits at rank 14 and never reaches the prompt — usually the largest single quality loss.',
  },
  {
    label: 'Context',
    phase: 'online',
    what: 'Chunks are labelled with citable ids, ordered by relevance, deduplicated and clearly fenced from the instructions.',
    fails: 'Twenty chunks pasted in, or retrieved text merged with instructions — which is how indirect prompt injection arrives.',
  },
  {
    label: 'Generation',
    phase: 'online',
    what: 'The model answers from the supplied context only, cites ids, and is permitted to decline when the answer is absent.',
    fails: 'No grounding instruction, so the model answers from memory; or no refusal path, so it invents rather than declining.',
  },
  {
    label: 'Answer',
    phase: 'online',
    what: 'Citations are validated against what was supplied, and the whole request is traced: chunk ids, scores, prompt version, tokens.',
    fails: 'No trace, so a bad answer reported three days later cannot be reproduced or explained.',
  },
];

/** The RAG pipeline as a clickable flow, with the failure mode per stage. */
@Component({
  selector: 'app-viz-rag-pipeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flow">
      @for (stage of stages; track stage.label; let i = $index) {
        <button
          type="button"
          class="stage"
          [class.active]="active() === i"
          [class.online]="stage.phase === 'online'"
          (click)="active.set(i)"
        >
          <span class="index">{{ i + 1 }}</span>
          {{ stage.label }}
        </button>
        @if (i < stages.length - 1) {
          <span class="arrow" aria-hidden="true">→</span>
        }
      }
    </div>

    <div class="legend">
      <span><i class="dot offline"></i> offline · indexing</span>
      <span><i class="dot online"></i> online · per query</span>
    </div>

    <div class="detail">
      <h4>{{ current().label }}</h4>
      <p>{{ current().what }}</p>
      <p class="fails"><strong>Fails when:</strong> {{ current().fails }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .flow {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }

    .stage {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface-2);
      font-size: var(--text-xs);
      transition:
        border-color var(--dur) var(--ease),
        background var(--dur) var(--ease);
    }

    .stage:hover {
      border-color: var(--accent-line);
    }

    .stage.active {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--accent);
    }

    .index {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      color: var(--ink-3);
    }

    .stage.active .index {
      color: var(--accent);
    }

    .arrow {
      color: var(--ink-3);
      font-size: 0.7rem;
    }

    .legend {
      display: flex;
      gap: var(--sp-4);
      margin-top: var(--sp-3);
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 99px;
      margin-right: 0.35rem;
    }

    .dot.offline {
      background: var(--ink-3);
    }

    .dot.online {
      background: var(--accent);
    }

    .stage.online .index {
      color: var(--accent);
    }

    .detail {
      margin-top: var(--sp-4);
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
      max-width: 68ch;
    }

    .detail h4 {
      font-size: var(--text-md);
      margin-bottom: var(--sp-2);
    }

    .detail p {
      color: var(--ink-2);
      font-size: var(--text-base);
    }

    .fails {
      margin-top: var(--sp-2);
    }

    .fails strong {
      color: var(--warn);
    }
  `,
})
export class RagPipelineVisual {
  protected readonly stages = STAGES;
  protected readonly active = signal(1);
  protected readonly current = computed(() => this.stages[this.active()]);
}

/* ---- Vector search ------------------------------------------------------- */

const CORPUS = Array.from({ length: 38 }, (_, i) => {
  // A deterministic pseudo-random scatter: a fixed figure, no seeding library.
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { id: i, x: a - Math.floor(a), y: b - Math.floor(b) };
});

@Component({
  selector: 'app-viz-vector-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <div class="control">
        <label for="k">Top-k <b>{{ k() }}</b></label>
        <input id="k" type="range" min="1" max="12" step="1" [value]="k()" (input)="setK($event)" />
      </div>
      <span class="dim">Click anywhere in the space to move the query.</span>
    </div>

    <svg
      viewBox="0 0 320 230"
      role="img"
      aria-label="Nearest-neighbour search in a vector space"
      (click)="place($event)"
    >
      <rect x="10" y="10" width="300" height="210" rx="8" fill="var(--bg-soft)" stroke="var(--border)" />

      <circle
        [attr.cx]="px(query().x)"
        [attr.cy]="py(query().y)"
        [attr.r]="radius()"
        fill="var(--accent-soft)"
        stroke="var(--accent-line)"
        stroke-dasharray="4 4"
      />

      @for (point of corpus; track point.id) {
        <circle
          [attr.cx]="px(point.x)"
          [attr.cy]="py(point.y)"
          [attr.r]="isNear(point.id) ? 5 : 3.2"
          [attr.fill]="isNear(point.id) ? 'var(--accent)' : 'var(--surface)'"
          [attr.stroke]="isNear(point.id) ? 'var(--accent)' : 'var(--border-strong)'"
          stroke-width="1.2"
        />
      }

      <circle [attr.cx]="px(query().x)" [attr.cy]="py(query().y)" r="6" fill="var(--info)" />
    </svg>

    <p class="dim">
      Exact search compares the query against all {{ corpus.length }} vectors. At ten million, that
      is no longer viable — an HNSW or IVF index navigates to the same neighbourhood without
      visiting every point, trading a little recall for a large amount of time.
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
      align-items: center;
      margin-bottom: var(--sp-3);
    }

    .control {
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

    svg {
      width: 100%;
      height: auto;
      max-width: 460px;
      cursor: crosshair;
    }

    p {
      margin-top: var(--sp-3);
    }
  `,
})
export class VectorSearchVisual {
  protected readonly corpus = CORPUS;
  protected readonly k = signal(5);
  protected readonly query = signal({ x: 0.5, y: 0.45 });

  private readonly ranked = computed(() =>
    CORPUS.map((point) => ({
      id: point.id,
      distance: Math.hypot(point.x - this.query().x, point.y - this.query().y),
    })).sort((a, b) => a.distance - b.distance),
  );

  private readonly near = computed(() => new Set(this.ranked().slice(0, this.k()).map((p) => p.id)));

  /** Radius of the circle enclosing exactly the k nearest points. */
  protected readonly radius = computed(() => {
    const kth = this.ranked()[Math.min(this.k(), this.ranked().length) - 1];
    return Math.max(8, (kth?.distance ?? 0.2) * 280 + 4);
  });

  protected isNear(id: number): boolean {
    return this.near().has(id);
  }

  protected px(x: number): number {
    return 20 + x * 280;
  }

  protected py(y: number): number {
    return 20 + y * 190;
  }

  protected setK(event: Event): void {
    this.k.set(Number((event.target as HTMLInputElement).value));
  }

  protected place(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const box = svg.getBoundingClientRect();
    // The viewBox is 320x230 with the plot inset by 20/20 and sized 280x190.
    const vx = ((event.clientX - box.left) / box.width) * 320;
    const vy = ((event.clientY - box.top) / box.height) * 230;
    this.query.set({
      x: Math.max(0, Math.min(1, (vx - 20) / 280)),
      y: Math.max(0, Math.min(1, (vy - 20) / 190)),
    });
  }
}

/* ---- Adaptation comparison ----------------------------------------------- */

interface Approach {
  id: string;
  label: string;
  knowledge: string;
  behaviour: string;
  setup: string;
  cost: string;
  freshness: string;
  citations: string;
  useWhen: string;
}

const APPROACHES: Approach[] = [
  {
    id: 'prompting',
    label: 'Prompting',
    knowledge: 'A little, supplied per call',
    behaviour: 'Good — instructions and examples go a long way',
    setup: 'Minutes',
    cost: 'Low per call, rises with prompt length',
    freshness: 'Whatever you paste in',
    citations: 'Only what you supply',
    useWhen: 'Always first. It resolves more problems than people expect, and it costs an afternoon to find out.',
  },
  {
    id: 'rag',
    label: 'RAG',
    knowledge: 'Yes — private, large and current',
    behaviour: 'Unchanged',
    setup: 'Days',
    cost: 'Moderate — more input tokens per call',
    freshness: 'Re-index and it is current',
    citations: 'Yes, with validated ids',
    useWhen: 'The gap is knowledge: private documents, changing facts, anything that must be attributable.',
  },
  {
    id: 'fine-tuning',
    label: 'Fine-tuning',
    knowledge: 'Poorly and expensively',
    behaviour: 'Best — format, tone and narrow skills',
    setup: 'Weeks, plus a labelled dataset',
    cost: 'Training cost up front, then shorter prompts',
    freshness: 'Stale until you retrain',
    citations: 'No',
    useWhen: 'The gap is behaviour: a strict output format, a domain voice, or very high volume where prompt length dominates cost.',
  },
];

@Component({
  selector: 'app-viz-adaptation-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      @for (approach of approaches; track approach.id) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="active() === approach.id"
          (click)="active.set(approach.id)"
        >
          {{ approach.label }}
        </button>
      }
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            @for (approach of approaches; track approach.id) {
              <th scope="col" [class.on]="active() === approach.id">{{ approach.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.key) {
            <tr>
              <th scope="row">{{ row.label }}</th>
              @for (approach of approaches; track approach.id) {
                <td [class.on]="active() === approach.id">{{ value(approach, row.key) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>

    <p class="note note-tip"><strong>{{ current().label }}:</strong> {{ current().useWhen }}</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin-bottom: var(--sp-4);
    }

    th.on,
    td.on {
      background: var(--accent-soft);
    }

    td,
    th[scope='row'] {
      font-size: var(--text-xs);
    }

    .note {
      margin-top: var(--sp-4);
    }
  `,
})
export class AdaptationCompareVisual {
  protected readonly approaches = APPROACHES;
  protected readonly active = signal('rag');

  protected readonly rows: { key: keyof Approach; label: string }[] = [
    { key: 'knowledge', label: 'Adds knowledge' },
    { key: 'behaviour', label: 'Changes behaviour' },
    { key: 'setup', label: 'Setup time' },
    { key: 'cost', label: 'Cost shape' },
    { key: 'freshness', label: 'Staying current' },
    { key: 'citations', label: 'Citations' },
  ];

  protected readonly current = computed(
    () => APPROACHES.find((approach) => approach.id === this.active()) ?? APPROACHES[1],
  );

  protected value(approach: Approach, key: keyof Approach): string {
    return approach[key];
  }
}

/* ---- Agent loop ---------------------------------------------------------- */

interface LoopStep {
  label: string;
  detail: string;
}

const LOOP: LoopStep[] = [
  {
    label: 'Goal',
    detail: 'A request enters with the tool definitions and any state the task already has. Step, token, time and spend caps are set here, before anything runs.',
  },
  {
    label: 'Decide',
    detail: 'The model either answers or emits a structured tool call. This is the only step the model controls, and it is where non-determinism enters the system.',
  },
  {
    label: 'Validate',
    detail: 'Your code checks the arguments against a schema and the requesting user’s authorisation. Tool arguments are untrusted input — the model may have read attacker-controlled text.',
  },
  {
    label: 'Execute',
    detail: 'The function runs in your application, not in the model. Reads can be autonomous; anything irreversible waits for explicit approval.',
  },
  {
    label: 'Observe',
    detail: 'The result — including the error, with text the model can act on — is appended to the conversation. A bare "failed" invites an identical retry.',
  },
  {
    label: 'Checkpoint',
    detail: 'Progress and artefacts are written to durable storage, so a crash at step 40 does not restart from step 1 and the run stays auditable.',
  },
  {
    label: 'Limit check',
    detail: 'If a cap is hit, stop and say so plainly. An agent that cannot terminate is not a feature. Otherwise, loop back to Decide.',
  },
];

@Component({
  selector: 'app-viz-agent-loop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 300 300" role="img" aria-label="The agent loop">
      <circle cx="150" cy="150" r="104" fill="none" stroke="var(--border)" stroke-dasharray="4 5" />

      @for (step of loop; track step.label; let i = $index) {
        <g (click)="active.set(i)" style="cursor: pointer">
          <circle
            [attr.cx]="cx(i)"
            [attr.cy]="cy(i)"
            [attr.r]="active() === i ? 25 : 21"
            [attr.fill]="active() === i ? 'var(--accent)' : 'var(--surface-2)'"
            [attr.stroke]="active() === i ? 'var(--accent)' : 'var(--border-strong)'"
            stroke-width="1.4"
          />
          <text
            [attr.x]="cx(i)"
            [attr.y]="cy(i) + 3"
            font-size="8"
            [attr.fill]="active() === i ? 'var(--accent-ink)' : 'var(--ink-2)'"
            text-anchor="middle"
          >
            {{ step.label }}
          </text>
        </g>
      }
    </svg>

    <div class="detail">
      <h4>{{ current().label }}</h4>
      <p>{{ current().detail }}</p>
      <div class="row">
        <button type="button" class="btn btn-sm" (click)="step(-1)">Previous</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="step(1)">Next step</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-5);
      align-items: center;
    }

    svg {
      width: 100%;
      max-width: 280px;
      height: auto;
      flex: none;
    }

    .detail {
      flex: 1;
      min-width: 240px;
    }

    .detail h4 {
      font-size: var(--text-md);
      margin-bottom: var(--sp-2);
    }

    .detail p {
      color: var(--ink-2);
      font-size: var(--text-base);
    }

    .row {
      display: flex;
      gap: var(--sp-2);
      margin-top: var(--sp-4);
    }
  `,
})
export class AgentLoopVisual {
  protected readonly loop = LOOP;
  protected readonly active = signal(1);
  protected readonly current = computed(() => this.loop[this.active()]);

  protected cx(index: number): number {
    return 150 + 104 * Math.cos(this.angle(index));
  }

  protected cy(index: number): number {
    return 150 + 104 * Math.sin(this.angle(index));
  }

  protected step(direction: number): void {
    const next = (this.active() + direction + this.loop.length) % this.loop.length;
    this.active.set(next);
  }

  private angle(index: number): number {
    return (index / this.loop.length) * Math.PI * 2 - Math.PI / 2;
  }
}
