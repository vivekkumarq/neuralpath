import { GlossaryTerm } from '../core/models/content.models';
import { coreTerms } from './glossary/core.terms';
import { llmTerms } from './glossary/llm.terms';

/** Alphabetical, so the page needs no sorting pass. */
export const GLOSSARY: GlossaryTerm[] = [...coreTerms, ...llmTerms].sort((a, b) =>
  a.term.localeCompare(b.term),
);

export const GLOSSARY_CATEGORIES: string[] = [
  ...new Set(GLOSSARY.map((term) => term.category)),
].sort();

export function termBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((term) => term.slug === slug);
}
