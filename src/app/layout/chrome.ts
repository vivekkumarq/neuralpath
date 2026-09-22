import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { Icon } from '../shared/icon';

/** A one-pixel reading-progress bar under the header. */
@Component({
  selector: 'app-reading-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [style.transform]="'scaleX(' + ratio() + ')'"></span>`,
  styles: `
    :host {
      position: fixed;
      top: var(--header-h);
      left: 0;
      right: 0;
      height: 2px;
      z-index: 55;
      pointer-events: none;
    }

    span {
      display: block;
      height: 100%;
      background: var(--accent);
      transform-origin: left;
      transition: transform 90ms linear;
    }
  `,
})
export class ReadingProgress {
  protected readonly ratio = signal(0);

  @HostListener('document:scroll')
  protected onScroll(): void {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    this.ratio.set(scrollable <= 0 ? 0 : Math.min(1, doc.scrollTop / scrollable));
  }
}

/** Back to top, which appears once there is somewhere to go back to. */
@Component({
  selector: 'app-back-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (visible()) {
      <button type="button" class="btn" (click)="top()" aria-label="Back to top">
        <app-icon name="up" [size]="16" />
      </button>
    }
  `,
  styles: `
    :host {
      position: fixed;
      right: var(--sp-4);
      bottom: var(--sp-4);
      z-index: 50;
    }

    button {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 99px;
      box-shadow: var(--shadow);
      animation: fade 200ms var(--ease);
    }

    @keyframes fade {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class BackToTop {
  protected readonly visible = signal(false);

  @HostListener('document:scroll')
  protected onScroll(): void {
    this.visible.set(window.scrollY > 900);
  }

  protected top(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
