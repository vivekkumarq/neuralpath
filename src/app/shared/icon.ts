import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * One inline SVG component for the whole interface.
 *
 * Icons are stroked paths on a 24x24 grid using `currentColor`, so they inherit
 * text colour and need no theme-specific assets. A sprite file would be another
 * request for a few hundred bytes of path data.
 */
const PATHS: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.2-4.2',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  github:
    'M9 19c-4 1.2-4-2.2-5.5-2.8M15 21v-3.4c0-1 .1-1.4-.5-2 2.3-.3 4.5-1.2 4.5-5.2a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-1.2-.3-3.8 1.4a9.4 9.4 0 0 0-5 0C6.4 3.7 5.2 4 5.2 4a3.7 3.7 0 0 0-.1 2.8A4 4 0 0 0 4 9.6c0 4 2.2 4.9 4.5 5.2-.6.6-.6 1.2-.5 2V21',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5 9 17.5 20 6.5',
  bookmark: 'M6 3h12v18l-6-4.5L6 21z',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  external: 'M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  book: 'M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2zM4 5v16',
  map: 'M9 3 3 6v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15',
  layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z',
  terminal: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9l2.5 3L8 15M13 15h3',
  link: 'M10 13a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.6-5.7l-1.2 1.1M14 11a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.6 18l1.2-1.1',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 8h.01',
  focus: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4',
  dice: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM9 9h.01M15 15h.01M12 12h.01',
  play: 'M7 4l12 8-12 8z',
  linkedin: 'M5 9v11M5 5.5h.01M10 20v-6a3 3 0 0 1 6 0v6M10 9.5V20',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  cpu: 'M7 7h10v10H7zM4 9V7a3 3 0 0 1 3-3h2M15 4h2a3 3 0 0 1 3 3v2M20 15v2a3 3 0 0 1-3 3h-2M9 20H7a3 3 0 0 1-3-3v-2',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  up: 'M12 19V5M6 11l6-6 6 6',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="weight()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(18);
  readonly weight = input(1.7);

  protected readonly path = computed(() => PATHS[this.name()] ?? PATHS['info']);
}
