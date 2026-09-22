import { Routes } from '@angular/router';

/**
 * Routes are content-shaped, not component-shaped: every module is served by
 * `learn/:module`, every topic by `learn/:module/:slug` and every project by
 * `projects/:slug`, so adding content never touches this file. Each page is
 * lazily loaded, which keeps the initial bundle to the shell and the homepage.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    data: {
      description:
        'NeuralPath is a structured AI/ML engineering curriculum by Vivek Kumar: a roadmap from ' +
        'Python and mathematics through machine learning, deep learning, transformers, LLMs, RAG ' +
        'and AI agents, with interactive diagrams, projects and interview preparation.',
    },
  },
  {
    path: 'roadmap',
    title: 'Roadmap',
    loadComponent: () => import('./features/roadmap/roadmap-page').then((m) => m.RoadmapPage),
    data: {
      description:
        'The full AI/ML engineering roadmap: sixteen stages from engineering foundations to ' +
        'production AI, each with its topics, prerequisites and estimated reading time.',
    },
  },
  {
    path: 'learn',
    title: 'Learn',
    loadComponent: () => import('./features/learn/learn-index').then((m) => m.LearnIndex),
    data: {
      description:
        'Every module and topic in the curriculum, filterable by difficulty, with progress tracking.',
    },
  },
  {
    path: 'learn/:module',
    loadComponent: () => import('./features/learn/module-page').then((m) => m.ModulePage),
    data: {
      description: 'A stage of the AI/ML engineering curriculum: its topics, order and outcomes.',
    },
  },
  {
    path: 'learn/:module/:slug',
    loadComponent: () => import('./features/learn/topic-page').then((m) => m.TopicPage),
    data: {
      description:
        'An AI/ML topic explained from first principles: what it is, why it exists, how it works, ' +
        'with code, diagrams and a self-check.',
    },
  },
  {
    path: 'projects',
    title: 'Projects',
    loadComponent: () => import('./features/projects/projects-page').then((m) => m.ProjectsPage),
    data: {
      description:
        'Fifteen AI/ML projects from a first regression model to an internal AI platform, each ' +
        'with prerequisites, architecture, implementation steps and extension ideas.',
    },
  },
  {
    path: 'projects/:slug',
    loadComponent: () => import('./features/projects/project-page').then((m) => m.ProjectPage),
    data: {
      description:
        'An AI/ML project specification: difficulty, prerequisites, concepts, architecture and steps.',
    },
  },
  {
    path: 'interview',
    title: 'Interview Prep',
    loadComponent: () => import('./features/interview/interview-page').then((m) => m.InterviewPage),
    data: {
      description:
        'AI/ML interview questions with answers, explanations, common mistakes and follow-ups — ' +
        'across Python, statistics, machine learning, deep learning, transformers, LLMs, RAG, ' +
        'agents, MLOps and system design.',
    },
  },
  {
    path: 'glossary',
    title: 'Glossary',
    loadComponent: () => import('./features/glossary/glossary-page').then((m) => m.GlossaryPage),
    data: {
      description:
        'A searchable AI/ML glossary: every term with a plain definition, a technical one, an ' +
        'example and its related concepts.',
    },
  },
  {
    path: 'resources',
    title: 'Resources',
    loadComponent: () => import('./features/resources/resources-page').then((m) => m.ResourcesPage),
    data: {
      description:
        'Curated AI/ML learning resources: official documentation, courses, books, research ' +
        'papers, datasets, tools and communities, primary sources first.',
    },
  },
  {
    path: 'now',
    title: 'What to learn now',
    loadComponent: () => import('./features/now/now-page').then((m) => m.NowPage),
    data: {
      description:
        'What is worth learning in AI right now: core skills, emerging skills, tools, frameworks, ' +
        'research directions and production practices — each dated and sourced.',
    },
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
    data: {
      description:
        'Your learning progress across every stage, your current learning path and the next ' +
        'recommended topic. Stored in this browser, no account needed.',
    },
  },
  {
    path: 'bookmarks',
    title: 'Bookmarks',
    loadComponent: () => import('./features/bookmarks/bookmarks-page').then((m) => m.BookmarksPage),
    data: { description: 'Topics, questions, projects and resources you saved.' },
  },
  {
    path: 'about',
    title: 'About',
    loadComponent: () => import('./features/about/about-page').then((m) => m.AboutPage),
    data: {
      description:
        'What NeuralPath is, how it is organised, how it is built, and how to use it.',
    },
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
