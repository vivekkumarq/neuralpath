import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Icon } from './icon';
import { escapeHtml } from './markdown.pipe';

const KEYWORDS: Record<string, string[]> = {
  python: [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
    'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'False', 'try', 'while',
    'with', 'yield', 'self',
  ],
  bash: [
    'if', 'then', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'case', 'esac', 'function',
    'export', 'source', 'return', 'cd', 'echo',
  ],
  json: ['true', 'false', 'null'],
  text: [],
};

const BUILTINS = [
  'print', 'len', 'range', 'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'bool', 'sum',
  'min', 'max', 'zip', 'enumerate', 'sorted', 'abs', 'round', 'open', 'isinstance', 'super',
  'bytes', 'type',
];

/** Comments and string literals, matched before anything else. */
const LITERALS = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|#[^\n]*)/;

/**
 * A code block with copy-to-clipboard and lightweight highlighting.
 *
 * The highlighter is a two-stage regex pass rather than a syntax-highlighting
 * library: strings and comments are extracted first so keywords inside them are
 * left alone, then keywords, builtins, numbers and call sites are marked in
 * what remains. It is a few hundred bytes instead of a few hundred kilobytes,
 * and the accuracy is sufficient for short teaching snippets.
 */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <figure class="code-block">
      <figcaption class="code-head">
        <span>{{ caption() || lang() }}</span>
        <button
          type="button"
          class="btn btn-sm btn-ghost"
          (click)="copy()"
          [attr.aria-label]="copied() ? 'Code copied' : 'Copy code to clipboard'"
        >
          <app-icon [name]="copied() ? 'check' : 'copy'" [size]="14" />
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </figcaption>
      <pre><code [innerHTML]="highlighted()"></code></pre>
    </figure>
  `,
  styles: `
    figure {
      margin: 0;
    }

    button {
      color: var(--ink-3);
    }

    button:hover {
      color: var(--accent);
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly lang = input<string>('python');
  readonly caption = input<string>('');

  protected readonly copied = signal(false);

  protected readonly highlighted = computed(() => highlight(this.code(), this.lang()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      // Clipboard access denied (insecure context or permission): the code is
      // selectable, so there is nothing useful to report.
    }
  }
}

function highlight(code: string, lang: string): string {
  const keywords = KEYWORDS[lang] ?? KEYWORDS['python'];
  const pattern = new RegExp(LITERALS.source, 'g');

  return code
    .split(pattern)
    .map((part, index) => {
      // Odd indices are the captured literals: strings and comments.
      if (index % 2 === 1) {
        const cls = part.startsWith('#') ? 'tok-com' : 'tok-str';
        return `<span class="${cls}">${escapeHtml(part)}</span>`;
      }
      return highlightCode(part, keywords);
    })
    .join('');
}

function highlightCode(part: string, keywords: string[]): string {
  let out = escapeHtml(part);

  if (keywords.length > 0) {
    out = out.replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="tok-key">$1</span>');
    out = out.replace(new RegExp(`\\b(${BUILTINS.join('|')})\\b(?=\\()`, 'g'), '<span class="tok-builtin">$1</span>');
  }

  out = out.replace(/\b(\d+\.?\d*(?:e-?\d+)?|0x[0-9a-f]+)\b/gi, '<span class="tok-num">$1</span>');

  // A bare identifier followed by "(" — but not one already inside a span.
  return out.replace(/\b([a-z_][a-z0-9_]*)\(/gi, (match, name: string) =>
    match.includes('<') ? match : `<span class="tok-fn">${name}</span>(`,
  );
}
