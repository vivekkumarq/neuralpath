import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/**
 * Fades a section in as it enters the viewport.
 *
 * One IntersectionObserver per element, disconnected after the first reveal, so
 * nothing keeps observing once the page is read. Under `prefers-reduced-motion`
 * the element is simply shown — the class is never added, so there is no
 * transition to interrupt.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.will-reveal]': 'armed',
    '[style.--reveal-delay]': 'delay() + "ms"',
  },
})
export class Reveal implements OnDestroy {
  /**
   * Stagger, in milliseconds, for items revealed as a group. The transform lets
   * the directive be applied as a bare attribute as well as a binding.
   */
  readonly delay = input(0, {
    alias: 'appReveal',
    transform: (value: number | string) => Number(value) || 0,
  });

  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private failsafe?: ReturnType<typeof setTimeout>;

  protected armed = false;

  constructor() {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') return;

    // Anything already on screen when the page loads is shown immediately.
    // Fading in content the reader is already looking at is noise, and it
    // leaves the top of the page blank in screenshots, print and any context
    // where the transition never runs.
    const box = this.host.nativeElement.getBoundingClientRect();
    if (box.top < window.innerHeight) return;

    this.armed = true;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.show();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    this.observer.observe(this.host.nativeElement);

    // Safety net: content must never stay hidden because an observer did not
    // fire (a detached container, a browser quirk, a restored back/forward
    // page). After this, the element shows whether or not it was seen.
    this.failsafe = setTimeout(() => this.show(), 1600);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.failsafe);
  }

  private show(): void {
    this.host.nativeElement.classList.add('is-revealed');
    this.observer?.disconnect();
  }
}
