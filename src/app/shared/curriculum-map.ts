import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../core/services/progress.service';
import { MODULES } from '../data/curriculum';

/**
 * The whole curriculum as one figure.
 *
 * A list of eighteen stages tells you what exists; it does not tell you where
 * you are. Each node carries its own completion as a ring, so progress is
 * legible at a glance rather than eighteen separate percentages to read.
 *
 * Built from grid and conic-gradient rather than a drawn SVG, so it reflows at
 * any width instead of needing a second mobile layout.
 */
@Component({
  selector: 'app-curriculum-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="map" aria-label="Curriculum map">
      @for (node of nodes(); track node.slug) {
        <a
          class="node level-{{ node.level }}"
          [routerLink]="['/learn', node.slug]"
          [class.done]="node.percent === 100"
          [class.started]="node.percent > 0 && node.percent < 100"
          [attr.aria-label]="node.title + ', stage ' + node.stage + ', ' + node.percent + '% complete'"
        >
          <span class="ring" [style.--p]="node.percent">
            <span class="hub">{{ node.stage < 10 ? '0' + node.stage : node.stage }}</span>
          </span>
          <span class="label">{{ node.short }}</span>
          <span class="count">{{ node.done }}/{{ node.total }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    /* Explicit column counts rather than auto-fit: the rail between nodes has
       to be hidden on the last node of each row, and nth-child can only do
       that if the number of columns is known. 18 divides by 9, 6 and 3. */
    .map {
      display: grid;
      grid-template-columns: repeat(9, minmax(0, 1fr));
      gap: var(--sp-4) var(--sp-2);
      padding: var(--sp-5) 0;
    }

    .node:nth-child(9n)::before {
      display: none;
    }

    .node {
      --tone: var(--accent);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
      padding: 0 0.2rem;
      text-decoration: none;
      color: var(--ink-3);
      min-width: 0;
    }

    /* The rail runs behind the rings. It stops short of each ring so the nodes
       read as beads on a thread rather than a bar with holes punched in it. */
    .node::before {
      content: '';
      position: absolute;
      top: 25px;
      left: calc(50% + 28px);
      right: calc(-50% + 28px);
      height: 2px;
      background: var(--border);
      z-index: 0;
    }

    .node:last-child::before {
      display: none !important;
    }

    .node.done::before {
      background: var(--accent-line);
    }

    .ring {
      position: relative;
      z-index: 1;
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 99px;
      background: conic-gradient(var(--tone) calc(var(--p, 0) * 1%), var(--surface-3) 0);
      transition:
        transform var(--dur-slow) var(--ease-spring),
        box-shadow var(--dur) var(--ease);
    }

    .hub {
      position: relative;
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 99px;
      background: var(--bg);
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ink-2);
    }

    .node:hover .ring,
    .node:focus-visible .ring {
      transform: translateY(-3px) scale(1.06);
      box-shadow: var(--shadow-lg);
    }

    .node:hover .hub,
    .node:focus-visible .hub {
      color: var(--tone);
      border-color: var(--tone);
    }

    .node.done .hub {
      background: var(--accent-soft);
      border-color: var(--accent-line);
      color: var(--accent);
    }

    .label {
      font-size: var(--text-xs);
      font-weight: 600;
      line-height: 1.25;
      text-align: center;
      color: var(--ink-2);
      overflow-wrap: anywhere;
    }

    .node:hover .label {
      color: var(--ink);
    }

    .count {
      font-family: var(--font-mono);
      font-size: 0.6rem;
      color: var(--ink-3);
    }

    /* Difficulty is the one thing worth colouring, so the map also reads as a
       gradient from beginner to expert across the path. */
    .level-beginner {
      --tone: var(--lvl-beginner);
    }
    .level-intermediate {
      --tone: var(--lvl-intermediate);
    }
    .level-advanced {
      --tone: var(--lvl-advanced);
    }
    .level-expert {
      --tone: var(--lvl-expert);
    }

    @media (max-width: 1080px) {
      .map {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }

      .node:nth-child(9n)::before {
        display: block;
      }

      .node:nth-child(6n)::before {
        display: none;
      }
    }

    @media (max-width: 720px) {
      .map {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .node:nth-child(6n)::before {
        display: block;
      }

      .node:nth-child(3n)::before {
        display: none;
      }
    }

    @media (max-width: 560px) {

      .ring {
        width: 44px;
        height: 44px;
      }

      .hub {
        width: 36px;
        height: 36px;
        font-size: 0.7rem;
      }

      .node::before {
        top: 21px;
        left: calc(50% + 24px);
        right: calc(-50% + 24px);
      }
    }
  `,
})
export class CurriculumMap {
  private readonly progress = inject(ProgressService);

  protected readonly nodes = computed(() => {
    const byModule = this.progress.byModule();
    return MODULES.map((module) => {
      const entry = byModule.find((item) => item.slug === module.slug);
      return {
        slug: module.slug,
        stage: module.stage,
        title: module.title,
        short: module.short,
        level: module.level,
        percent: entry?.percent ?? 0,
        done: entry?.done ?? 0,
        total: module.topics.length,
      };
    });
  });
}