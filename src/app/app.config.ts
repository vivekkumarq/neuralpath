import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { AppTitleStrategy } from './core/services/app-title.strategy';

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
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
