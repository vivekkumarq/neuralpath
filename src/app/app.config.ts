import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { AppTitleStrategy } from './core/services/app-title.strategy';
import { IdlePreload } from './core/services/idle-preload';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Route params arrive as component inputs, so pages need no ActivatedRoute
      // plumbing for `:module` and `:slug`.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // A GPU-composited cross-fade where the browser supports it; elsewhere the
      // navigation is simply instant, as before.
      withViewTransitions({ skipInitialTransition: true }),
      // Warm the remaining route chunks in idle time, so every navigation
      // after the first is instant rather than a fetch the reader waits on.
      withPreloading(IdlePreload),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
