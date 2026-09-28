import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from '../shared/icon';

/** The transient confirmation raised by ToastService. */
@Component({
  selector: 'app-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (toasts.toast(); as item) {
      <output class="toast" [attr.data-id]="item.id" (click)="toasts.dismiss()">
        <app-icon [name]="item.icon" [size]="15" />
        {{ item.text }}
      </output>
    }
  `,
  styles: `
    :host {
      position: fixed;
      left: 50%;
      bottom: var(--sp-5);
      transform: translateX(-50%);
      z-index: 90;
      pointer-events: none;
      padding-inline: var(--sp-4);
      max-width: 100%;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: 0.6rem 1rem;
      border-radius: 99px;
      border: 1px solid var(--border-strong);
      background: var(--card-fill);
      box-shadow: var(--shadow-lg), inset 0 1px 0 var(--hi);
      color: var(--ink);
      font-size: var(--text-sm);
      font-weight: 550;
      white-space: nowrap;
      pointer-events: auto;
      cursor: pointer;
      animation: rise 320ms var(--ease-spring) both;
    }

    app-icon {
      color: var(--accent);
      flex: none;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  `,
})
export class Toasts {
  protected readonly toasts = inject(ToastService);
}

/**
 * The keyboard map, opened with `?`.
 *
 * Every shortcut here already worked; without somewhere to read them, only the
 * reader who tries `/` or Ctrl+K by habit ever finds out.
 */
@Component({
  selector: 'app-shortcuts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (ui.shortcutsOpen()) {
      <div class="scrim" (click)="ui.closeShortcuts()">
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          (click)="$event.stopPropagation()"
        >
          <header>
            <h2>Keyboard shortcuts</h2>
            <button type="button" class="icon-btn" (click)="ui.closeShortcuts()" aria-label="Close">
              <app-icon name="close" [size]="17" />
            </button>
          </header>

          <dl>
            @for (row of rows; track row.keys) {
              <div>
                <dt>
                  @for (key of row.keys.split(' '); track $index) {
                    <kbd class="kbd">{{ key }}</kbd>
                  }
                </dt>
                <dd>{{ row.does }}</dd>
              </div>
            }
          </dl>
        </div>
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      z-index: 95;
      display: grid;
      place-items: center;
      padding: var(--sp-4);
      background: color-mix(in srgb, var(--bg) 62%, transparent);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: fade 160ms var(--ease) both;
    }

    .panel {
      width: min(100%, 460px);
      max-height: 80vh;
      overflow-y: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-strong);
      background: var(--card-fill);
      box-shadow: var(--shadow-lg), inset 0 1px 0 var(--hi);
      padding: var(--sp-5);
      animation: pop 260ms var(--ease-spring) both;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-3);
      margin-bottom: var(--sp-4);
    }

    h2 {
      font-size: var(--text-lg);
    }

    dl {
      display: grid;
      gap: 1px;
    }

    dl > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      padding: 0.5rem var(--sp-2);
      border-radius: var(--radius-sm);
    }

    dl > div:hover {
      background: var(--surface-2);
    }

    dt {
      display: flex;
      gap: 0.25rem;
      flex: none;
      order: 2;
    }

    dd {
      color: var(--ink-2);
      font-size: var(--text-sm);
      margin: 0;
    }

    @keyframes fade {
      from {
        opacity: 0;
      }
    }

    @keyframes pop {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }
    }
  `,
})
export class Shortcuts {
  protected readonly ui = inject(UiService);

  protected readonly rows = [
    { keys: 'Ctrl K', does: 'Open search and commands' },
    { keys: '/', does: 'Jump to the search box' },
    { keys: '?', does: 'Show this list' },
    { keys: 'Esc', does: 'Close whatever is open' },
    { keys: 'J', does: 'Next topic in this stage' },
    { keys: 'K', does: 'Previous topic in this stage' },
    { keys: 'B', does: 'Toggle the sidebar' },
    { keys: 'T', does: 'Switch light and dark' },
  ];

  /** `?` anywhere opens the map; Escape closes it. */
  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    const typing =
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
    if (typing) return;

    if (event.key === '?') {
      event.preventDefault();
      this.ui.toggleShortcuts();
    } else if (event.key === 'Escape' && this.ui.shortcutsOpen()) {
      this.ui.closeShortcuts();
    }
  }
}
