import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GITHUB_URL, LINKEDIN_URL } from '../core/services/seo.service';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo],
  template: `
    <footer class="app-footer">
      <div class="container inner">
        <div class="identity">
          <app-logo [byline]="false" />
          <p class="dim">
            Vivek Kumar — AI/ML Engineering Resource. A structured path from machine learning
            fundamentals to LLM and AI engineering.
          </p>
          <div class="social">
            <a [href]="github" target="_blank" rel="noopener" aria-label="GitHub">
              <app-icon name="github" [size]="16" />
              GitHub
            </a>
            <a [href]="linkedin" target="_blank" rel="noopener" aria-label="LinkedIn">
              <app-icon name="linkedin" [size]="16" />
              LinkedIn
            </a>
          </div>
        </div>

        <nav aria-label="Learn">
          <p class="eyebrow">Learn</p>
          <a routerLink="/roadmap">Roadmap</a>
          <a routerLink="/learn">All modules</a>
          <a routerLink="/now">What to learn now</a>
          <a routerLink="/dashboard">Progress</a>
        </nav>

        <nav aria-label="Practise">
          <p class="eyebrow">Practise</p>
          <a routerLink="/projects">Projects</a>
          <a routerLink="/interview">Interview prep</a>
          <a routerLink="/glossary">Glossary</a>
          <a routerLink="/bookmarks">Bookmarks</a>
        </nav>

        <nav aria-label="More">
          <p class="eyebrow">More</p>
          <a routerLink="/resources">Resources</a>
          <a routerLink="/about">About</a>
          <a [href]="github + '/issues'" target="_blank" rel="noopener">Report an issue</a>
        </nav>
      </div>

      <div class="container base">
        <span>© 2026 Vivek Kumar</span>
        <span class="dim">
          Static site · no tracking · progress stored in your browser
        </span>
      </div>
    </footer>
  `,
  styles: `
    footer {
      border-top: 1px solid var(--border);
      background: var(--bg-soft);
      margin-top: var(--sp-8);
      padding-top: var(--sp-7);
    }

    .inner {
      display: grid;
      gap: var(--sp-6);
      grid-template-columns: minmax(240px, 1.6fr) repeat(3, minmax(120px, 1fr));
      padding-bottom: var(--sp-6);
    }

    @media (max-width: 860px) {
      .inner {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .identity {
        grid-column: 1 / -1;
      }
    }

    .identity p {
      margin-top: var(--sp-3);
      max-width: 42ch;
    }

    .social {
      display: flex;
      gap: var(--sp-4);
      margin-top: var(--sp-4);
    }

    .social a {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: var(--text-sm);
      color: var(--ink-2);
      text-decoration: none;
    }

    .social a:hover {
      color: var(--accent);
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    nav a {
      font-size: var(--text-sm);
      color: var(--ink-2);
      text-decoration: none;
    }

    nav a:hover {
      color: var(--accent);
    }

    .eyebrow {
      margin-bottom: var(--sp-2);
    }

    .base {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      justify-content: space-between;
      padding-block: var(--sp-4);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
      color: var(--ink-3);
    }
  `,
})
export class Footer {
  protected readonly github = GITHUB_URL;
  protected readonly linkedin = LINKEDIN_URL;
}
