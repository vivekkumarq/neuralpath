import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CURRICULUM_STATS, MODULES } from '../../data/curriculum';
import { GLOSSARY } from '../../data/glossary';
import { QUESTIONS } from '../../data/interview';
import { PROJECTS } from '../../data/projects';
import { PATH_PROFILES } from '../../data/now';
import { ProgressService } from '../../core/services/progress.service';
import { UiService } from '../../core/services/ui.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly progress = inject(ProgressService);
  protected readonly ui = inject(UiService);

  protected readonly modules = MODULES;
  protected readonly profiles = PATH_PROFILES;
  protected readonly stats = CURRICULUM_STATS;
  protected readonly questionCount = QUESTIONS.length;
  protected readonly termCount = GLOSSARY.length;
  protected readonly projectCount = PROJECTS.length;
  protected readonly hours = Math.round(CURRICULUM_STATS.minutes / 60);

  protected readonly started = computed(() => this.progress.completedCount() > 0);

  protected readonly profile = computed(() =>
    PATH_PROFILES.find((entry) => entry.id === this.progress.activeProfile()),
  );

  /** The chosen profile's stage order, resolved to modules. */
  protected readonly recommended = computed(() => {
    const chosen = this.profile();
    if (!chosen) return [];
    return chosen.modules
      .map((slug) => MODULES.find((module) => module.slug === slug))
      .filter((module): module is (typeof MODULES)[number] => module !== undefined)
      .slice(0, 6);
  });

  protected readonly capabilities = [
    {
      icon: 'cpu',
      title: 'Interactive diagrams, not decoration',
      body: 'Move the learning rate and watch gradient descent diverge. Edit a confusion matrix and see precision and recall pull apart. Click a token and see what attention actually weights.',
    },
    {
      icon: 'target',
      title: `${QUESTIONS.length} interview questions with real answers`,
      body: 'Each one carries the answer, the reasoning, the mistake that sounds right, and the follow-ups an interviewer will ask next. Filter by category and difficulty, or practise at random.',
    },
    {
      icon: 'layers',
      title: `${PROJECTS.length} projects, specified not sketched`,
      body: 'Architecture, implementation steps, suggested stack, expected outcome and extensions — from a first regression model to an internal AI platform.',
    },
    {
      icon: 'chart',
      title: 'Progress that needs no account',
      body: 'Mark topics complete, answer the checks, bookmark what matters. Everything is stored in your browser and nothing is sent anywhere.',
    },
  ];

  protected chooseProfile(id: string): void {
    this.progress.setProfile(this.progress.activeProfile() === id ? '' : id);
  }
}
