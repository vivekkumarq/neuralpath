import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BookmarkKind, BookmarkService } from '../core/services/bookmark.service';
import { Icon } from './icon';

/** Save or unsave any record. State lives in `BookmarkService`. */
@Component({
  selector: 'app-bookmark-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button
      type="button"
      class="btn btn-sm"
      [attr.aria-pressed]="saved()"
      [attr.aria-label]="saved() ? 'Remove bookmark' : 'Save bookmark'"
      (click)="toggle()"
    >
      <app-icon name="bookmark" [size]="14" />
      @if (label()) {
        {{ saved() ? 'Saved' : 'Save' }}
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class BookmarkButton {
  readonly kind = input.required<BookmarkKind>();
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly href = input.required<string>();
  readonly label = input(true);

  private readonly bookmarks = inject(BookmarkService);

  protected readonly saved = computed(() => this.bookmarks.has(this.kind(), this.id()));

  protected toggle(): void {
    this.bookmarks.toggle({
      kind: this.kind(),
      id: this.id(),
      title: this.title(),
      href: this.href(),
    });
  }
}
