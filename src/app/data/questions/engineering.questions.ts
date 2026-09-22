import { InterviewQuestion } from '../../core/models/content.models';

/** Agents, production AI engineering, MLOps and system design. */
export const engineeringQuestions: InterviewQuestion[] = [
  {
    id: 'ag-definition',
    question: 'What distinguishes an agent from a workflow with an LLM in it?',
    category: 'AI Agents',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'In a workflow you write the control flow; in an agent the model chooses the next action from a set of tools and keeps going until the goal is met or a limit stops it. Workflows are predictable and easier to debug, so prefer them when the steps are knowable.',
    followUps: ['When is an autonomous loop genuinely necessary?', 'What limits must a loop always have?'],
  },
  {
    id: 'ag-compounding',
    question: 'An agent takes 12 tool steps at 92% per-step reliability. End-to-end success rate?',
    category: 'AI Agents',
    difficulty: 'advanced',
    kind: 'mathematical',
    answer:
      '0.92¹² ≈ 0.37. Compounding is why production agents are short, checkpointed and validated at every step rather than long chains of trust.',
    followUps: ['What raises per-step reliability cheaply?', 'How would you checkpoint a long task?'],
  },
  {
    id: 'ag-tool-design',
    question: 'What makes a tool definition usable by a model?',
    category: 'AI Agents',
    difficulty: 'intermediate',
    kind: 'architecture',
    answer:
      'A specific name, a description saying what it does, when to use it and what it returns, typed and constrained parameters (enums over free strings), and a small overall tool count. Write them for a competent new colleague with no access to your codebase.',
    mistake: 'Exposing one generic `execute(command)` tool, which maximises both ambiguity and blast radius.',
    followUps: ['How do you handle tool errors inside the loop?', 'Why register only the tools for the current step?'],
  },
  {
    id: 'ag-memory',
    question: 'Where should an agent’s state live?',
    category: 'AI Agents',
    difficulty: 'advanced',
    kind: 'architecture',
    answer:
      'Working state in the context window for the current decision only; conversation history in a database, windowed or summarised; durable task progress and artefacts in your own storage so a crash can be resumed and a run can be audited.',
    mistake: 'Treating the context window as the system of record.',
    followUps: ['How do you summarise history without losing decisions?', 'What would you log for an audit trail?'],
  },
  {
    id: 'ag-human-loop',
    question: 'Which agent actions require human approval?',
    category: 'AI Agents',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Anything irreversible or externally visible: moving money, sending messages to customers, deleting data, changing permissions, publishing. Reads and reversible internal writes can be autonomous.',
    followUps: ['How do you design an approval queue that does not destroy the UX?', 'How does this relate to prompt injection?'],
  },
  {
    id: 'eng-serving-choice',
    question: 'Hosted model API or self-hosted inference — how do you decide?',
    category: 'AI Engineering',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Hosted wins for low or spiky volume, fast delivery and minimal operations. Self-hosting wins at high steady volume, when data cannot leave your network, or when you need a specific open-weights model. Compute the break-even in tokens per month against GPU-hour cost, and include engineering time.',
    followUps: ['What operational load does self-hosting add?', 'How would you keep a fallback path?'],
  },
  {
    id: 'eng-batching',
    question: 'What is continuous batching and why does it matter?',
    category: 'AI Engineering',
    difficulty: 'expert',
    kind: 'conceptual',
    answer:
      'New requests join the in-flight batch as earlier sequences finish, instead of waiting for a whole static batch to complete. It keeps the GPU saturated during token-by-token decoding and typically multiplies throughput on the same hardware.',
    followUps: ['Why is decode memory-bandwidth bound?', 'What limits how many sequences fit at once?'],
  },
  {
    id: 'eng-cost',
    question: 'Your LLM feature costs three times the budget. Where do you look, in order?',
    category: 'AI Engineering',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Per-request token logs first: which endpoints and which tenants dominate. Then trim input — oversized retrieval context, full history resent each turn, repeated instructions. Then caching (exact and prefix), then routing easy tasks to a smaller model, then batching offline work.',
    mistake: 'Starting with a provider or model swap before knowing where the tokens go.',
    followUps: ['What four fields must every request log?', 'When is a semantic cache a bad idea?'],
  },
  {
    id: 'eng-latency',
    question: 'Which latency number matters for a streaming chat endpoint?',
    category: 'AI Engineering',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Time to first token, at p95 — that is what users perceive as responsiveness. Total completion time matters for cost and for non-streaming consumers, and the two are optimised differently.',
    followUps: ['How does prompt length affect TTFT?', 'Why report p95 rather than the mean?'],
  },
  {
    id: 'eng-observability',
    question: 'What do you need logged to debug a bad answer reported three days later?',
    category: 'AI Engineering',
    difficulty: 'advanced',
    kind: 'debugging',
    answer:
      'A trace id, the retrieved chunk ids and scores, which chunks reached the prompt, the prompt name and version, the model and parameters, token counts and latency, and enough input to reproduce — with PII redacted and a retention policy.',
    followUps: ['How do you redact without losing reproducibility?', 'How does user feedback become an eval case?'],
  },
  {
    id: 'eng-injection',
    question: 'Explain direct and indirect prompt injection.',
    category: 'AI Engineering',
    difficulty: 'expert',
    kind: 'conceptual',
    answer:
      'Direct is a user typing instructions to override the system prompt. Indirect is instructions hidden in content your system retrieves — a document, a web page, an email — which the model then reads as part of its context. Indirect is more dangerous because the attacker never touches your interface.',
    explanation: 'There is no complete prompt-level fix; the defence is limiting what tools can do and enforcing authorisation in code.',
    followUps: ['Why assume the system prompt is public?', 'What does egress filtering catch?'],
  },
  {
    id: 'eng-pii',
    question: 'How do you handle personal data in prompts and logs?',
    category: 'AI Engineering',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Send only the fields the task needs, redact identifiers where the task allows, confirm the provider’s retention and training terms, set a log retention period with restricted access, and make deletion requests propagate to the vector index and traces as well as the primary database.',
    followUps: ['What breaks if you delete from the database but not the index?', 'How would you support data residency requirements?'],
  },
  {
    id: 'mlops-tracking',
    question: 'What do you log per training run, and why does it matter later?',
    category: 'MLOps',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Hyperparameters, feature list, seed, metrics, artefacts, git commit, data snapshot id and library versions. Without them, "which configuration produced the model in production?" becomes unanswerable within weeks.',
    followUps: ['What does a model registry add?', 'How do you version the data?'],
  },
  {
    id: 'mlops-skew',
    question: 'What is training/serving skew and how do you prevent it?',
    category: 'MLOps',
    difficulty: 'advanced',
    kind: 'debugging',
    answer:
      'Features computed differently in training and serving, so the model sees a different distribution in production than it was trained on. Prevent it by sharing the transformation code between both paths, or by using a feature store with one definition.',
    explanation: 'A classic instance is an aggregate computed over the full history in training but over a partial window in serving.',
    followUps: ['How would you detect it in production?', 'What does a feature store actually guarantee?'],
  },
  {
    id: 'mlops-drift',
    question: 'How do you monitor a model when labels arrive months late?',
    category: 'MLOps',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Monitor proxies: input feature distributions against the training reference (PSI or KL), the distribution of predicted scores, null and default rates per feature, and any immediate behavioural signal such as override or click-through rate. Alert on shifts, then confirm with delayed labels.',
    followUps: ['Data drift versus concept drift?', 'What retraining trigger would you choose?'],
  },
  {
    id: 'mlops-rollout',
    question: 'How do you deploy a new model version safely?',
    category: 'MLOps',
    difficulty: 'advanced',
    kind: 'architecture',
    answer:
      'Register the artefact, shadow it against live traffic to compare without serving, canary a small percentage, A/B test against the business metric, then roll forward — keeping the previous version deployable for immediate rollback.',
    mistake: 'Treating an offline metric improvement as sufficient evidence to replace the incumbent.',
    followUps: ['What gate would block promotion?', 'When is blue/green better than canary?'],
  },
  {
    id: 'sd-support-assistant',
    question: 'Design a customer support assistant over 50,000 internal documents.',
    category: 'AI System Design',
    difficulty: 'expert',
    kind: 'system-design',
    answer:
      'Offline: parse documents preserving structure, chunk on headings at 400–800 tokens with overlap, embed, store vectors with metadata (doc id, heading path, version, access level) in a vector store alongside a BM25 index. Online: embed the query, retrieve ~30 from both indexes, fuse with RRF, rerank with a cross-encoder, keep the top four, build a grounded prompt requiring citations and permitting refusal, generate at temperature 0, validate cited ids, stream the answer. Around it: per-request tracing, a labelled eval set with recall@k and faithfulness in CI, response and prefix caching, per-tenant rate limits, filtered retrieval so permissions are enforced during search, and a feedback control that files failures as eval cases.',
    explanation:
      'Interviewers are listening for the offline/online split, hybrid retrieval with reranking, grounding with refusal, evaluation, and permission-aware retrieval.',
    followUps: ['How do you handle a document update?', 'How do you stop one tenant seeing another’s data?', 'What is your rollback if quality regresses?'],
  },
  {
    id: 'sd-realtime-classifier',
    question: 'Design a real-time fraud classifier at 5,000 requests per second with a 50 ms budget.',
    category: 'AI System Design',
    difficulty: 'expert',
    kind: 'system-design',
    answer:
      'Gradient-boosted trees rather than a deep network, features precomputed in a low-latency store with only cheap derivations at request time, the model loaded in-process behind a horizontally scaled service, a conservative threshold tuned for recall with a review queue for the middle band, and a rules fallback if the model service is unavailable. Log every request with features and score for later labelling; monitor score distribution and feature drift; retrain on a schedule with a promotion gate.',
    explanation:
      'The binding constraints are latency and the review capacity downstream, which is why threshold choice is a capacity decision as much as a modelling one.',
    followUps: ['Why not a neural network here?', 'How do you get labels?', 'What happens during a feature-store outage?'],
  },
  {
    id: 'sd-agent-platform',
    question: 'Design an internal agent that can query databases and file tickets.',
    category: 'AI System Design',
    difficulty: 'expert',
    kind: 'system-design',
    answer:
      'Narrow typed tools per capability, read tools autonomous and write tools behind explicit approval, authorisation checked inside every tool against the requesting user, step/token/time/spend caps on the loop, durable task state checkpointed per step, full traces of every decision and tool result, schema validation on all arguments, and an eval suite scoring trajectories as well as final answers. Start as a router plus workflow and only introduce an autonomous loop where the step count genuinely varies.',
    followUps: ['How do you prevent SQL injection through generated queries?', 'How do you evaluate trajectory quality?', 'What is the blast radius if the model is compromised by injected text?'],
  },
  {
    id: 'sd-semantic-search',
    question: 'Design semantic search for a 10-million-document catalogue.',
    category: 'AI System Design',
    difficulty: 'expert',
    kind: 'system-design',
    answer:
      'An HNSW or IVF index — flat search does not scale — with quantisation if memory is tight, an embedding model sized for the latency budget, a lexical index for exact identifiers, RRF fusion, and reranking only on the top candidates. Batch embedding jobs for ingestion, versioned indexes so a model change is a blue/green swap rather than downtime, and recall@k measured on a labelled query set before and after every change.',
    followUps: ['How do you re-index without downtime?', 'What recall do you lose to the ANN index?', 'How do you handle multilingual queries?'],
  },
];
