import { Injectable, signal } from '@angular/core';

export interface Toast {
  /** Bumped on every message so an identical text still restarts the animation. */
  readonly id: number;
  readonly text: string;
  readonly icon: 'check' | 'bookmark' | 'info';
}

/**
 * A single transient confirmation.
 *
 * Actions that change stored state — completing a topic, saving a bookmark —
 * otherwise only redraw a small button, which is easy to miss. One toast at a
 * time is deliberate: a queue would leave a reader waiting to find out whether
 * their click registered.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly current = signal<Toast | null>(null);
  private counter = 0;
  private timer?: ReturnType<typeof setTimeout>;

  readonly toast = this.current.asReadonly();

  show(text: string, icon: Toast['icon'] = 'info'): void {
    this.current.set({ id: ++this.counter, text, icon });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.current.set(null), 2600);
  }

  dismiss(): void {
    clearTimeout(this.timer);
    this.current.set(null);
  }
}
