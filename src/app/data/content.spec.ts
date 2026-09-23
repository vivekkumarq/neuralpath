import { describe, expect, it } from 'vitest';
import { MODULES, allTopics, topicBySlug } from './curriculum';
import { QUESTIONS, QUESTION_CATEGORIES } from './interview';
import { GLOSSARY } from './glossary';
import { PROJECTS } from './projects';
import { RESOURCES } from './resources';
import { CURRENT_ITEMS, PATH_PROFILES } from './now';
import { Quiz } from '../core/models/content.models';

/**
 * Content integrity.
 *
 * All the cross-references in the curriculum — prerequisites, related topics,
 * project prerequisites, learner paths — are slugs in hand-written data, so a
 * rename silently produces a dead link. These assertions fail the build
 * instead.
 */

/** Every figure id the visual registry can render. */
const KNOWN_VISUALS = [
  'neural-net',
  'perceptron',
  'gradient-descent',
  'activations',
  'bias-variance',
  'confusion-matrix',
  'convolution',
  'tokenizer',
  'embeddings',
  'attention',
  'transformer',
  'sampling',
  'rag-pipeline',
  'vector-search',
  'adaptation-compare',
  'agent-loop',
  'tree-splits',
  'backprop',
  'training-curve',
  'kmeans',
  'threshold',
  'rnn-unroll',
  'chunking',
  'lora',
  'quantisation',
  'drift',
];

describe('curriculum', () => {
  it('has modules in stage order with unique slugs', () => {
    const slugs = MODULES.map((module) => module.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(MODULES.map((module) => module.stage)).toEqual(MODULES.map((_, i) => i));
  });

  it('has unique topic slugs', () => {
    const slugs = allTopics().map((topic) => topic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('declares each topic inside the module that owns it', () => {
    for (const module of MODULES) {
      for (const topic of module.topics) {
        expect(topic.module, topic.slug).toBe(module.slug);
      }
    }
  });

  it('resolves every prerequisite and related slug', () => {
    for (const topic of allTopics()) {
      for (const slug of [...(topic.prerequisites ?? []), ...(topic.related ?? [])]) {
        expect(topicBySlug(slug), `${topic.slug} -> ${slug}`).toBeDefined();
      }
    }
  });

  it('never lists a topic as its own prerequisite', () => {
    for (const topic of allTopics()) {
      expect(topic.prerequisites ?? []).not.toContain(topic.slug);
    }
  });

  it('gives every topic a summary, a reason and outcomes', () => {
    for (const topic of allTopics()) {
      expect(topic.summary.length, topic.slug).toBeGreaterThan(20);
      expect(topic.why.length, topic.slug).toBeGreaterThan(40);
      expect(topic.outcomes.length, topic.slug).toBeGreaterThan(0);
      expect(topic.minutes, topic.slug).toBeGreaterThan(0);
      expect(topic.blocks.length, topic.slug).toBeGreaterThan(2);
    }
  });

  it('only references figures the registry can render', () => {
    for (const topic of allTopics()) {
      for (const block of topic.blocks) {
        if (block.kind === 'visual') expect(KNOWN_VISUALS, topic.slug).toContain(block.id);
      }
    }
  });

  it('has valid, uniquely identified quizzes', () => {
    const ids: string[] = [];

    for (const topic of allTopics()) {
      for (const block of topic.blocks) {
        if (block.kind !== 'quiz') continue;
        const quiz: Quiz = block.quiz;
        ids.push(quiz.id);
        expect(quiz.options.length, quiz.id).toBeGreaterThan(1);
        expect(quiz.answer, quiz.id).toBeGreaterThanOrEqual(0);
        expect(quiz.answer, quiz.id).toBeLessThan(quiz.options.length);
        expect(quiz.explanation.length, quiz.id).toBeGreaterThan(20);
      }
    }

    expect(new Set(ids).size, 'duplicate quiz ids').toBe(ids.length);
  });

  it('keeps table rows the same width as their header', () => {
    for (const topic of allTopics()) {
      for (const block of topic.blocks) {
        if (block.kind !== 'table') continue;
        for (const row of block.rows) {
          expect(row.length, `${topic.slug}: ${row[0]}`).toBe(block.head.length);
        }
      }
    }
  });
});

describe('interview questions', () => {
  it('has unique ids', () => {
    const ids = QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only declared categories', () => {
    for (const question of QUESTIONS) {
      expect(QUESTION_CATEGORIES, question.id).toContain(question.category);
    }
  });

  it('answers every question substantively', () => {
    for (const question of QUESTIONS) {
      expect(question.answer.length, question.id).toBeGreaterThan(60);
      expect(question.question.trim().endsWith('?') || question.question.includes('.'), question.id)
        .toBe(true);
    }
  });
});

describe('glossary', () => {
  it('has unique slugs and both definitions', () => {
    const slugs = GLOSSARY.map((term) => term.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const term of GLOSSARY) {
      expect(term.simple.length, term.slug).toBeGreaterThan(15);
      expect(term.technical.length, term.slug).toBeGreaterThan(30);
    }
  });

  it('resolves related terms to real entries', () => {
    const slugs = new Set(GLOSSARY.map((term) => term.slug));
    for (const term of GLOSSARY) {
      for (const related of term.related ?? []) {
        expect(slugs.has(related), `${term.slug} -> ${related}`).toBe(true);
      }
    }
  });
});

describe('projects', () => {
  it('has unique slugs and resolvable prerequisites', () => {
    const slugs = PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const project of PROJECTS) {
      for (const slug of project.prerequisites) {
        expect(topicBySlug(slug), `${project.slug} -> ${slug}`).toBeDefined();
      }
      expect(project.steps.length, project.slug).toBeGreaterThan(2);
      expect(project.architecture.length, project.slug).toBeGreaterThan(1);
      expect(project.extensions.length, project.slug).toBeGreaterThan(1);
    }
  });

  it('runs from beginner to expert', () => {
    expect(PROJECTS[0].level).toBe('beginner');
    expect(PROJECTS[PROJECTS.length - 1].level).toBe('expert');
  });
});

describe('external links', () => {
  it('are absolute https urls', () => {
    const urls = [
      ...RESOURCES.map((resource) => resource.url),
      ...allTopics().flatMap((topic) => (topic.resources ?? []).map((entry) => entry.url)),
      ...CURRENT_ITEMS.map((item) => item.source.url),
    ];

    for (const url of urls) {
      expect(url.startsWith('https://'), url).toBe(true);
    }
  });

  it('marks the paid courses as paid', () => {
    const udemy = RESOURCES.filter((resource) => resource.url.includes('udemy.com'));
    expect(udemy.length).toBe(2);
    for (const course of udemy) {
      expect(course.free).toBeFalsy();
      expect(course.note).toContain('not affiliated');
    }
  });
});

describe('learner paths', () => {
  it('reference real modules', () => {
    const slugs = new Set(MODULES.map((module) => module.slug));
    for (const profile of PATH_PROFILES) {
      expect(profile.modules.length, profile.id).toBeGreaterThan(3);
      for (const slug of profile.modules) {
        expect(slugs.has(slug), `${profile.id} -> ${slug}`).toBe(true);
      }
    }
  });
});
