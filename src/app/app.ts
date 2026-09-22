import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { BackToTop, ReadingProgress } from './layout/chrome';
import { CommandPalette } from './layout/command-palette';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { MobileDrawer } from './layout/mobile-drawer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, MobileDrawer, CommandPalette, Footer, ReadingProgress, BackToTop],
  template: `
    <a class="skip-link" href="#main" (click)="focusMain($event)">Skip to content</a>

    <app-header />
    <app-reading-progress />
    <app-mobile-drawer />
    <app-command-palette />

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>

    <app-footer />
    <app-back-to-top />
  `,
  styles: `
    main {
      display: block;
      min-height: 60vh;
    }

    main:focus {
      outline: none;
    }
  `,
})
export class App {
  // Instantiated here so the stored theme applies for the whole session.
  private readonly theme = inject(ThemeService);

  /**
   * `<base href>` would turn a bare `#main` into a navigation back to the
   * landing page, so the skip link moves focus itself.
   */
  protected focusMain(event: Event): void {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }
}
