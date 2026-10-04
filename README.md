# NeuralPath

**A structured AI/ML engineering curriculum — from machine learning fundamentals to LLM, RAG and agent engineering.**

Live site: **https://neuralpath.duckdns.org**

A static, interactive learning platform that answers one question in order: *I know little or nothing about AI/ML — where do I start, what comes next, why does it matter, and how do I practise it?*

---

## What it covers

18 stages and 88 topics, in dependency order. Each stage exists because the previous one runs out.

| Stage | Module | Topics |
| --- | --- | --- |
| 0 | Start Here: What AI Actually Is | AI, machine learning, deep learning: what the words mean, How a machine actually learns, Where AI is actually used, and who builds it |
| 1 | Engineering Foundations | Your first Python, from nothing, Python for machine learning, Environments, packaging and reproducibility, Git, GitHub and working in the open, Shell, Linux and remote machines, APIs, JSON and HTTP |
| 2 | Mathematics for ML | Vectors, matrices and why everything is one, Probability and statistics you will actually use, Derivatives, gradients and optimisation |
| 3 | Data and Feature Engineering | NumPy: arrays, shapes and vectorisation, pandas: loading, reshaping and grouping data, Cleaning: missing values, categories and scaling, Feature engineering, Exploratory data analysis |
| 4 | Machine Learning | What learning means, Linear and logistic regression, Decision trees, random forests and gradient boosting, SVM, KNN and Naive Bayes, Clustering and dimensionality reduction, Overfitting, bias, variance and cross-validation, Anomaly and outlier detection, Time series forecasting, Recommender systems |
| 5 | Model Evaluation | Classification metrics and the confusion matrix, Regression metrics, Splits, leakage and honest evaluation |
| 6 | Deep Learning | From perceptron to network, Activation functions, Backpropagation, Optimisers, learning rates and batch size, Dropout, normalisation and early stopping, PyTorch, TensorFlow and the framework question, Autoencoders and self-supervised learning |
| 7 | Computer Vision | Images as tensors, and what convolution does, CNN architectures and feature hierarchies, Detection and segmentation, Transfer learning and vision transformers |
| 8 | Natural Language Processing | Tokenisation and text preprocessing, Bag of words and TF-IDF, Word embeddings, RNNs, LSTMs and the road to attention, Classical NLP tasks: tagging, entities and topics |
| 9 | Transformers | Self-attention: query, key, value, Multi-head attention and positional encoding, The full transformer block |
| 10 | Generative AI | Foundation models and how they are trained, Prompt engineering that survives contact with production, Structured output and tool calling, Evaluating generative systems, Beyond text: vision, speech and image generation, Speech and audio, from waveform to transcript |
| 11 | LLM Engineering | Tokens, context windows and cost, Inference parameters: temperature, top-k, top-p, Embeddings: text as geometry, Prompt infrastructure: templates, versions and caching, Hugging Face and running open models, Choosing a model: quality, latency and cost |
| 12 | Retrieval-Augmented Generation | The RAG pipeline end to end, Chunking strategies, Vector search, filtering and hybrid retrieval, Reranking and context construction, Evaluating a RAG system, Query rewriting, expansion and graph retrieval |
| 13 | Fine-Tuning and Adaptation | Prompting vs RAG vs fine-tuning, Supervised fine-tuning and instruction tuning, LoRA, QLoRA and parameter-efficient tuning |
| 14 | Reinforcement Learning | Agents, rewards and the Markov decision process, Deep Q-networks, policy gradients and PPO, RLHF, reward models and DPO |
| 15 | AI Agents | What an agent actually is, Tools: design, execution and errors, Memory, state and orchestration, Reliability, guardrails and evaluation, Orchestration frameworks: LangChain, LangGraph and MCP |
| 16 | Production AI Engineering | Serving models and exposing them as APIs, Latency, throughput and cost control, Observability for AI systems, Prompt injection, data privacy and abuse, Shipping the interface: streaming, state and trust, Ethics, bias and fairness, Governance and regulation |
| 17 | MLOps and Career | Experiment tracking and model versioning, Pipelines and CI/CD for ML, Monitoring, drift and retraining, The roles: who does what |

Plus **15 projects** (beginner to expert), an **interview bank** across 17 categories, a **glossary**, a curated **resource library**, and a dated **"what to learn now"** page.

Every topic has to answer six questions before it is considered finished: what is it, why does it exist, how does it work, where is it used, what comes before it, and what comes after.

## Features

- **Interactive figures, not decoration.** Move the learning rate and watch gradient descent diverge; edit a confusion matrix and watch precision and recall pull apart; click a token and see what attention weights; step through the RAG pipeline and the agent loop.
- **Interview preparation** with answers, reasoning, the mistake that sounds right, and the follow-up questions — filterable by category, difficulty and question type, with a practice mode and a random-question drill.
- **Progress tracking and bookmarks** in `localStorage`. No account, no backend, nothing leaves the browser.
- **Command palette** (<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>) searching topics, modules, questions, projects, glossary terms and resources at once.
- **Learner profiles** — pick "developer moving into AI", "interview candidate" and so on, and the roadmap reorders around it.
- **Dark and light themes**, focus mode, reading progress, table of contents, prev/next, copy-to-clipboard code blocks.
- **Accessible and responsive**: semantic HTML, keyboard navigation, visible focus states, ARIA labels, `prefers-reduced-motion` respected, mobile navigation designed rather than shrunk.

## Technology

- **Angular 22** with standalone components, signals and strict TypeScript
- **SCSS** with CSS custom properties for theming — no UI framework
- **Hand-written SVG and CSS** for every diagram, so they scale, theme correctly and cost almost nothing to download
- **No backend, no database, no authentication, no analytics, no runtime dependencies** beyond Angular and RxJS
- Route-level code splitting; the content data loads on demand rather than in the initial bundle

## Local development

```bash
npm install
npm start          # http://localhost:4200
```

```bash
npm run build      # production build into dist/neuralpath
npm test           # content integrity and unit tests
npm run sitemap    # regenerate public/sitemap.xml from the content data
```

Requires Node 22 or newer.

## Project structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/        # the content model: Topic, Module, Block, Question, Project…
│   │   └── services/      # theme, storage, progress, bookmarks, search, SEO, UI state
│   ├── data/
│   │   ├── modules/       # one file per curriculum stage
│   │   ├── questions/     # interview bank, grouped by area
│   │   ├── glossary/      # glossary terms
│   │   ├── curriculum.ts  # aggregates the modules, plus lookup helpers
│   │   ├── projects.ts    # project specifications
│   │   ├── resources.ts   # curated external resources
│   │   └── now.ts         # dated "what to learn now" list and learner profiles
│   ├── features/          # one folder per page, all lazily loaded
│   ├── layout/            # header, mobile drawer, command palette, footer, chrome
│   ├── shared/            # icon, logo, code block, content renderer, quizzes, visuals
│   ├── app.routes.ts
│   └── app.config.ts
├── styles/                # design tokens, element defaults, shared components
└── index.html
```

Content is data, not markup: adding a topic means adding an object to a module file. No new route, no new component, no template change. `npm test` then verifies that every prerequisite, related topic, project prerequisite and learner path resolves to something real, that quiz ids are unique and their answer indices valid, that table rows match their headers, and that every external link is absolute HTTPS.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs the tests, regenerates the sitemap, builds with `--base-href /`, copies `index.html` to `404.html` so deep links survive a refresh on GitHub Pages, adds `.nojekyll`, and publishes to GitHub Pages.

To deploy elsewhere, build with the base href for that host and serve `dist/neuralpath/browser` as static files with an SPA fallback to `index.html`.

## Sources and originality

All explanations, examples, diagrams, quizzes, projects and interview answers are original work written for this site. Where a claim belongs to someone else — a paper, a benchmark, a documented API behaviour — it is linked to its primary source. The learning structure was informed by two external Udemy courses, which are credited and linked on the resources page as optional companions; no course material is reproduced, and the site stands on its own.

The [what to learn now](https://neuralpath.duckdns.org/now) page carries a review date, because that kind of claim expires. If it looks stale, trust the linked source over this site.

## Corrections

Found a wrong formula, a misleading explanation, a dead link, or a metric described the wrong way round? [Open an issue](https://github.com/vivekkumarq/neuralpath/issues). Specific corrections with a source are the most useful thing you can send.

## Licence

Code is MIT licensed. Written content is © 2026 Vivek Kumar.

---

**Vivek Kumar** · [GitHub](https://github.com/vivekkumarq) · [LinkedIn](https://www.linkedin.com/in/vivekkumarq)
