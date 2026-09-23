import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppearanceService } from './core/services/appearance.service';
import { UiService } from './core/services/ui.service';
import { AppearancePanel } from './layout/appearance-panel';
import { BackToTop, ReadingProgress } from './layout/chrome';
import { CommandPalette } from './layout/command-palette';
import { Footer } from './layout/footer';
import { Sidebar } from './layout/sidebar';
import { Topbar } from './layout/topbar';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    Topbar,
    Sidebar,
    AppearancePanel,
    CommandPalette,
    Footer,
    ReadingProgress,
    BackToTop,
  ],
  template: `
    <a class="skip-link" href="#main" (click)="focusMain($event)">Skip to content</a>

    <app-topbar />
    <app-reading-progress />
    <app-appearance-panel />
    <app-command-palette />

    <div class="app-shell" [attr.data-sidebar]="ui.sidebarOpen() ? 'shown' : 'hidden'">
      <app-sidebar class="sidebar" [class.open]="ui.sidebarOpen()" />

      @if (ui.sidebarOpen() && !ui.isWide()) {
        <div class="sidebar-scrim" (click)="ui.closeSidebar()"></div>
      }

      <div class="app-main">
        <main id="main" tabindex="-1">
          <router-outlet />
        </main>
        <app-footer />
      </div>
    </div>

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
  protected readonly ui = inject(UiService);

  // Instantiated here so the stored appearance applies for the whole session.
  private readonly appearance = inject(AppearanceService);

  /**
   * `<base href>` would turn a bare `#main` into a navigation back to the
   * landing page, so the skip link moves focus itself.
   */
  protected focusMain(event: Event): void {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }
}
