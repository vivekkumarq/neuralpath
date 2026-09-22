import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { MODULES, allTopics } from '../../data/curriculum';

const KEY_DONE = 'progress';
const KEY_QUIZ = 'quiz';
const KEY_PROFILE = 'profile';
const KEY_RECENT = 'recent';

export interface RecentEntry {
  slug: string;
  title: string;
  at: number;
}

export interface ModuleProgress {
  slug: string;
  title: string;
  short: string;
  done: number;
  total: number;
  percent: number;
}

/**
 * Learning state: which topics are finished, which quizzes were answered, the
 * chosen learner profile and the last topics opened. All of it is local to the
 * browser — there is no account and nothing leaves the device.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly storage = inject(StorageService);

  private readonly done = signal<string[]>(this.storage.read<string[]>(KEY_DONE, []));
  /** Quiz id -> index of the option chosen. */
  private readonly quiz = signal<Record<string, number>>(
    this.storage.read<Record<string, number>>(KEY_QUIZ, {}),
  );
  private readonly profile = signal<string>(this.storage.read<string>(KEY_PROFILE, ''));
  private readonly recent = signal<RecentEntry[]>(this.storage.read<RecentEntry[]>(KEY_RECENT, []));

  readonly completed = this.done.asReadonly();
  readonly answers = this.quiz.asReadonly();
  readonly activeProfile = this.profile.asReadonly();
  readonly recentTopics = this.recent.asReadonly();

  readonly completedCount = computed(() => this.done().length);

  readonly overallPercent = computed(() => {
    const total = allTopics().length;
    return total === 0 ? 0 : Math.round((this.done().length / total) * 100);
  });

  readonly byModule = computed<ModuleProgress[]>(() => {
    const done = new Set(this.done());
    return MODULES.map((module) => {
      const total = module.topics.length;
      const count = module.topics.filter((topic) => done.has(topic.slug)).length;
      return {
        slug: module.slug,
        title: module.title,
        short: module.short,
        done: count,
        total,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    });
  });

  /** The first unfinished topic in curriculum order — "what to read next". */
  readonly nextTopic = computed(() => {
    const done = new Set(this.done());
    return allTopics().find((topic) => !done.has(topic.slug));
  });

  readonly currentStage = computed(() => {
    const next = this.nextTopic();
    return MODULES.find((module) => module.slug === next?.module) ?? MODULES[MODULES.length - 1];
  });

  isDone(slug: string): boolean {
    return this.done().includes(slug);
  }

  toggle(slug: string): void {
    this.done.update((list) =>
      list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug],
    );
    this.storage.write(KEY_DONE, this.done());
  }

  markVisited(slug: string, title: string): void {
    this.recent.update((list) =>
      [{ slug, title, at: Date.now() }, ...list.filter((entry) => entry.slug !== slug)].slice(0, 8),
    );
    this.storage.write(KEY_RECENT, this.recent());
  }

  answerQuiz(id: string, choice: number): void {
    this.quiz.update((map) => ({ ...map, [id]: choice }));
    this.storage.write(KEY_QUIZ, this.quiz());
  }

  answerFor(id: string): number | undefined {
    return this.quiz()[id];
  }

  setProfile(id: string): void {
    this.profile.set(id);
    this.storage.write(KEY_PROFILE, id);
  }

  reset(): void {
    this.done.set([]);
    this.quiz.set({});
    this.recent.set([]);
    this.profile.set('');
    [KEY_DONE, KEY_QUIZ, KEY_RECENT, KEY_PROFILE].forEach((key) => this.storage.remove(key));
  }
}
