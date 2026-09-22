import { Injectable, signal } from '@angular/core';
import { Level } from '../models/content.models';

export type ResultKind = 'topic' | 'module' | 'question' | 'project' | 'term' | 'resource';

export interface SearchResult {
  kind: ResultKind;
  title: string;
  description: string;
  category: string;
  href: string;
  external?: boolean;
  level?: Level;
  /** Higher is better; set during scoring. */
  score?: number;
}

interface IndexEntry extends SearchResult {
  haystack: string;
  /** Title and category, which count double when matched. */
  strong: string;
}

/**
 * Client-side search across everything on the site.
 *
 * The content data is several hundred kilobytes, so it is imported dynamically
 * the first time search is used rather than shipped in the initial bundle. The
 * index itself is about a thousand short records — small enough that a linear
 * scan per keystroke is imperceptible, and a search dependency would be dead
 * weight.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private index: IndexEntry[] = [];
  private loading = false;

  /** Flips once the index exists, so callers can re-run a pending query. */
  readonly ready = signal(false);

  /** Starts loading the index; safe to call repeatedly. */
  preload(): void {
    if (this.loading || this.ready()) return;
    this.loading = true;
    void this.build();
  }

  search(query: string, limit = 24): SearchResult[] {
    if (!this.ready()) {
      this.preload();
      return [];
    }

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 1);
    if (terms.length === 0) return [];

    const results: SearchResult[] = [];

    for (const entry of this.index) {
      let score = 0;
      let matchedAll = true;

      for (const term of terms) {
        const inStrong = entry.strong.includes(term);
        const inBody = entry.haystack.includes(term);
        if (!inStrong && !inBody) {
          matchedAll = false;
          break;
        }
        score += inStrong ? 10 : 3;
        if (entry.strong.startsWith(term)) score += 8;
      }

      if (!matchedAll) continue;
      // A short title matching the query is usually the thing being looked for.
      score += Math.max(0, 40 - entry.title.length) / 10;
      results.push({ ...entry, score });
    }

    return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit);
  }

  private async build(): Promise<void> {
    const [{ MODULES, allTopics }, { QUESTIONS }, { GLOSSARY }, { PROJECTS }, { RESOURCES }] =
      await Promise.all([
        import('../../data/curriculum'),
        import('../../data/interview'),
        import('../../data/glossary'),
        import('../../data/projects'),
        import('../../data/resources'),
      ]);

    const entries: IndexEntry[] = [];

    for (const module of MODULES) {
      entries.push(
        this.entry({
          kind: 'module',
          title: module.title,
          description: module.tagline,
          category: `Stage ${module.stage}`,
          href: `/learn/${module.slug}`,
          level: module.level,
        }),
      );
    }

    for (const topic of allTopics()) {
      const module = MODULES.find((entry) => entry.slug === topic.module);
      entries.push(
        this.entry(
          {
            kind: 'topic',
            title: topic.title,
            description: topic.summary,
            category: module?.title ?? 'Topic',
            href: `/learn/${topic.module}/${topic.slug}`,
            level: topic.level,
          },
          [topic.why, ...(topic.tags ?? []), ...topic.outcomes].join(' '),
        ),
      );
    }

    for (const question of QUESTIONS) {
      entries.push(
        this.entry(
          {
            kind: 'question',
            title: question.question,
            description: question.answer,
            category: question.category,
            href: `/interview?q=${question.id}`,
            level: question.difficulty,
          },
          question.explanation ?? '',
        ),
      );
    }

    for (const project of PROJECTS) {
      entries.push(
        this.entry(
          {
            kind: 'project',
            title: project.title,
            description: project.summary,
            category: 'Project',
            href: `/projects/${project.slug}`,
            level: project.level,
          },
          [...project.concepts, ...project.stack].join(' '),
        ),
      );
    }

    for (const term of GLOSSARY) {
      entries.push(
        this.entry(
          {
            kind: 'term',
            title: term.term,
            description: term.simple,
            category: term.category,
            href: `/glossary?t=${term.slug}`,
          },
          term.technical,
        ),
      );
    }

    for (const resource of RESOURCES) {
      entries.push(
        this.entry({
          kind: 'resource',
          title: resource.label,
          description: resource.note,
          category: resource.category,
          href: resource.url,
          external: true,
        }),
      );
    }

    this.index = entries;
    this.ready.set(true);
  }

  private entry(result: SearchResult, extra = ''): IndexEntry {
    return {
      ...result,
      strong: `${result.title} ${result.category}`.toLowerCase(),
      haystack: `${result.title} ${result.description} ${result.category} ${extra}`.toLowerCase(),
    };
  }
}
