import { Pipe, PipeTransform } from '@angular/core';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ESCAPES[char]);
}

/**
 * A deliberately tiny inline-markdown renderer.
 *
 * Content is authored in TypeScript and needs only four inline forms, so the
 * whole feature is four regexes instead of a markdown dependency. Everything is
 * HTML-escaped first, and the output is still passed through Angular's
 * sanitiser, so only the generated `code`, `strong`, `em` and `a` survive.
 */
@Pipe({ name: 'inline' })
export class InlineMarkdown implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';

    return escapeHtml(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  }
}
