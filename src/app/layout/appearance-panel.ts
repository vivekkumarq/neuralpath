import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppearanceService, FontOption } from '../core/services/appearance.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from '../shared/icon';

/**
 * Theme, typeface and text size in one panel — a popover on a desktop, a
 * bottom sheet on a phone.
 *
 * Every typeface renders its own name in its own face, so the list is a
 * specimen sheet rather than a dropdown of strings.
 */
@Component({
  selector: 'app-appearance-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (ui.appearanceOpen()) {
      <div class="scrim" (click)="ui.closeAppearance()"></div>

      <div class="panel" role="dialog" aria-label="Appearance">
        <header>
          <span>Appearance</span>
          <button type="button" class="icon-btn" (click)="ui.closeAppearance()" aria-label="Close">
            <app-icon name="close" [size]="15" />
          </button>
        </header>

        <div class="body">
          <p class="group-head">Theme <span>{{ appearance.themes.length }}</span></p>
          <div class="themes">
            @for (theme of appearance.themes; track theme.id) {
              <button
                type="button"
                class="theme"
                [class.on]="appearance.theme() === theme.id"
                (click)="appearance.setTheme(theme.id)"
                [attr.aria-pressed]="appearance.theme() === theme.id"
              >
                <span class="swatch" [style.background]="theme.bg">
                  <i [style.background]="theme.accent"></i>
                </span>
                {{ theme.name }}
              </button>
            }
          </div>

          <p class="group-head">Text size</p>
          <div class="sizes">
            @for (size of appearance.sizes; track size.id) {
              <button
                type="button"
                [class.on]="appearance.size() === size.id"
                (click)="appearance.setSize(size.id)"
                [attr.aria-pressed]="appearance.size() === size.id"
              >
                {{ size.name }}
              </button>
            }
          </div>

          <p class="group-head">Typeface <span>{{ appearance.fonts.length }}</span></p>
          @for (category of categories; track category.id) {
            <p class="sub-head">{{ category.label }}</p>
            <div class="fonts">
              @for (font of fontsIn(category.id); track font.id) {
                <button
                  type="button"
                  class="font"
                  [class.on]="appearance.font() === font.id"
                  [style.font-family]="font.stack"
                  (click)="appearance.setFont(font.id)"
                  [attr.aria-pressed]="appearance.font() === font.id"
                >
                  <span class="name">{{ font.name }}</span>
                  <small>{{ font.note }}</small>
                </button>
              }
            </div>
          }

          <p class="group-head">Reading</p>
          <button
            type="button"
            class="wide-toggle"
            [class.on]="appearance.focusMode()"
            (click)="appearance.toggleFocus()"
            [attr.aria-pressed]="appearance.focusMode()"
          >
            <app-icon name="focus" [size]="15" />
            <span>
              Focus mode
              <small>Hide the navigation and centre the article</small>
            </span>
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 90;
      background: rgba(0, 0, 0, 0.35);
    }

    .panel {
      position: fixed;
      z-index: 95;
      top: calc(var(--header-h) + 6px);
      right: var(--sp-3);
      width: 340px;
      max-height: calc(100vh - var(--header-h) - 24px);
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: hidden;
      animation: pop 160ms var(--ease-out) both;
    }

    @keyframes pop {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.985);
      }
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-4);
      border-bottom: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    .body {
      overflow-y: auto;
      padding: var(--sp-4);
    }

    .group-head {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-3);
      margin-bottom: var(--sp-2);
    }

    .group-head + * {
      margin-bottom: var(--sp-5);
    }

    .group-head span {
      color: var(--accent);
    }

    .sub-head {
      font-size: 0.65rem;
      color: var(--ink-3);
      margin: 0 0 var(--sp-2);
      text-transform: capitalize;
    }

    .themes {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--sp-2);
    }

    .theme {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 0.4rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      color: var(--ink-2);
      text-align: left;
    }

    .theme:hover {
      border-color: var(--accent-line);
      color: var(--ink);
    }

    .theme.on {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--accent);
    }

    .swatch {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      border: 1px solid var(--border-strong);
      display: inline-flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 3px;
      flex: none;
    }

    .swatch i {
      width: 7px;
      height: 7px;
      border-radius: 99px;
    }

    .sizes {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--sp-2);
    }

    .sizes button {
      padding: 0.4rem 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      color: var(--ink-2);
    }

    .sizes button:hover {
      border-color: var(--accent-line);
    }

    .sizes button.on {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--accent);
    }

    .fonts {
      display: grid;
      gap: 2px;
      margin-bottom: var(--sp-4);
    }

    .font {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.4rem 0.55rem;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      text-align: left;
      color: var(--ink-2);
    }

    .font:hover {
      background: var(--surface-2);
      color: var(--ink);
    }

    .font.on {
      border-color: var(--accent-line);
      background: var(--accent-soft);
      color: var(--accent);
    }

    .font .name {
      font-size: var(--text-base);
    }

    .font small {
      font-family: var(--font-ui);
      font-size: 0.65rem;
      color: var(--ink-3);
    }

    .wide-toggle {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      width: 100%;
      padding: var(--sp-3);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--ink-2);
      text-align: left;
    }

    .wide-toggle.on {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: var(--accent);
    }

    .wide-toggle span {
      display: flex;
      flex-direction: column;
      font-size: var(--text-sm);
    }

    .wide-toggle small {
      font-size: 0.65rem;
      color: var(--ink-3);
    }

    /* On a phone the popover becomes a bottom sheet. */
    @media (max-width: 640px) {
      .panel {
        top: auto;
        right: 0;
        left: 0;
        bottom: 0;
        width: auto;
        max-height: 82vh;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        animation: sheet 220ms var(--ease-out) both;
      }

      @keyframes sheet {
        from {
          transform: translateY(100%);
        }
      }
    }
  `,
})
export class AppearancePanel {
  protected readonly ui = inject(UiService);
  protected readonly appearance = inject(AppearanceService);

  protected readonly categories = [
    { id: 'sans' as const, label: 'Sans' },
    { id: 'serif' as const, label: 'Serif' },
    { id: 'mono' as const, label: 'Monospace' },
  ];

  protected fontsIn(category: FontOption['category']): FontOption[] {
    return this.appearance.fonts.filter((font) => font.category === category);
  }
}
