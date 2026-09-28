import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Fetches the remaining route chunks once the browser is idle.
 *
 * Every page here is lazily loaded, which keeps the first paint small but
 * makes the *second* navigation pay for a round trip — the one moment a
 * reader notices, because they have already decided where they are going.
 * Waiting for idle rather than preloading eagerly means the fetches never
 * compete with the first render; the timeout stops a permanently busy tab
 * from starving them entirely.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreload implements PreloadingStrategy {
  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (typeof requestIdleCallback === 'undefined') return load();

    return new Observable((subscriber) => {
      const handle = requestIdleCallback(() => load().subscribe(subscriber), { timeout: 3000 });
      return () => cancelIdleCallback(handle);
    });
  }
}