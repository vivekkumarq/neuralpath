# NeuralPath

**A structured AI/ML engineering curriculum — from machine learning fundamentals to LLM, RAG and agent engineering.**

Live site: **https://vivekkumarq.github.io/neuralpath/**

A static, interactive learning platform that answers one question in order: *I know little or nothing about AI/ML — where do I start, what comes next, why does it matter, and how do I practise it?*

---

## What it covers

Sixteen stages, in dependency order. Each one exists because the previous one runs out.

| Stage | Module | What it covers |
| --- | --- | --- |
| 0 | Engineering Foundations | Python for ML, environments and reproducibility, git, shell and remote machines, APIs and HTTP |
| 1 | Mathematics for ML | Vectors and matrices, probability and statistics, derivatives and gradient descent |
| 2 | Data and Feature Engineering | NumPy, pandas, cleaning and encoding, feature engineering, EDA |
| 3 | Machine Learning | Learning fundamentals, linear and logistic regression, trees and ensembles, SVM/KNN/Naive Bayes, clustering and PCA, overfitting and cross-validation |
| 4 | Model Evaluation | Classification metrics and the confusion matrix, regression metrics, splits and leakage |
| 5 | Deep Learning | Perceptron to network, activations, backpropagation, optimisers and schedules, regularisation, frameworks |
| 6 | Computer Vision | Images and convolution, CNN architectures, detection and segmentation, transfer learning and ViTs |
| 7 | NLP | Tokenisation, bag of words and TF-IDF, word embeddings, RNNs and the road to attention |
| 8 | Transformers | Self-attention, multi-head attention and position, the full transformer block |
| 9 | Generative AI | Foundation models, prompt engineering, structured output and tool calling, evaluation and hallucination |
| 10 | LLM Engineering | Tokens and context, sampling parameters, embeddings, prompt infrastructure and caching |
| 11 | RAG | The pipeline, chunking, vector and hybrid search, reranking and context, evaluation |
| 12 | Fine-Tuning | Prompting vs RAG vs fine-tuning, supervised fine-tuning, LoRA and QLoRA |
| 13 | AI Agents | What an agent is, tool design, memory and orchestration, reliability and guardrails |
| 14 | Production AI Engineering | Serving and inference, latency/throughput/cost, observability, prompt injection and privacy |
| 15 | MLOps and Career | Experiment tracking, pipelines and CI/CD, drift and retraining, which role is which |

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

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs the tests, regenerates the sitemap, builds with `--base-href /neuralpath/`, copies `index.html` to `404.html` so deep links survive a refresh on GitHub Pages, adds `.nojekyll`, and publishes to GitHub Pages.

To deploy elsewhere, build with the base href for that host and serve `dist/neuralpath/browser` as static files with an SPA fallback to `index.html`.

## Sources and originality

All explanations, examples, diagrams, quizzes, projects and interview answers are original work written for this site. Where a claim belongs to someone else — a paper, a benchmark, a documented API behaviour — it is linked to its primary source. The learning structure was informed by two external Udemy courses, which are credited and linked on the resources page as optional companions; no course material is reproduced, and the site stands on its own.

The [what to learn now](https://vivekkumarq.github.io/neuralpath/now) page carries a review date, because that kind of claim expires. If it looks stale, trust the linked source over this site.

## Corrections

Found a wrong formula, a misleading explanation, a dead link, or a metric described the wrong way round? [Open an issue](https://github.com/vivekkumarq/neuralpath/issues). Specific corrections with a source are the most useful thing you can send.

## Licence

Code is MIT licensed. Written content is © 2026 Vivek Kumar.

---

**Vivek Kumar** · [GitHub](https://github.com/vivekkumarq) · [LinkedIn](https://www.linkedin.com/in/vivekkumarq)
