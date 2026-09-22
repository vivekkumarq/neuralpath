import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export const SITE_NAME = 'NeuralPath';
export const SITE_TAGLINE = 'AI/ML Engineering by Vivek Kumar';
export const SITE_URL = 'https://vivekkumarq.github.io/neuralpath';
export const GITHUB_URL = 'https://github.com/vivekkumarq/neuralpath';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/vivekkumarq';

const DEFAULT_DESCRIPTION =
  'A structured path from machine learning fundamentals to modern LLM and AI engineering: ' +
  'roadmap, concepts, interactive diagrams, projects and interview preparation.';

/** Keeps document title and social metadata in step with the active route. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(pageTitle: string | undefined, description = DEFAULT_DESCRIPTION, path = ''): void {
    const fullTitle = pageTitle ? `${pageTitle} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
    const url = SITE_URL + path;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    if (typeof document === 'undefined') return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }
}
