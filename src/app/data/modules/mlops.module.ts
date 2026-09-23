import { Module } from '../../core/models/content.models';

export const mlopsModule: Module = {
  slug: 'mlops',
  title: 'MLOps and Career',
  short: 'MLOps',
  stage: 15,
  level: 'advanced',
  tagline: 'Experiment tracking, pipelines, CI/CD, drift monitoring — and which role is which.',
  description:
    'MLOps is the operational discipline that keeps models working after the first deploy. This ' +
    'stage also maps the roles in the field, because "AI engineer", "ML engineer" and "data ' +
    'scientist" mean different things and the distinction decides what you should be learning next.',
  topics: [
    {
      slug: 'experiment-tracking',
      title: 'Experiment tracking and model versioning',
      module: 'mlops',
      level: 'intermediate',
      minutes: 7,
      summary: 'Recording what you ran so a result can be explained, compared and reproduced.',
      why: 'A project is dozens of runs. Without tracking, "which configuration produced the model in production?" becomes unanswerable within about two weeks.',
      prerequisites: ['environments-and-packaging', 'ml-fundamentals'],
      outcomes: [
        'Log parameters, metrics and artefacts per run',
        'Explain what a model registry adds over a file on disk',
        'Version data alongside code',
      ],
      tags: ['mlflow', 'tracking', 'versioning'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**Parameters** — every hyperparameter, the feature list, the random seed.',
            '**Metrics** — training and validation curves, final test numbers, timing.',
            '**Artefacts** — the model file, the preprocessing objects, plots, the confusion matrix.',
            '**Provenance** — git commit, data snapshot id, library versions, who ran it and when.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A tracked run',
          code: `import mlflow

mlflow.set_experiment("churn-classifier")

with mlflow.start_run(run_name="hgb-lr005"):
    mlflow.log_params({"model": "hist_gb", "learning_rate": 0.05, "max_leaf_nodes": 31})
    mlflow.log_param("data_snapshot", "2026-09-01")

    model.fit(X_train, y_train)

    mlflow.log_metrics({
        "val_pr_auc": val_pr_auc,
        "test_pr_auc": test_pr_auc,
        "train_seconds": elapsed,
    })
    mlflow.sklearn.log_model(model, "model")
    mlflow.log_artifact("reports/confusion_matrix.png")`,
        },
        {
          kind: 'text',
          body: 'A **model registry** adds lifecycle on top: named models, versions, stage transitions (staging → production → archived), and a record of who promoted what. It is the mechanism that lets you roll back to the previous model in one action.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Version the data too',
          body: 'A model is a function of code *and* data. Tools such as DVC, LakeFS or a dated snapshot in object storage give you a reference you can pin in the run record — without it, reproducibility is a fiction.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'mlops-1',
            prompt: 'Production accuracy dropped after a deploy. What lets you respond in minutes?',
            options: [
              'Retraining from scratch',
              'A registry with the previous version, so you can roll back and then investigate',
              'Reading the training logs',
              'Adding more features',
            ],
            answer: 1,
            explanation:
              'Restore service first, diagnose second. That is only possible if the previous model version is addressable and deployable as an artefact rather than something you rebuild.',
          },
        },
      ],
      resources: [
        { label: 'MLflow documentation', url: 'https://mlflow.org/docs/latest/index.html', kind: 'docs' },
        { label: 'DVC documentation', url: 'https://dvc.org/doc', kind: 'docs' },
        { label: 'Weights & Biases documentation', url: 'https://docs.wandb.ai/', kind: 'tool' },
      ],
      related: ['ci-cd-for-ml', 'monitoring-and-drift'],
    },
    {
      slug: 'ci-cd-for-ml',
      title: 'Pipelines and CI/CD for ML',
      module: 'mlops',
      level: 'advanced',
      minutes: 8,
      summary: 'Automating the path from data to deployed model, with gates that can refuse.',
      why: 'Manual training and deployment does not survive contact with a second model or a second person. Pipelines make the process repeatable and auditable.',
      prerequisites: ['experiment-tracking', 'git-and-collaboration'],
      outcomes: [
        'Break training into discrete, cacheable stages',
        'Define quality gates that block a bad model',
        'Choose a rollout strategy for a model change',
      ],
      tags: ['ci/cd', 'pipelines', 'airflow', 'deployment'],
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Ingest and validate', body: 'Pull the data and assert its schema, ranges and volume. Fail here rather than training on corrupt input.' },
            { title: 'Transform', body: 'Feature computation, shared between training and serving to avoid skew.' },
            { title: 'Train', body: 'Reproducible, parameterised, logged to the tracking server.' },
            { title: 'Evaluate', body: 'Against the current production model, on the same held-out data.' },
            { title: 'Gate', body: 'Promote only if it beats the incumbent by a defined margin and passes fairness and latency checks.' },
            { title: 'Deploy', body: 'Register, then roll out gradually.' },
            { title: 'Monitor', body: 'Which feeds the next iteration.' },
          ],
        },
        {
          kind: 'table',
          head: ['Rollout', 'How', 'Good for'],
          rows: [
            ['Shadow', 'New model scores traffic without serving it', 'Validating on real inputs at zero risk'],
            ['Canary', 'A small percentage of traffic', 'Catching problems with limited exposure'],
            ['A/B', 'Split traffic and compare outcomes', 'Measuring business impact, not just offline metrics'],
            ['Blue/green', 'Switch all traffic, keep the old one warm', 'Fast rollback'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Training/serving skew',
          body: 'If features are computed one way in the training notebook and another way in the serving code, the model sees different inputs in production than it was trained on. Share the transformation code, or use a feature store so both paths compute from one definition.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cicd-1',
            prompt: 'Offline metrics improved but the business metric got worse after deploy. What would have caught this?',
            options: [
              'More training data',
              'A shadow or canary rollout, and an A/B test measuring the business metric',
              'A larger model',
              'More cross-validation folds',
            ],
            answer: 1,
            explanation:
              'Offline metrics are a proxy. Only a controlled rollout against the real objective tells you whether the proxy held — which is why model deployment is a measurement exercise, not a release step.',
          },
        },
      ],
      resources: [
        { label: 'GitHub Actions documentation', url: 'https://docs.github.com/en/actions', kind: 'docs' },
        { label: 'Kubeflow Pipelines', url: 'https://www.kubeflow.org/docs/components/pipelines/', kind: 'docs' },
      ],
      related: ['monitoring-and-drift', 'serving-and-inference'],
    },
    {
      slug: 'monitoring-and-drift',
      title: 'Monitoring, drift and retraining',
      module: 'mlops',
      level: 'advanced',
      minutes: 8,
      summary: 'Models decay. Detecting it, distinguishing the kinds, and deciding when to retrain.',
      why: 'Accuracy is measured once at launch and then assumed forever. The world moves; a model trained on last year’s behaviour is predicting a distribution that no longer exists.',
      prerequisites: ['ci-cd-for-ml', 'validation-strategy'],
      outcomes: [
        'Distinguish data drift from concept drift',
        'Monitor a model without immediate ground truth',
        'Choose a retraining trigger',
      ],
      tags: ['drift', 'monitoring', 'retraining'],
      blocks: [
        {
          kind: 'table',
          head: ['Kind', 'What changed', 'Example'],
          rows: [
            ['Data drift', 'The input distribution', 'A new market shifts the age profile of users'],
            ['Concept drift', 'The input–output relationship', 'Fraud tactics change, so the same signals mean something new'],
            ['Label drift', 'The target distribution', 'Churn rate doubles after a pricing change'],
            ['Upstream change', 'A pipeline, not the world', 'A column starts arriving in a different unit'],
          ],
        },
        {
          kind: 'text',
          body: 'Labels usually arrive late — sometimes months late — so you cannot monitor accuracy directly. Monitor proxies instead: input feature distributions against training, the distribution of predicted scores, the null and default rate per feature, and any immediate behavioural signal such as click-through or override rate.',
        },
        {
          kind: 'visual',
          id: 'drift',
          caption: 'Eight weeks of a feature distribution sliding away from training.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A cheap, dependency-free drift check',
          code: `import numpy as np


def psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """Population Stability Index. Below 0.1 stable, 0.1-0.25 watch, above 0.25 drifted."""
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf

    e = np.histogram(expected, bins=edges)[0] / len(expected)
    a = np.histogram(actual, bins=edges)[0] / len(actual)

    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))


print(round(psi(train_scores, last_week_scores), 3))`,
        },
        {
          kind: 'list',
          items: [
            '**Scheduled retraining** — weekly or monthly. Simple, predictable, sometimes wasteful.',
            '**Triggered retraining** — when drift or a performance proxy crosses a threshold. Efficient, needs monitoring you trust.',
            '**Continuous** — an online pipeline. Powerful and the hardest to operate safely.',
            '**Whichever you choose**, the new model goes through the same evaluation gate. Automatic retraining without a gate automates shipping a worse model.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'drift-1',
            prompt: 'Input distributions are unchanged but accuracy is falling. What kind of drift?',
            options: [
              'Data drift',
              'Concept drift — the relationship between inputs and the target changed',
              'Label drift',
              'No drift; it is a bug',
            ],
            answer: 1,
            explanation:
              'Stable inputs with degrading performance means the mapping itself moved. Retraining on recent labelled data is the remedy; feature monitoring alone would never have flagged it.',
          },
        },
      ],
      resources: [
        { label: 'Evidently AI documentation', url: 'https://docs.evidentlyai.com/', kind: 'tool' },
        { label: 'Google: rules of machine learning', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml', kind: 'docs' },
      ],
      related: ['observability-and-evals', 'ai-roles'],
    },
    {
      slug: 'ai-roles',
      title: 'The roles: who does what',
      module: 'mlops',
      level: 'beginner',
      minutes: 7,
      summary: 'Data scientist, ML engineer, AI engineer, LLM engineer, ML platform engineer — and what each interviews for.',
      why: 'These titles are used loosely and the day-to-day work differs substantially. Knowing which one you are aiming at tells you which parts of this curriculum to go deep on.',
      prerequisites: ['ml-fundamentals'],
      outcomes: [
        'Distinguish the roles by their actual output',
        'Identify which skills each interview emphasises',
        'Choose a specialisation to go deep on',
      ],
      tags: ['career', 'roles', 'interview'],
      blocks: [
        {
          kind: 'table',
          head: ['Role', 'Output', 'Core skills', 'Interview weight'],
          rows: [
            ['Data scientist', 'Analysis, experiments, models that inform decisions', 'Statistics, SQL, experiment design, communication', 'Stats, A/B testing, case studies'],
            ['ML engineer', 'Trained models running in production', 'Python, ML depth, pipelines, serving', 'ML theory + coding + system design'],
            ['AI engineer', 'Products built on existing models', 'APIs, RAG, agents, evaluation, product sense', 'LLM system design, integration, evals'],
            ['LLM engineer', 'Model adaptation and serving', 'Transformers, fine-tuning, quantisation, inference', 'Transformer internals, PEFT, GPU reality'],
            ['ML platform engineer', 'The infrastructure others build on', 'Kubernetes, GPUs, CI/CD, observability', 'Distributed systems, infrastructure'],
            ['Research engineer', 'Novel methods and experiments', 'Maths, papers, large-scale training', 'Depth, derivations, paper discussion'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'AI engineering is the widest current on-ramp',
          body: 'It rewards software engineering skill plus applied LLM knowledge, and needs less mathematical depth than research or core ML roles. If you are a developer moving into AI, this is usually the shortest credible path — and the RAG, agents and production stages here are the ones to master.',
        },
        {
          kind: 'list',
          items: [
            '**All roles expect**: solid Python, git, the ability to read a metric honestly, and clear explanations of trade-offs.',
            '**Portfolio beats certificates.** Two or three deployed projects with an honest write-up of what did not work is stronger evidence than a list of courses.',
            '**Depth beats breadth in interviews.** One project you can defend in detail, including its failures, outperforms eight shallow ones.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'role-1',
            prompt: 'You are a backend developer wanting the fastest credible route into AI work. Which role fits best?',
            options: [
              'Research engineer',
              'AI engineer — it builds directly on software engineering skill plus applied LLM knowledge',
              'Data scientist',
              'ML platform engineer',
            ],
            answer: 1,
            explanation:
              'AI engineering reuses your existing strengths — APIs, systems, testing, deployment — and adds prompting, retrieval, agents and evaluation on top, rather than requiring a research-level mathematics foundation first.',
          },
        },
      ],
      resources: [
        { label: 'Full Stack Deep Learning course', url: 'https://fullstackdeeplearning.com/', kind: 'course' },
        { label: 'Made With ML', url: 'https://madewithml.com/', kind: 'course' },
      ],
      related: ['monitoring-and-drift', 'serving-and-inference'],
    },
  ],
};
