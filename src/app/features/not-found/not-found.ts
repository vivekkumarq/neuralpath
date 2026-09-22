import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { PRIMARY_NAV } from '../../data/navigation';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <p class="eyebrow">404</p>
      <h1>That page does not exist</h1>
      <p class="lede">
        The link may be out of date, or the topic may have moved. Search for what you were after, or
        pick a section.
      </p>

      <div class="row">
        <button type="button" class="btn btn-primary" (click)="ui.openPalette()">
          <app-icon name="search" [size]="15" />
          Search everything
        </button>
        <a class="btn" routerLink="/">Home</a>
      </div>

      <div class="grid cols-3 links">
        @for (link of nav; track link.path) {
          <a class="card card-sm card-link" [routerLink]="link.path">
            <strong>{{ link.label }}</strong>
            <p>{{ link.hint }}</p>
          </a>
        }
      </div>
    </div>
  `,
  styles: `
    h1 {
      margin: var(--sp-2) 0 var(--sp-3);
    }

    .row {
      margin-top: var(--sp-5);
    }

    .links {
      margin-top: var(--sp-7);
    }

    .links strong {
      font-weight: 600;
    }

    .links p {
      font-size: var(--text-sm);
      margin-top: 0.3rem;
    }
  `,
})
export class NotFound {
  protected readonly ui = inject(UiService);
  protected readonly nav = PRIMARY_NAV;
}
