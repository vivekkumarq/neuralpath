import { Level, Project } from '../core/models/content.models';

/**
 * Fifteen projects in increasing order of difficulty. Each one is specified
 * enough to start without being a tutorial to copy: architecture, steps,
 * expected outcome and where to take it next.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'house-price-predictor',
    title: 'House price predictor',
    level: 'beginner',
    effort: '1 week',
    summary:
      'A regression baseline done properly: honest splits, a real preprocessing pipeline, and error reported in currency a stakeholder understands.',
    prerequisites: ['pandas-dataframes', 'linear-and-logistic-regression', 'regression-metrics'],
    concepts: ['Regression', 'Feature engineering', 'Pipelines', 'MAE vs RMSE', 'Cross-validation'],
    stack: ['Python', 'pandas', 'scikit-learn', 'matplotlib'],
    architecture: [
      'CSV loaded into pandas, schema and ranges asserted',
      'ColumnTransformer: median imputation and scaling for numeric, one-hot for categorical',
      'Ridge regression baseline, then gradient boosting for comparison',
      'Five-fold cross-validation for selection; a held-out test set for the final number',
    ],
    steps: [
      { title: 'Explore before modelling', body: 'Distributions, missingness, duplicates, impossible values. Log-transform the target if it is heavily skewed.' },
      { title: 'Build the split first', body: 'Hold out a test set before any preprocessing, so nothing can leak into it.' },
      { title: 'Baseline', body: 'Predict the mean. Every later model must beat it, and by how much is the actual result.' },
      { title: 'Pipeline the preprocessing', body: 'Imputation and scaling inside the pipeline so they fit on training folds only.' },
      { title: 'Engineer a few features', body: 'Price per square metre, age at sale, rooms per floor. Measure each addition.' },
      { title: 'Report honestly', body: 'MAE and RMSE in currency, plus a residual plot showing where the model is worst.' },
    ],
    outcome:
      'A reproducible notebook and script that predicts price with a stated average error, and a short write-up of which features mattered and where the model fails.',
    extensions: [
      'Add SHAP values to explain individual predictions',
      'Wrap it in a FastAPI endpoint with input validation',
      'Add a quantile model to produce a price range rather than a point estimate',
    ],
  },
  {
    slug: 'spam-classifier',
    title: 'Spam classifier',
    level: 'beginner',
    effort: '1 week',
    summary:
      'Text classification from TF-IDF to a threshold chosen for precision, because a legitimate email in the spam folder is the expensive error.',
    prerequisites: ['text-preprocessing', 'bag-of-words-and-tfidf', 'classification-metrics'],
    concepts: ['TF-IDF', 'Naive Bayes', 'Precision vs recall', 'Threshold tuning', 'Class imbalance'],
    stack: ['Python', 'scikit-learn', 'pandas'],
    architecture: [
      'TfidfVectorizer with unigrams and bigrams, min_df to drop noise',
      'MultinomialNB baseline, LogisticRegression for comparison',
      'Precision-recall curve to pick the operating threshold',
    ],
    steps: [
      { title: 'Load and inspect', body: 'Class balance, message length distribution, duplicates.' },
      { title: 'Baseline in six lines', body: 'TF-IDF plus Naive Bayes. Record the score before trying anything clever.' },
      { title: 'Choose the metric deliberately', body: 'Precision on the spam class, with recall reported alongside.' },
      { title: 'Tune the threshold', body: 'Find the lowest threshold that keeps precision above 0.99 and see what recall costs.' },
      { title: 'Inspect the errors', body: 'Read the false positives. They usually reveal a preprocessing decision that hurt.' },
    ],
    outcome:
      'A classifier with a documented operating point, and an error analysis explaining the remaining failures rather than just a score.',
    extensions: [
      'Compare against sentence embeddings plus logistic regression',
      'Add an "uncertain" band routed to a review queue',
      'Measure how performance decays on messages from a later time period',
    ],
  },
  {
    slug: 'churn-predictor',
    title: 'Customer churn predictor',
    level: 'beginner',
    effort: '1–2 weeks',
    summary:
      'The classic imbalanced tabular problem, and the best possible exercise in hunting for leakage.',
    prerequisites: ['feature-engineering', 'trees-and-ensembles', 'validation-strategy'],
    concepts: ['Class imbalance', 'Target leakage', 'Gradient boosting', 'PR-AUC', 'Grouped splits'],
    stack: ['Python', 'pandas', 'scikit-learn', 'LightGBM or XGBoost'],
    architecture: [
      'Feature table built per customer as of a fixed cut-off date',
      'Grouped split by customer id, with a time-based holdout',
      'Gradient boosting with early stopping, class weights tuned',
      'PR-AUC for selection; a cost model to choose the threshold',
    ],
    steps: [
      { title: 'Define the prediction moment', body: 'Churn within 30 days of a cut-off. Every feature must be knowable at that cut-off.' },
      { title: 'Audit every feature for leakage', body: 'Anything recorded after the outcome is disqualified. This step is the project.' },
      { title: 'Build the aggregate features', body: 'Tenure, spend trend, support contacts, days since last activity.' },
      { title: 'Train with early stopping', body: 'Validation on a later time window, not a random split.' },
      { title: 'Turn scores into a decision', body: 'Estimate the value of a retained customer and the cost of an intervention, then pick the threshold that maximises expected value.' },
    ],
    outcome:
      'A model with a business-justified threshold, a ranked retention list, and a written statement of which features were rejected for leakage and why.',
    extensions: [
      'Add SHAP explanations to each flagged customer for the retention team',
      'Simulate the intervention budget at several thresholds',
      'Monitor score drift monthly against the training distribution',
    ],
  },
  {
    slug: 'recommendation-basics',
    title: 'Movie recommendation system',
    level: 'beginner',
    effort: '1–2 weeks',
    summary:
      'Content-based and collaborative recommendation side by side, with an evaluation that respects time order.',
    prerequisites: ['numpy-arrays', 'unsupervised-learning', 'embeddings-explained'],
    concepts: ['Cosine similarity', 'Matrix factorisation', 'Cold start', 'Ranking metrics'],
    stack: ['Python', 'pandas', 'NumPy', 'scikit-learn or implicit'],
    architecture: [
      'Content-based: TF-IDF over genres and synopses, cosine similarity',
      'Collaborative: truncated SVD over the user-item matrix',
      'Time-ordered split: train on earlier ratings, evaluate on later ones',
      'Precision@k and nDCG@k against a popularity baseline',
    ],
    steps: [
      { title: 'Start with popularity', body: 'The most-watched list is a surprisingly strong baseline and the one to beat.' },
      { title: 'Content-based similarity', body: 'Recommend films close to what a user already liked. Handles new items well.' },
      { title: 'Collaborative filtering', body: 'Factorise the interaction matrix. Better personalisation, but useless for a new user.' },
      { title: 'Evaluate as ranking', body: 'Precision@10 and nDCG@10 on the later time window, never a random split.' },
      { title: 'Handle cold start', body: 'Fall back to content-based or popularity when interaction history is thin.' },
    ],
    outcome:
      'Two recommenders with a ranking evaluation against a popularity baseline, and a clear account of when each approach fails.',
    extensions: [
      'Blend both scores into a hybrid ranker',
      'Add diversity so the list is not ten films from one franchise',
      'Replace TF-IDF with sentence embeddings of the synopses',
    ],
  },
  {
    slug: 'image-classifier',
    title: 'Image classifier with transfer learning',
    level: 'intermediate',
    effort: '1–2 weeks',
    summary:
      'A small labelled image set turned into a working classifier by reusing a pretrained backbone.',
    prerequisites: ['images-and-convolution', 'transfer-learning-and-vits', 'regularising-deep-networks'],
    concepts: ['Transfer learning', 'Augmentation', 'Fine-tuning schedules', 'Confusion analysis'],
    stack: ['Python', 'PyTorch', 'torchvision'],
    architecture: [
      'Pretrained ResNet or ConvNeXt backbone from torchvision',
      'Stage one: freeze the backbone, train a new head',
      'Stage two: unfreeze the last block at a tenth of the learning rate',
      'Augmentation: flips, crops, colour jitter — label-preserving only',
    ],
    steps: [
      { title: 'Organise the data', body: 'Class-per-directory, with a held-out test split fixed before any training.' },
      { title: 'Train the head', body: 'Frozen backbone, AdamW, early stopping on validation accuracy.' },
      { title: 'Unfreeze carefully', body: 'A much lower learning rate for pretrained layers than for the new head.' },
      { title: 'Read the confusion matrix', body: 'Which classes are confused, and whether the labels themselves are consistent.' },
      { title: 'Export', body: 'Save weights plus the exact preprocessing transform — a mismatch here silently ruins inference.' },
    ],
    outcome:
      'A classifier trained on a few thousand images with per-class metrics, a confusion matrix, and an inference script that reproduces training-time preprocessing exactly.',
    extensions: [
      'Add Grad-CAM to see which pixels drove a prediction',
      'Export to ONNX and compare latency',
      'Add a rejection option for low-confidence predictions',
    ],
  },
  {
    slug: 'sentiment-analysis',
    title: 'Sentiment analysis: three approaches compared',
    level: 'intermediate',
    effort: '1–2 weeks',
    summary:
      'TF-IDF, a fine-tuned encoder and a zero-shot LLM on the same dataset, compared on accuracy, latency and cost.',
    prerequisites: ['bag-of-words-and-tfidf', 'transformer-architecture', 'prompt-engineering'],
    concepts: ['Baselines', 'Fine-tuning an encoder', 'Zero-shot prompting', 'Cost/quality trade-offs'],
    stack: ['Python', 'scikit-learn', 'Hugging Face Transformers', 'a model API'],
    architecture: [
      'Approach A: TF-IDF plus logistic regression',
      'Approach B: a small pretrained encoder fine-tuned as a classifier',
      'Approach C: zero-shot and few-shot prompting with constrained output',
      'One evaluation harness scoring all three on the same test set',
    ],
    steps: [
      { title: 'Fix the test set first', body: 'Every approach is judged on identical data, or the comparison means nothing.' },
      { title: 'Run the cheap baseline', body: 'It is frequently within a few points of the expensive options.' },
      { title: 'Fine-tune the encoder', body: 'Two or three epochs, low learning rate, early stopping.' },
      { title: 'Prompt the LLM', body: 'Enumerate the labels, constrain the output format, measure at temperature 0.' },
      { title: 'Tabulate the trade-offs', body: 'Accuracy, p95 latency and cost per thousand predictions, side by side.' },
    ],
    outcome:
      'A decision table showing what each approach costs for what accuracy — the artefact an engineering manager actually wants.',
    extensions: [
      'Add aspect-based sentiment rather than a single polarity',
      'Test robustness on sarcasm and negation cases',
      'Distil the LLM’s labels into the small model and re-measure',
    ],
  },
  {
    slug: 'semantic-search-engine',
    title: 'Semantic search engine',
    level: 'intermediate',
    effort: '2 weeks',
    summary:
      'Hybrid search over a document collection, measured with recall@k rather than by how good the results feel.',
    prerequisites: ['embeddings-explained', 'vector-search-and-hybrid', 'chunking-strategies'],
    concepts: ['Embeddings', 'ANN indexes', 'BM25', 'Reciprocal rank fusion', 'Recall@k'],
    stack: ['Python', 'sentence-transformers', 'FAISS or pgvector', 'rank_bm25 or OpenSearch', 'FastAPI'],
    architecture: [
      'Ingestion: parse, chunk on structure, embed, store vectors with metadata',
      'Dense retrieval over an HNSW index; lexical retrieval over BM25',
      'RRF fusion, optional cross-encoder rerank on the top 30',
      'A search API plus a small evaluation script',
    ],
    steps: [
      { title: 'Build a labelled query set', body: 'Thirty real queries with the document that should win. This is what makes the project real.' },
      { title: 'Dense retrieval first', body: 'Measure recall@5 and recall@20 as the baseline.' },
      { title: 'Add BM25 and fuse', body: 'Re-measure. The gain is largest on queries containing identifiers.' },
      { title: 'Add reranking', body: 'Re-measure again and record the latency cost.' },
      { title: 'Expose it', body: 'An endpoint returning results with scores and source metadata.' },
    ],
    outcome:
      'A search service with a measured recall improvement at each stage, and a latency budget you can defend.',
    extensions: [
      'Add metadata filters for tenant, language and date',
      'Compare two embedding models on the same query set',
      'Add query expansion for short queries',
    ],
  },
  {
    slug: 'mlops-pipeline',
    title: 'End-to-end training pipeline',
    level: 'intermediate',
    effort: '2 weeks',
    summary:
      'Take any earlier model and make it reproducible, tracked, tested and deployable by a single command.',
    prerequisites: ['experiment-tracking', 'ci-cd-for-ml', 'serving-and-inference'],
    concepts: ['Experiment tracking', 'Data validation', 'CI/CD', 'Model registry', 'Promotion gates'],
    stack: ['Python', 'MLflow', 'DVC or a dated snapshot', 'GitHub Actions', 'FastAPI', 'Docker'],
    architecture: [
      'Stage 1 validate: schema, ranges and row counts asserted, failing loudly',
      'Stage 2 train: parameterised, seeded, logged to MLflow',
      'Stage 3 evaluate: compared against the current production model on the same holdout',
      'Stage 4 gate: promotion only on a defined improvement margin',
      'Stage 5 serve: containerised API reporting its model version',
    ],
    steps: [
      { title: 'Make one run reproducible', body: 'Config file, fixed seed, pinned dependencies, logged data snapshot id.' },
      { title: 'Add tracking', body: 'Parameters, metrics and artefacts per run, so runs can be compared without notebook archaeology.' },
      { title: 'Add data validation', body: 'Fail before training on corrupt input rather than producing a corrupt model.' },
      { title: 'Automate in CI', body: 'A push runs validation, training on a sample, and the evaluation gate.' },
      { title: 'Serve and version', body: 'The API returns its model version; rollback is redeploying the previous one.' },
    ],
    outcome:
      'One command that goes from raw data to a versioned, served model — plus a CI run that refuses to promote a worse one.',
    extensions: [
      'Add a shadow deployment comparing old and new on live traffic',
      'Add drift monitoring with a weekly PSI report',
      'Add scheduled retraining behind the same promotion gate',
    ],
  },
  {
    slug: 'rag-document-assistant',
    title: 'RAG document assistant',
    level: 'advanced',
    effort: '2–3 weeks',
    summary:
      'Grounded question answering over your own documents, with citations, refusal, and an evaluation suite.',
    prerequisites: ['rag-pipeline', 'reranking-and-context', 'rag-evaluation'],
    concepts: ['Chunking', 'Hybrid retrieval', 'Reranking', 'Grounding', 'Faithfulness evaluation'],
    stack: ['Python', 'FastAPI', 'a vector store', 'an embedding model', 'a model API'],
    architecture: [
      'Ingestion pipeline: parse (preserving headings and tables), chunk, embed, index with metadata',
      'Query path: hybrid retrieve → rerank → top 4 → grounded prompt → generate with citations',
      'Refusal path when the best score is below a relevance floor',
      'Tracing per request: retrieved ids, scores, prompt version, tokens, latency',
      'Evaluation: recall@k on a labelled set, faithfulness and citation accuracy on answers',
    ],
    steps: [
      { title: 'Ingest carefully', body: 'Most RAG quality is decided here. Keep tables intact and prepend heading paths to chunks.' },
      { title: 'Measure retrieval alone', body: 'Before writing any prompt, confirm the right chunk is retrievable.' },
      { title: 'Write a grounded prompt', body: 'Cite ids, answer only from context, and say NOT_IN_DOCS when the answer is absent.' },
      { title: 'Validate citations', body: 'Reject or flag an answer citing an id that was not supplied.' },
      { title: 'Build the eval suite', body: 'Thirty real questions with expected sources, run in CI on every prompt change.' },
      { title: 'Add tracing', body: 'Every answer must be reconstructable three days later.' },
    ],
    outcome:
      'An assistant that answers from your documents with citations, declines when it should, and has numbers proving both.',
    extensions: [
      'Multi-tenant filtering with permissions enforced during retrieval',
      'Streaming responses with citations rendered as they arrive',
      'A feedback control that files thumbs-down answers as eval cases',
    ],
  },
  {
    slug: 'production-llm-api',
    title: 'Production LLM API',
    level: 'advanced',
    effort: '2–3 weeks',
    summary:
      'A hardened service in front of a model: validation, caching, routing, fallbacks, budgets and full observability.',
    prerequisites: ['serving-and-inference', 'latency-throughput-and-cost', 'security-and-privacy'],
    concepts: ['Caching', 'Model routing', 'Fallbacks', 'Rate limiting', 'Structured output', 'Tracing'],
    stack: ['Python', 'FastAPI', 'Redis', 'a model API', 'OpenTelemetry'],
    architecture: [
      'Request validation and per-tenant rate limiting at the edge',
      'Exact-match response cache, plus prompt ordering that preserves prefix caching',
      'Router: small model for simple tasks, larger for complex, with a cross-provider fallback',
      'Schema-constrained output with one validation repair attempt',
      'Per-request metrics: model, tokens in/out, latency, cache hit, cost, trace id',
    ],
    steps: [
      { title: 'Define the contract', body: 'Typed request and response models, with explicit error shapes.' },
      { title: 'Instrument before optimising', body: 'Log the four cost fields from the first commit.' },
      { title: 'Add caching', body: 'Exact match first; measure the hit rate before considering a semantic cache.' },
      { title: 'Route and fall back', body: 'A timeout or rate limit on the primary must not become an outage.' },
      { title: 'Load test', body: 'Report p50, p95 and p99 for time-to-first-token and total time.' },
      { title: 'Harden', body: 'Budget caps per tenant, output filtering, no secrets in prompts.' },
    ],
    outcome:
      'A service with a published latency and cost profile, a measured cache hit rate, and a documented failure behaviour.',
    extensions: [
      'Add a semantic cache with a threshold validated against false hits',
      'Add streaming with server-sent events',
      'Add a canary route for prompt changes at 5% of traffic',
    ],
  },
  {
    slug: 'ai-research-assistant',
    title: 'AI research assistant',
    level: 'advanced',
    effort: '3 weeks',
    summary:
      'A multi-step agent that searches, reads, synthesises and cites — with budgets and a trajectory evaluation.',
    prerequisites: ['what-is-an-agent', 'tool-calling', 'agent-reliability'],
    concepts: ['Orchestrator and workers', 'Tool design', 'Source attribution', 'Budget limits', 'Trajectory evaluation'],
    stack: ['Python', 'a model API with tool calling', 'a search API', 'a vector store'],
    architecture: [
      'Planner decomposes the question into sub-questions',
      'Workers run search and fetch in parallel, extracting claims with sources',
      'Synthesiser merges findings, resolving contradictions explicitly',
      'Caps on steps, tokens, wall-clock and spend; state checkpointed per step',
      'Every claim in the output carries a source it can be checked against',
    ],
    steps: [
      { title: 'Start as a workflow', body: 'Fixed decompose → search → synthesise. Prove that works before adding autonomy.' },
      { title: 'Design tools narrowly', body: 'search(query), fetch(url), extract(text, question). Typed and described precisely.' },
      { title: 'Track provenance', body: 'Every extracted claim keeps its source URL from the moment it is created.' },
      { title: 'Add budgets', body: 'A research agent without spend caps is an unbounded bill.' },
      { title: 'Evaluate the trajectory', body: 'Did it search sensibly, avoid redundant steps, and recover from failures?' },
    ],
    outcome:
      'A research tool producing sourced briefs within a bounded budget, with traces showing exactly how each answer was assembled.',
    extensions: [
      'Add a contradiction detector that flags disagreeing sources',
      'Cache fetched pages to make runs repeatable',
      'Add a human review step before the brief is published',
    ],
  },
  {
    slug: 'multi-tool-agent',
    title: 'Multi-tool operations agent',
    level: 'advanced',
    effort: '3 weeks',
    summary:
      'An internal agent that queries data and takes actions, with authorisation, approval gates and a full audit trail.',
    prerequisites: ['tool-calling', 'agent-memory-and-state', 'security-and-privacy'],
    concepts: ['Tool authorisation', 'Human in the loop', 'Idempotency', 'Audit logging', 'Prompt injection defence'],
    stack: ['Python', 'a model API', 'PostgreSQL', 'a task queue', 'FastAPI'],
    architecture: [
      'Read tools (search, lookup, report) run autonomously',
      'Write tools (create ticket, send message, refund) require explicit approval',
      'Authorisation checked inside every tool against the requesting user',
      'Idempotency keys so a retry cannot duplicate an action',
      'Every decision, tool call and result written to an append-only audit log',
    ],
    steps: [
      { title: 'Define the capability boundary', body: 'List exactly what the agent may do. Anything not listed is not callable.' },
      { title: 'Build read tools first', body: 'Get value with zero blast radius before adding any write.' },
      { title: 'Gate the writes', body: 'A proposal the agent produces and a human approves, not a direct action.' },
      { title: 'Make actions idempotent', body: 'Retries are inevitable; duplicate refunds must not be.' },
      { title: 'Test against injection', body: 'Feed it documents containing hostile instructions and confirm nothing escalates.' },
    ],
    outcome:
      'An agent that saves real time on internal operations, with an audit trail and a demonstrated inability to take an unapproved irreversible action.',
    extensions: [
      'Add a per-user permission model reflected in the available tool set',
      'Add anomaly detection on the agent’s own action patterns',
      'Add a dry-run mode that shows the plan without executing it',
    ],
  },
  {
    slug: 'llm-evaluation-platform',
    title: 'LLM evaluation platform',
    level: 'expert',
    effort: '3–4 weeks',
    summary:
      'A harness that runs prompt and model changes against test cases and reports whether quality moved — the tool every LLM team needs and few build.',
    prerequisites: ['genai-evaluation', 'prompt-infrastructure', 'observability-and-evals'],
    concepts: ['Eval sets', 'Assertions vs judges', 'Judge validation', 'Regression gates', 'Cost tracking'],
    stack: ['Python', 'a model API', 'PostgreSQL', 'GitHub Actions', 'a small web UI'],
    architecture: [
      'Case store: input, expected properties, tags, source (real traffic or authored)',
      'Runner: executes each case against a named prompt version and model, in parallel',
      'Scorers: deterministic assertions first, an LLM judge with a rubric where needed',
      'Judge validation: a human-graded sample measuring agreement with the judge',
      'Report: per-case diffs against the previous run, plus cost and latency deltas',
      'CI gate: block a change that regresses any high-severity case',
    ],
    steps: [
      { title: 'Model the case', body: 'Expected properties, not golden strings — "cites a real id", "returns valid JSON", "declines".' },
      { title: 'Write deterministic scorers first', body: 'They are free, fast and unambiguous. Use a judge only for what they cannot check.' },
      { title: 'Validate the judge', body: 'Grade a sample by hand and report agreement. An unvalidated judge is a number with no meaning.' },
      { title: 'Diff runs', body: 'Which cases changed verdict is the useful output, not the aggregate score.' },
      { title: 'Gate CI', body: 'A prompt or model change that regresses a critical case does not merge.' },
    ],
    outcome:
      'A repeatable harness that turns "it feels better" into a per-case diff with cost and latency attached.',
    extensions: [
      'Pairwise comparison mode with position-bias correction',
      'Automatic case capture from thumbs-down production traces',
      'Cost-per-case tracking to catch a change that doubles token use',
    ],
  },
  {
    slug: 'ai-coding-assistant',
    title: 'Repository-aware coding assistant',
    level: 'expert',
    effort: '4 weeks',
    summary:
      'Code-aware retrieval plus generation: answers questions about a real repository and proposes patches with tests.',
    prerequisites: ['chunking-strategies', 'structured-output-and-tools', 'agent-reliability'],
    concepts: ['Code chunking', 'Symbol-aware retrieval', 'Patch generation', 'Test-driven verification', 'Sandboxing'],
    stack: ['Python', 'tree-sitter', 'a vector store', 'a model API', 'a sandboxed runner'],
    architecture: [
      'Index: parse with tree-sitter, chunk per function and class with file path and symbol metadata',
      'Retrieval: hybrid over code and docstrings, plus exact symbol lookup',
      'Question answering: grounded in retrieved code with file and line citations',
      'Patch mode: propose a unified diff, apply it in a sandbox, run the tests, report',
      'Never apply to the working tree without explicit approval',
    ],
    steps: [
      { title: 'Chunk along syntax', body: 'Function and class boundaries, never a fixed character count — a half function retrieves as noise.' },
      { title: 'Add symbol search', body: 'Exact identifier lookup is what embeddings are worst at and developers need most.' },
      { title: 'Answer with citations', body: 'File path and line range for every claim, so the answer is checkable.' },
      { title: 'Generate patches as diffs', body: 'A diff is reviewable; a rewritten file is not.' },
      { title: 'Verify by running tests', body: 'In a sandbox, with a time limit and no network. A patch that fails tests is rejected automatically.' },
    ],
    outcome:
      'An assistant that answers repository questions with citations and proposes test-verified patches, without ever writing to the tree unapproved.',
    extensions: [
      'Index git history so it can explain why code changed',
      'Add a review mode that comments on a diff instead of producing one',
      'Measure patch acceptance rate as the primary metric',
    ],
  },
  {
    slug: 'ai-platform',
    title: 'Internal AI platform',
    level: 'expert',
    effort: '4–6 weeks',
    summary:
      'The capstone: a shared gateway several AI features run on, with routing, evals, cost attribution and governance.',
    prerequisites: ['latency-throughput-and-cost', 'observability-and-evals', 'ci-cd-for-ml'],
    concepts: ['Gateway pattern', 'Prompt registry', 'Cost attribution', 'Evaluation as CI', 'Governance'],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'OpenTelemetry', 'Docker'],
    architecture: [
      'Gateway: one entry point for every model call, with auth, quotas and routing',
      'Prompt registry: versioned templates, retrieved by name, logged with every call',
      'Cache layer: exact and prefix-aware, with hit-rate reporting per consumer',
      'Evaluation service: the harness run against every prompt or model change',
      'Cost attribution: tokens and spend per team, feature and tenant',
      'Governance: which models are approved, what data may reach them, retention rules',
    ],
    steps: [
      { title: 'Start with the gateway', body: 'Even a thin proxy that logs tokens and enforces quotas pays for itself immediately.' },
      { title: 'Move prompts into the registry', body: 'Prompts in application code cannot be versioned, tested or rolled back.' },
      { title: 'Add evaluation as a gate', body: 'Reuse the evaluation platform so no consumer can ship an unmeasured change.' },
      { title: 'Attribute cost', body: 'Per-feature spend is what makes the trade-off conversation possible.' },
      { title: 'Write the governance rules down', body: 'Approved models, permitted data classes, retention periods, and who approves an exception.' },
    ],
    outcome:
      'A platform several features depend on, with a single place to see spend, quality and latency — and to change a model without touching every consumer.',
    extensions: [
      'Self-service onboarding for a new feature',
      'Automatic rollback when an eval gate fails post-deploy',
      'A dashboard showing quality and cost trends per feature over time',
    ],
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function projectsByLevel(level: Level): Project[] {
  return PROJECTS.filter((project) => project.level === level);
}
