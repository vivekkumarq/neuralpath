/**
 * The content model.
 *
 * Topics, questions, projects and glossary entries are plain data, kept apart
 * from the components that render them. Adding a topic means adding an object
 * to a data file — no component, no route and no template changes.
 */

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];

/** Keys of the interactive figures registered in `shared/visuals`. */
export type VisualId =
  | 'neural-net'
  | 'perceptron'
  | 'gradient-descent'
  | 'activations'
  | 'bias-variance'
  | 'confusion-matrix'
  | 'convolution'
  | 'tokenizer'
  | 'embeddings'
  | 'attention'
  | 'transformer'
  | 'sampling'
  | 'rag-pipeline'
  | 'vector-search'
  | 'adaptation-compare'
  | 'agent-loop'
  | 'tree-splits'
  | 'backprop'
  | 'training-curve'
  | 'kmeans'
  | 'threshold';

export interface Quiz {
  /** Stable id so an answered quiz stays answered across visits. */
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

export type Block =
  | { kind: 'text'; body: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'steps'; items: { title: string; body: string }[] }
  | { kind: 'code'; lang: 'python' | 'bash' | 'json' | 'text'; caption?: string; code: string }
  | { kind: 'note'; tone: 'info' | 'tip' | 'warn'; title: string; body: string }
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { kind: 'math'; expr: string; note?: string }
  | { kind: 'visual'; id: VisualId; caption?: string }
  | { kind: 'quiz'; quiz: Quiz };

export interface ResourceLink {
  label: string;
  url: string;
  kind: ResourceKind;
}

export type ResourceKind =
  | 'docs'
  | 'course'
  | 'book'
  | 'paper'
  | 'video'
  | 'repo'
  | 'dataset'
  | 'tool'
  | 'community';

export interface Topic {
  slug: string;
  title: string;
  /** Slug of the owning module. */
  module: string;
  level: Level;
  /** Estimated reading time in minutes. */
  minutes: number;
  /** One sentence: what this topic is. */
  summary: string;
  /** Why the idea exists at all — the problem it solves. */
  why: string;
  /** Slugs of topics that should come first. */
  prerequisites?: string[];
  /** What the reader can do afterwards. */
  outcomes: string[];
  blocks: Block[];
  resources?: ResourceLink[];
  related?: string[];
  tags?: string[];
}

export interface Module {
  slug: string;
  title: string;
  /** Position in the curriculum, starting at 0 for prerequisites. */
  stage: number;
  tagline: string;
  description: string;
  level: Level;
  /** Short label used on the roadmap nodes. */
  short: string;
  topics: Topic[];
}

export type QuestionKind =
  | 'conceptual'
  | 'coding'
  | 'mathematical'
  | 'scenario'
  | 'system-design'
  | 'debugging'
  | 'architecture';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: Level;
  kind: QuestionKind;
  answer: string;
  explanation?: string;
  /** The answer that sounds right and is not. */
  mistake?: string;
  followUps?: string[];
  code?: { lang: 'python' | 'bash' | 'text'; code: string };
}

export interface Project {
  slug: string;
  title: string;
  level: Level;
  summary: string;
  /** Weeks of part-time work, as a range label. */
  effort: string;
  prerequisites: string[];
  concepts: string[];
  stack: string[];
  architecture: string[];
  steps: { title: string; body: string }[];
  outcome: string;
  extensions: string[];
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  category: string;
  simple: string;
  technical: string;
  example?: string;
  related?: string[];
}

export interface CurrentItem {
  title: string;
  bucket: 'core' | 'emerging' | 'tools' | 'frameworks' | 'research' | 'production';
  why: string;
  source: { label: string; url: string };
  reviewed: string;
}

export interface PathProfile {
  id: string;
  label: string;
  description: string;
  /** Module slugs in the order this profile should take them. */
  modules: string[];
  note: string;
}
