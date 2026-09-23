import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProgressService } from '../core/services/progress.service';
import { UiService } from '../core/services/ui.service';
import { MODULES } from '../data/curriculum';
import { SECONDARY_NAV } from '../data/navigation';
import { Icon } from '../shared/icon';

/**
 * The curriculum navigation tree.
 *
 * Every topic on the site is reachable from here without going back to an
 * index, which is the point of keeping it on screen. The stage containing the
 * next unread topic is open by default, so a returning reader lands with their
 * place already expanded.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <div class="sidebar-inner">
      <div class="sidebar-head">
        <span>Curriculum</span>
        <span>{{ progress.completedCount() }}/{{ totalTopics }}</span>
      </div>

      <nav class="nav-tree" aria-label="Curriculum">
        @for (module of modules; track module.slug) {
          <details class="nav-group" [open]="isOpen(module.slug)">
            <summary>
              <app-icon class="caret" name="chevron-right" [size]="13" />
              <span class="stage-no">{{ pad(module.stage) }}</span>
              <span class="name">{{ module.title }}</span>
              <span class="done-count">{{ doneIn(module.slug) }}/{{ module.topics.length }}</span>
            </summary>

            <div class="nav-leaves">
              <a
                [routerLink]="['/learn', module.slug]"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="ui.closeSidebarOnMobile()"
              >
                <app-icon class="tick" name="check" [size]="11" />
                <span class="leaf-label">Stage overview</span>
              </a>
              @for (topic of module.topics; track topic.slug) {
                <a
                  [routerLink]="['/learn', module.slug, topic.slug]"
                  routerLinkActive="active"
                  [class.done]="progress.isDone(topic.slug)"
                  (click)="ui.closeSidebarOnMobile()"
                >
                  <app-icon class="tick" name="check" [size]="11" />
                  <span class="leaf-label">{{ topic.title }}</span>
                </a>
              }
            </div>
          </details>
        }
      </nav>

      <div class="nav-section">
        @for (link of shortcuts; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="active" (click)="ui.closeSidebarOnMobile()">
            <app-icon [name]="link.icon" [size]="15" />
            {{ link.label }}
          </a>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Sidebar {
  protected readonly progress = inject(ProgressService);
  protected readonly ui = inject(UiService);

  protected readonly modules = MODULES;
  protected readonly totalTopics = MODULES.reduce((sum, m) => sum + m.topics.length, 0);
  protected readonly shortcuts = SECONDARY_NAV;

  private readonly currentModule = computed(() => this.progress.currentStage().slug);

  protected isOpen(slug: string): boolean {
    return this.ui.openStages().has(slug) || slug === this.currentModule();
  }

  protected doneIn(slug: string): number {
    return this.progress.byModule().find((entry) => entry.slug === slug)?.done ?? 0;
  }

  protected pad(stage: number): string {
    return stage < 10 ? `0${stage}` : `${stage}`;
  }
}
