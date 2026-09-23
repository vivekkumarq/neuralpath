import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { Icon } from '../icon';

/**
 * Playback for a stepped figure.
 *
 * Every animated visual on the site is a sequence of discrete states rather
 * than a continuous tween, because a reader needs to be able to stop on a step
 * and look at it. This component owns the index and the timer; the figure
 * renders whatever the current step means.
 *
 * It starts paused when the reader prefers reduced motion, and the timer is
 * cleared on destroy so nothing keeps ticking off screen.
 */
@Component({
  selector: 'app-step-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="player">
      <button
        type="button"
        class="btn btn-sm"
        (click)="toggle()"
        [attr.aria-label]="playing() ? 'Pause' : 'Play'"
      >
        <app-icon [name]="playing() ? 'pause' : 'play'" [size]="13" />
        {{ playing() ? 'Pause' : 'Play' }}
      </button>

      <button type="button" class="btn btn-sm btn-ghost" (click)="step(-1)" aria-label="Previous step">
        <app-icon name="arrow-left" [size]="13" />
      </button>

      <div class="dots" role="group" [attr.aria-label]="label()">
        @for (dot of dots(); track dot) {
          <button
            type="button"
            [class.on]="index() === dot"
            [attr.aria-label]="'Step ' + (dot + 1)"
            (click)="goTo(dot)"
          ></button>
        }
      </div>

      <button type="button" class="btn btn-sm btn-ghost" (click)="step(1)" aria-label="Next step">
        <app-icon name="arrow-right" [size]="13" />
      </button>

      <span class="caption">{{ caption() }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .player {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex-wrap: wrap;
    }

    .dots {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .dots button {
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: var(--surface-3);
      border: 1px solid var(--border-strong);
      padding: 0;
      transition:
        background var(--dur) var(--ease),
        transform var(--dur) var(--ease);
    }

    .dots button.on {
      background: var(--accent);
      border-color: var(--accent);
      transform: scale(1.25);
    }

    .caption {
      font-size: var(--text-xs);
      color: var(--ink-3);
      margin-left: auto;
      text-align: right;
      min-width: 0;
    }
  `,
})
export class StepPlayer implements OnDestroy {
  /** Number of steps in the sequence. */
  readonly steps = input.required<number>();
  /** Milliseconds per step. */
  readonly interval = input(1500);
  /** Description of the current step, shown beside the controls. */
  readonly caption = input('');
  readonly label = input('Animation steps');
  /** Start playing as soon as the figure mounts. */
  readonly autoplay = input(true);

  readonly stepChange = output<number>();

  protected readonly index = signal(0);
  protected readonly playing = signal(false);
  protected readonly dots = computed(() => Array.from({ length: this.steps() }, (_, i) => i));

  private timer?: ReturnType<typeof setInterval>;
  private readonly reduced =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  constructor() {
    effect(() => {
      // Reading both inputs here re-arms the timer if either changes.
      const shouldPlay = this.autoplay() && !this.reduced;
      this.interval();
      if (shouldPlay && !this.playing()) {
        this.playing.set(true);
        this.arm();
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  protected toggle(): void {
    this.playing.update((on) => !on);
    if (this.playing()) this.arm();
    else clearInterval(this.timer);
  }

  protected step(direction: number): void {
    clearInterval(this.timer);
    this.playing.set(false);
    this.move(direction);
  }

  protected goTo(index: number): void {
    clearInterval(this.timer);
    this.playing.set(false);
    this.index.set(index);
    this.stepChange.emit(index);
  }

  private arm(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.move(1), this.interval());
  }

  private move(direction: number): void {
    const size = this.steps();
    this.index.update((current) => (current + direction + size) % size);
    this.stepChange.emit(this.index());
  }
}
