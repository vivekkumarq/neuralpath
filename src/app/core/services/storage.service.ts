import { Injectable } from '@angular/core';

/**
 * The single gateway to `localStorage`.
 *
 * Components never touch `localStorage` directly: keys are namespaced and
 * versioned here (`neuralpath:v1:progress`, ...) so a future change of shape
 * cannot corrupt data written by an earlier build, and a browser with storage
 * disabled degrades to an in-memory map instead of throwing.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  static readonly NAMESPACE = 'neuralpath';
  static readonly VERSION = 'v1';

  private readonly prefix = `${StorageService.NAMESPACE}:${StorageService.VERSION}:`;
  private readonly memory = new Map<string, string>();

  /** False in private-mode browsers or any context without a usable Storage. */
  readonly available = this.probe();

  read<T>(name: string, fallback: T): T {
    const raw = this.available
      ? localStorage.getItem(this.prefix + name)
      : (this.memory.get(this.prefix + name) ?? null);

    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.remove(name);
      return fallback;
    }
  }

  write<T>(name: string, value: T): void {
    try {
      const raw = JSON.stringify(value);
      if (this.available) localStorage.setItem(this.prefix + name, raw);
      else this.memory.set(this.prefix + name, raw);
    } catch {
      // Quota exceeded or storage disabled — the value simply is not persisted.
    }
  }

  remove(name: string): void {
    this.memory.delete(this.prefix + name);
    if (this.available) localStorage.removeItem(this.prefix + name);
  }

  /** Removes every NeuralPath key, leaving unrelated site data untouched. */
  clearAll(): void {
    this.memory.clear();
    if (!this.available) return;
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) doomed.push(key);
    }
    doomed.forEach((key) => localStorage.removeItem(key));
  }

  private probe(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const key = `${this.prefix}__probe`;
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}
