import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type BookmarkKind = 'topic' | 'question' | 'project' | 'resource' | 'term';

export interface Bookmark {
  kind: BookmarkKind;
  /** Unique within its kind. */
  id: string;
  title: string;
  /** Router path, or an absolute URL for an external resource. */
  href: string;
  note?: string;
  at: number;
}

const KEY = 'bookmarks';

/** Saved items, grouped by kind on the bookmarks page. */
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly storage = inject(StorageService);
  private readonly items = signal<Bookmark[]>(this.storage.read<Bookmark[]>(KEY, []));

  readonly all = this.items.asReadonly();
  readonly count = computed(() => this.items().length);

  has(kind: BookmarkKind, id: string): boolean {
    return this.items().some((item) => item.kind === kind && item.id === id);
  }

  toggle(entry: Omit<Bookmark, 'at'>): void {
    const exists = this.has(entry.kind, entry.id);
    this.items.update((list) =>
      exists
        ? list.filter((item) => !(item.kind === entry.kind && item.id === entry.id))
        : [{ ...entry, at: Date.now() }, ...list],
    );
    this.storage.write(KEY, this.items());
  }

  ofKind(kind: BookmarkKind): Bookmark[] {
    return this.items().filter((item) => item.kind === kind);
  }

  clear(): void {
    this.items.set([]);
    this.storage.remove(KEY);
  }
}
