import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GITHUB_URL, LINKEDIN_URL } from '../../core/services/seo.service';
import { CURRICULUM_STATS } from '../../data/curriculum';
import { GLOSSARY } from '../../data/glossary';
import { QUESTIONS } from '../../data/interview';
import { PROJECTS } from '../../data/projects';
import { RESOURCES } from '../../data/resources';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page prose-page">
      <header class="section-head">
        <p class="eyebrow">About</p>
        <h1>NeuralPath</h1>
        <p class="lede">
          An AI/ML engineering knowledge platform built and maintained by Vivek Kumar. It is a
          structured curriculum, an interview bank, a project roadmap and a reference, organised so
          that someone starting from zero and someone preparing for a senior interview can both use
          it.
        </p>
      </header>

      <section>
        <h2>What this is</h2>
        <p>
          The platform answers one question in order: <em>I know little or nothing about AI/ML —
          where do I start, what comes next, why does it matter, and how do I practise it?</em>
          Sixteen stages run from Python and tooling through mathematics, data, machine learning,
          deep learning, computer vision, NLP, transformers, generative AI, LLM engineering, RAG,
          fine-tuning, agents, production AI engineering and MLOps.
        </p>
        <p>
          Every topic has to answer six questions before it is considered finished: what is it, why
          does it exist, how does it work, where is it used, what comes before it, and what comes
          after. That constraint is the reason the writing is structured the way it is.
        </p>
      </section>

      <section>
        <h2>What is in it</h2>
        <dl class="counts">
          <div>
            <dt>{{ stats.modules }}</dt>
            <dd>stages</dd>
          </div>
          <div>
            <dt>{{ stats.topics }}</dt>
            <dd>topics</dd>
          </div>
          <div>
            <dt>{{ stats.visuals }}</dt>
            <dd>interactive figures</dd>
          </div>
          <div>
            <dt>{{ stats.quizzes }}</dt>
            <dd>self-checks</dd>
          </div>
          <div>
            <dt>{{ questions }}</dt>
            <dd>interview questions</dd>
          </div>
          <div>
            <dt>{{ projects }}</dt>
            <dd>projects</dd>
          </div>
          <div>
            <dt>{{ terms }}</dt>
            <dd>glossary terms</dd>
          </div>
          <div>
            <dt>{{ resources }}</dt>
            <dd>curated resources</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>How it is built</h2>
        <p>
          Angular with strict TypeScript, no UI framework and no analytics. Content is typed data
          separated from the components that render it, so adding a topic means adding an object to
          a data file — no new route, no new component. State lives in signals; progress, bookmarks,
          theme and the chosen learning path persist in <code>localStorage</code> behind a single
          storage service.
        </p>
        <p>
          It is a static site: no backend, no database, no authentication, nothing to sign up for.
          The whole thing is served from GitHub Pages, and every feature works offline after the
          first load. Diagrams are hand-written SVG and CSS rather than images, so they scale, work
          in both themes and cost almost nothing to download.
        </p>
        <div class="row">
          <a class="btn btn-sm" [href]="github" target="_blank" rel="noopener">
            <app-icon name="github" [size]="14" />
            Source on GitHub
          </a>
          <a class="btn btn-sm" [href]="linkedin" target="_blank" rel="noopener">
            <app-icon name="linkedin" [size]="14" />
            LinkedIn
          </a>
        </div>
      </section>

      <section>
        <h2>How to use it</h2>
        <ul>
          <li>
            <strong>New to the field.</strong> Take the <a routerLink="/roadmap">roadmap</a> in
            order and do not skip the foundations stage.
          </li>
          <li>
            <strong>A developer moving into AI.</strong> Set your profile to "Developer moving into
            AI" and start at generative AI, then LLM engineering, RAG and agents.
          </li>
          <li>
            <strong>Interviewing soon.</strong> Work through
            <a routerLink="/interview">interview prep</a> by category in practice mode, and read the
            evaluation and transformers stages closely.
          </li>
          <li>
            <strong>Looking things up.</strong> Press <kbd class="kbd">Ctrl</kbd>
            <kbd class="kbd">K</kbd> anywhere and search topics, questions, projects, terms and
            resources at once.
          </li>
        </ul>
      </section>

      <section>
        <h2>On sources and originality</h2>
        <p>
          The learning structure was informed by two external courses, credited on the
          <a routerLink="/resources">resources page</a> and linked as optional companions. All
          explanations, examples, diagrams, quizzes, projects and interview answers here are
          original work written for this site; no course material is reproduced. Where a claim
          belongs to someone else — a paper, a benchmark, a documented API behaviour — it is linked
          to its primary source rather than restated as fact.
        </p>
        <p>
          The <a routerLink="/now">what to learn now</a> page carries a review date precisely
          because that kind of claim expires. If something there looks stale, trust the linked
          source over this site.
        </p>
      </section>

      <section>
        <h2>Corrections</h2>
        <p>
          Technical writing has errors in it. If you find one — a wrong formula, a misleading
          explanation, a dead link, a metric described the wrong way round —
          <a [href]="github + '/issues'" target="_blank" rel="noopener">open an issue</a>. Specific
          corrections with a source are the most useful thing anyone can send.
        </p>
      </section>
    </div>
  `,
  styles: `
    .prose-page section {
      margin-top: var(--sp-6);
      max-width: 78ch;
    }

    h2 {
      font-size: var(--text-xl);
      margin-bottom: var(--sp-3);
    }

    p {
      color: var(--ink-2);
      font-size: var(--text-md);
      line-height: 1.75;
    }

    p + p {
      margin-top: var(--sp-3);
    }

    ul {
      display: grid;
      gap: var(--sp-2);
    }

    li {
      color: var(--ink-2);
      font-size: var(--text-base);
      line-height: 1.7;
    }

    strong {
      color: var(--ink);
    }

    .row {
      margin-top: var(--sp-4);
    }

    .counts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: var(--sp-4);
      padding: var(--sp-4) 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .counts dt {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--ink);
    }

    .counts dd {
      font-size: var(--text-xs);
      color: var(--ink-3);
      margin-top: 2px;
    }
  `,
})
export class AboutPage {
  protected readonly stats = CURRICULUM_STATS;
  protected readonly questions = QUESTIONS.length;
  protected readonly terms = GLOSSARY.length;
  protected readonly projects = PROJECTS.length;
  protected readonly resources = RESOURCES.length;
  protected readonly github = GITHUB_URL;
  protected readonly linkedin = LINKEDIN_URL;
}
