import { Module, Topic } from '../core/models/content.models';
import { orientationModule } from './modules/orientation.module';
import { foundationsModule } from './modules/foundations.module';
import { mathematicsModule } from './modules/mathematics.module';
import { dataModule } from './modules/data.module';
import { machineLearningModule } from './modules/machine-learning.module';
import { evaluationModule } from './modules/evaluation.module';
import { deepLearningModule } from './modules/deep-learning.module';
import { computerVisionModule } from './modules/computer-vision.module';
import { nlpModule } from './modules/nlp.module';
import { transformersModule } from './modules/transformers.module';
import { generativeAiModule } from './modules/generative-ai.module';
import { llmEngineeringModule } from './modules/llm-engineering.module';
import { ragModule } from './modules/rag.module';
import { fineTuningModule } from './modules/fine-tuning.module';
import { aiAgentsModule } from './modules/ai-agents.module';
import { aiEngineeringModule } from './modules/ai-engineering.module';
import { mlopsModule } from './modules/mlops.module';

/**
 * The curriculum, in learning order.
 *
 * `stage` is the position on the roadmap; the array order matches it so that
 * "next topic" is simply the next element of `allTopics()`.
 */
export const MODULES: Module[] = [
  orientationModule,
  foundationsModule,
  mathematicsModule,
  dataModule,
  machineLearningModule,
  evaluationModule,
  deepLearningModule,
  computerVisionModule,
  nlpModule,
  transformersModule,
  generativeAiModule,
  llmEngineeringModule,
  ragModule,
  fineTuningModule,
  aiAgentsModule,
  aiEngineeringModule,
  mlopsModule,
];

let flattened: Topic[] | undefined;

/** Every topic, in curriculum order. Computed once. */
export function allTopics(): Topic[] {
  flattened ??= MODULES.flatMap((module) => module.topics);
  return flattened;
}

export function moduleBySlug(slug: string): Module | undefined {
  return MODULES.find((module) => module.slug === slug);
}

export function topicBySlug(slug: string): Topic | undefined {
  return allTopics().find((topic) => topic.slug === slug);
}

export function topicTitle(slug: string): string {
  return topicBySlug(slug)?.title ?? slug;
}

/** The previous and next topic across module boundaries. */
export function neighbours(slug: string): { previous?: Topic; next?: Topic } {
  const topics = allTopics();
  const index = topics.findIndex((topic) => topic.slug === slug);
  if (index === -1) return {};
  return { previous: topics[index - 1], next: topics[index + 1] };
}

export const CURRICULUM_STATS = {
  get modules(): number {
    return MODULES.length;
  },
  get topics(): number {
    return allTopics().length;
  },
  get minutes(): number {
    return allTopics().reduce((total, topic) => total + topic.minutes, 0);
  },
  get quizzes(): number {
    return allTopics().reduce(
      (total, topic) => total + topic.blocks.filter((block) => block.kind === 'quiz').length,
      0,
    );
  },
  get visuals(): number {
    return allTopics().reduce(
      (total, topic) => total + topic.blocks.filter((block) => block.kind === 'visual').length,
      0,
    );
  },
};
