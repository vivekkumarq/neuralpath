import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

/** One neuron, with the weights exposed so the reader can move the output. */
@Component({
  selector: 'app-viz-perceptron',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 400 170" role="img" aria-label="A single neuron computing a weighted sum">
      @for (input of inputs; track $index; let i = $index) {
        <circle [attr.cx]="40" [attr.cy]="35 + i * 50" r="15" fill="var(--surface-2)" stroke="var(--border-strong)" />
        <text [attr.x]="40" [attr.y]="39 + i * 50" font-size="10" fill="var(--ink)" text-anchor="middle">
          {{ input.value }}
        </text>
        <line
          x1="55"
          [attr.y1]="35 + i * 50"
          x2="185"
          y2="85"
          [attr.stroke]="weights()[i] >= 0 ? 'var(--accent)' : 'var(--danger)'"
          [attr.stroke-width]="0.8 + Math.abs(weights()[i]) * 2.2"
          opacity="0.8"
        />
        <text [attr.x]="115" [attr.y]="26 + i * 46" font-size="9" fill="var(--ink-3)" text-anchor="middle">
          w{{ i + 1 }}={{ weights()[i].toFixed(1) }}
        </text>
      }

      <circle cx="205" cy="85" r="26" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6" />
      <text x="205" y="82" font-size="9" fill="var(--ink-2)" text-anchor="middle">Σ + b</text>
      <text x="205" y="95" font-size="9" fill="var(--accent)" text-anchor="middle">{{ sum().toFixed(2) }}</text>

      <line x1="231" y1="85" x2="290" y2="85" stroke="var(--border-strong)" />
      <rect x="290" y="65" width="52" height="40" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" />
      <text x="316" y="89" font-size="9" fill="var(--ink-2)" text-anchor="middle">sigmoid</text>

      <line x1="342" y1="85" x2="376" y2="85" stroke="var(--border-strong)" />
      <text x="382" y="89" font-size="11" fill="var(--accent)">{{ output().toFixed(3) }}</text>
    </svg>

    <div class="controls">
      @for (input of inputs; track $index; let i = $index) {
        <div class="control">
          <label [attr.for]="'w' + i">w{{ i + 1 }} <b>{{ weights()[i].toFixed(1) }}</b></label>
          <input
            [attr.id]="'w' + i"
            type="range"
            min="-2"
            max="2"
            step="0.1"
            [value]="weights()[i]"
            (input)="setWeight(i, $event)"
          />
        </div>
      }
      <div class="control">
        <label for="bias">bias <b>{{ bias().toFixed(1) }}</b></label>
        <input id="bias" type="range" min="-3" max="3" step="0.1" [value]="bias()" (input)="setBias($event)" />
      </div>
    </div>

    <p class="dim">
      The weights decide which inputs matter and in which direction; the bias shifts the threshold at
      which the neuron fires. Training is a search for these five numbers.
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin-top: var(--sp-4);
    }

    .control {
      flex: 1;
      min-width: 120px;
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

    p {
      margin-top: var(--sp-4);
    }
  `,
})
export class PerceptronVisual {
  protected readonly Math = Math;
  protected readonly inputs = [{ value: 1.0 }, { value: 0.4 }, { value: -0.8 }];
  protected readonly weights = signal([0.9, -0.5, 1.2]);
  protected readonly bias = signal(0.2);

  protected readonly sum = computed(() =>
    this.inputs.reduce((total, input, i) => total + input.value * this.weights()[i], this.bias()),
  );

  protected readonly output = computed(() => 1 / (1 + Math.exp(-this.sum())));

  protected setWeight(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.weights.update((list) => list.map((w, i) => (i === index ? value : w)));
  }

  protected setBias(event: Event): void {
    this.bias.set(Number((event.target as HTMLInputElement).value));
  }
}

interface Layer {
  units: number;
  label: string;
  detail: string;
}

/** A small network, with parameter counts per layer. */
@Component({
  selector: 'app-viz-neural-net',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 420 210" role="img" aria-label="A three-layer neural network">
      @for (layer of layers; track layer.label; let li = $index) {
        @for (unit of dots(layer.units); track $index; let ui = $index) {
          @if (li > 0) {
            @for (prev of dots(layers[li - 1].units); track $index; let pi = $index) {
              <line
                [attr.x1]="cx(li - 1)"
                [attr.y1]="cy(pi, layers[li - 1].units)"
                [attr.x2]="cx(li)"
                [attr.y2]="cy(ui, layer.units)"
                stroke="var(--border)"
                stroke-width="0.6"
                [attr.opacity]="active() === li || active() === -1 ? 0.75 : 0.2"
              />
            }
          }
        }
      }

      @for (layer of layers; track layer.label; let li = $index) {
        @for (unit of dots(layer.units); track $index; let ui = $index) {
          <circle
            [attr.cx]="cx(li)"
            [attr.cy]="cy(ui, layer.units)"
            r="7"
            [attr.fill]="active() === li ? 'var(--accent)' : 'var(--surface-2)'"
            [attr.stroke]="active() === li ? 'var(--accent)' : 'var(--border-strong)'"
            stroke-width="1.3"
          />
        }
        <text [attr.x]="cx(li)" y="200" font-size="9" fill="var(--ink-3)" text-anchor="middle">
          {{ layer.label }}
        </text>
      }
    </svg>

    <div class="controls">
      @for (layer of layers; track layer.label; let li = $index) {
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="active() === li"
          (click)="active.set(active() === li ? -1 : li)"
        >
          {{ layer.label }}
        </button>
      }
      <span class="dim">{{ detail() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: auto;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      align-items: center;
      margin-top: var(--sp-3);
    }
  `,
})
export class NeuralNetVisual {
  protected readonly layers: Layer[] = [
    { units: 6, label: 'input · 784', detail: 'Flattened 28x28 pixels. No parameters — this is just the data.' },
    { units: 8, label: 'hidden · 128', detail: '784 x 128 weights + 128 biases = 100,480 parameters, then a ReLU.' },
    { units: 5, label: 'hidden · 64', detail: '128 x 64 + 64 = 8,256 parameters, then a ReLU.' },
    { units: 3, label: 'output · 10', detail: '64 x 10 + 10 = 650 parameters, then a softmax over ten classes.' },
  ];

  protected readonly active = signal(1);

  protected readonly detail = computed(() =>
    this.active() === -1
      ? 'Total: 109,386 parameters. Select a layer for its share.'
      : this.layers[this.active()].detail,
  );

  protected dots(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  protected cx(index: number): number {
    return 45 + index * 110;
  }

  protected cy(unit: number, count: number): number {
    const spacing = 160 / (count + 1);
    return 15 + spacing * (unit + 1);
  }
}

const KERNELS: Record<string, { label: string; values: number[][]; note: string }> = {
  edge: {
    label: 'Vertical edge',
    values: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    note: 'Positive on the right, negative on the left — responds where brightness changes horizontally.',
  },
  sharpen: {
    label: 'Sharpen',
    values: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    note: 'Amplifies the centre against its neighbours, increasing local contrast.',
  },
  blur: {
    label: 'Blur',
    values: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    note: 'An unweighted average over the patch, which smooths out local detail.',
  },
};

const IMAGE = [
  [10, 10, 10, 80, 90, 90],
  [10, 12, 14, 85, 92, 90],
  [10, 10, 16, 88, 90, 92],
  [12, 10, 12, 86, 94, 90],
  [10, 14, 10, 82, 90, 88],
  [10, 10, 12, 80, 88, 90],
];

/** A 3x3 kernel over a 6x6 patch, with the arithmetic shown for one position. */
@Component({
  selector: 'app-viz-convolution',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      @for (key of kernelKeys; track key) {
        <button type="button" class="chip" [attr.aria-pressed]="kernel() === key" (click)="kernel.set(key)">
          {{ kernels[key].label }}
        </button>
      }
    </div>

    <div class="stage">
      <div>
        <p class="eyebrow">Input 6x6</p>
        <div class="grid input" [style.--size]="6">
          @for (row of image; track $index; let r = $index) {
            @for (cell of row; track $index; let c = $index) {
              <span
                class="cell"
                [class.window]="inWindow(r, c)"
                [style.background]="shade(cell)"
                [attr.title]="cell"
              ></span>
            }
          }
        </div>
      </div>

      <div>
        <p class="eyebrow">Kernel 3x3</p>
        <div class="grid kernel" [style.--size]="3">
          @for (row of kernels[kernel()].values; track $index) {
            @for (value of row; track $index) {
              <span class="cell num">{{ value }}</span>
            }
          }
        </div>
      </div>

      <div>
        <p class="eyebrow">Output 4x4</p>
        <div class="grid output" [style.--size]="4">
          @for (row of result(); track $index; let r = $index) {
            @for (value of row; track $index; let c = $index) {
              <button
                type="button"
                class="cell out"
                [class.active]="pos().r === r && pos().c === c"
                (click)="pos.set({ r, c })"
                [attr.aria-label]="'Output at row ' + (r + 1) + ' column ' + (c + 1)"
              >
                {{ value }}
              </button>
            }
          }
        </div>
      </div>
    </div>

    <p class="dim">
      Output[{{ pos().r + 1 }},{{ pos().c + 1 }}] = {{ workings() }} =
      <b>{{ result()[pos().r][pos().c] }}</b>
    </p>
    <p class="dim">{{ kernels[kernel()].note }} Stride 1, no padding, so 6x6 becomes 4x4.</p>
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

    .stage {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-5);
      align-items: flex-start;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(var(--size), 26px);
      gap: 2px;
      margin-top: var(--sp-2);
    }

    .cell {
      width: 26px;
      height: 26px;
      border-radius: 3px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 0.6rem;
      color: var(--ink-2);
    }

    .cell.window {
      outline: 2px solid var(--accent);
      outline-offset: -1px;
    }

    .cell.num {
      background: var(--surface-2);
      color: var(--ink);
    }

    .cell.out {
      background: var(--bg-soft);
      cursor: pointer;
    }

    .cell.out.active {
      background: var(--accent-soft);
      border-color: var(--accent);
      color: var(--accent);
    }

    p {
      margin-top: var(--sp-3);
    }

    b {
      color: var(--accent);
      font-family: var(--font-mono);
    }
  `,
})
export class ConvolutionVisual {
  protected readonly image = IMAGE;
  protected readonly kernels = KERNELS;
  protected readonly kernelKeys = Object.keys(KERNELS);

  protected readonly kernel = signal('edge');
  protected readonly pos = signal({ r: 0, c: 1 });

  protected readonly result = computed(() => {
    const k = KERNELS[this.kernel()].values;
    const divisor = this.kernel() === 'blur' ? 9 : 1;
    const out: number[][] = [];

    for (let r = 0; r < 4; r++) {
      const row: number[] = [];
      for (let c = 0; c < 4; c++) {
        let total = 0;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) total += IMAGE[r + i][c + j] * k[i][j];
        }
        row.push(Math.round(total / divisor));
      }
      out.push(row);
    }
    return out;
  });

  protected readonly workings = computed(() => {
    const k = KERNELS[this.kernel()].values;
    const { r, c } = this.pos();
    const terms: string[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (k[i][j] !== 0) terms.push(`${IMAGE[r + i][c + j]}x${k[i][j]}`);
      }
    }
    const expression = terms.join(' + ');
    return this.kernel() === 'blur' ? `(${expression}) / 9` : expression;
  });

  protected inWindow(row: number, col: number): boolean {
    const { r, c } = this.pos();
    return row >= r && row < r + 3 && col >= c && col < c + 3;
  }

  protected shade(value: number): string {
    const level = Math.round((value / 100) * 100);
    return `color-mix(in srgb, var(--ink) ${level}%, var(--bg-soft))`;
  }
}
