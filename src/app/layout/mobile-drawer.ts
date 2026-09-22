import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PRIMARY_NAV, SECONDARY_NAV } from '../data/navigation';
import { GITHUB_URL, LINKEDIN_URL } from '../core/services/seo.service';
import { ProgressService } from '../core/services/progress.service';
import { ThemeService } from '../core/services/theme.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from '../shared/icon';

/**
 * The mobile navigation drawer.
 *
 * Not a shrunken desktop menu: it leads with progress and the next topic,
 * because on a phone the reader is usually resuming rather than browsing.
 */
@Component({
  selector: 'app-mobile-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    @if (ui.drawerOpen()) {
      <div class="scrim" (click)="ui.closeDrawer()"></div>

      <nav class="drawer" aria-label="Navigation">
        <div class="resume">
          <p class="eyebrow">Your progress</p>
          <div class="bar bar-lg"><span [style.width.%]="progress.overallPercent()"></span></div>
          <p class="dim">
            {{ progress.overallPercent() }}% · {{ progress.completedCount() }} topics done
          </p>
          @if (progress.nextTopic(); as next) {
            <a
              class="btn btn-primary btn-sm"
              [routerLink]="['/learn', next.module, next.slug]"
              (click)="ui.closeDrawer()"
            >
              Continue: {{ next.title }}
              <app-icon name="arrow-right" [size]="14" />
            </a>
          }
        </div>

        <ul role="list">
          @for (link of primary; track link.path) {
            <li>
              <a [routerLink]="link.path" routerLinkActive="active" (click)="ui.closeDrawer()">
                <app-icon [name]="link.icon" [size]="17" />
                <span>
                  <strong>{{ link.label }}</strong>
                  <small>{{ link.hint }}</small>
                </span>
              </a>
            </li>
          }
        </ul>

        <ul role="list" class="secondary">
          @for (link of secondary; track link.path) {
            <li>
              <a [routerLink]="link.path" routerLinkActive="active" (click)="ui.closeDrawer()">
                <app-icon [name]="link.icon" [size]="17" />
                <span>
                  <strong>{{ link.label }}</strong>
                  <small>{{ link.hint }}</small>
                </span>
              </a>
            </li>
          }
        </ul>

        <div class="foot">
          <button type="button" class="btn btn-sm" (click)="theme.toggle()">
            <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="14" />
            {{ theme.isDark() ? 'Light' : 'Dark' }}
          </button>
          <a class="btn btn-sm" [href]="github" target="_blank" rel="noopener">
            <app-icon name="github" [size]="14" />
            GitHub
          </a>
          <a class="btn btn-sm" [href]="linkedin" target="_blank" rel="noopener">
            <app-icon name="linkedin" [size]="14" />
            LinkedIn
          </a>
        </div>
      </nav>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 90;
      background: rgba(0, 0, 0, 0.5);
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      width: min(340px, 88vw);
      background: var(--bg-soft);
      border-left: 1px solid var(--border);
      padding: calc(var(--header-h) + var(--sp-4)) var(--sp-4) var(--sp-5);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
      animation: slide 220ms var(--ease);
    }

    @keyframes slide {
      from {
        transform: translateX(100%);
      }
      to {
        transform: none;
      }
    }

    .resume {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      padding: var(--sp-4);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }

    .resume .btn {
      margin-top: var(--sp-2);
      justify-content: space-between;
    }

    ul {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 2px;
    }

    li {
      margin: 0;
    }

    /* Scoped to the nav lists: an unscoped anchor rule would out-specify the
     * global button classes and repaint the primary button in the resume card. */
    ul a {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.55rem 0.6rem;
      border-radius: var(--radius);
      text-decoration: none;
      color: var(--ink-2);
    }

    ul a.active {
      background: var(--accent-soft);
      color: var(--accent);
    }

    ul a span {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    strong {
      font-size: var(--text-base);
      font-weight: 500;
    }

    small {
      font-size: var(--text-xs);
      color: var(--ink-3);
    }

    .secondary {
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
    }

    .foot {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
      margin-top: auto;
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
    }
  `,
})
export class MobileDrawer {
  protected readonly ui = inject(UiService);
  protected readonly theme = inject(ThemeService);
  protected readonly progress = inject(ProgressService);

  protected readonly primary = PRIMARY_NAV;
  protected readonly secondary = SECONDARY_NAV;
  protected readonly github = GITHUB_URL;
  protected readonly linkedin = LINKEDIN_URL;
}
