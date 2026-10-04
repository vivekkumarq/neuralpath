import { Module } from '../../core/models/content.models';

export const mlopsModule: Module = {
  slug: 'mlops',
  title: 'MLOps and Career',
  short: 'MLOps',
  stage: 17,
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
      minutes: 10,
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
          kind: 'text',
          body: 'A model run has far more inputs than code: the data snapshot, the preprocessing, the hyperparameters, the random seed, the library versions and the hardware. Change any one and the result changes. Tracking exists so that a number you reported three weeks ago can still be explained, and ideally reproduced.',
        },
        {
          kind: 'text',
          body: 'The failure this prevents is specific and extremely common. A model is in production. Someone asks why it behaves oddly on a segment. Nobody can say which data it was trained on, which parameters won, or what else was tried and rejected. The only remaining option is to retrain from scratch and hope — which is expensive and may not reproduce.',
        },
        {
          kind: 'heading',
          text: 'What a run has to record',
        },
        {
          kind: 'list',
          items: [
            '**The git commit** of the training code, and whether the tree was dirty.',
            '**The data version** — a snapshot id, a hash, or a query with a timestamp. "The customers table" is not a version.',
            '**Every hyperparameter**, including the ones left at their defaults, because defaults change between library versions.',
            '**Metrics over time**, not only the final number, so you can see whether it converged or was stopped early.',
            '**The artefact** — the weights plus the fitted preprocessing, versioned together, since a mismatch between them produces silently wrong predictions.',
            '**The environment**, as a lockfile or an image digest.',
          ],
        },
        {
          kind: 'heading',
          text: 'Seeds buy repeatability, not reproducibility',
        },
        {
          kind: 'text',
          body: 'Setting a seed makes a run repeatable on the same machine with the same versions. It does not survive a different GPU, a different cuDNN version, or non-deterministic kernels. Treat an exact-match reproduction as a bonus and aim instead for *statistical* reproducibility: the result should hold across several seeds. If it does not, the finding was noise, and that is worth discovering before it ships.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Log the failures too',
          body: 'The runs that did not work are the record of what you already ruled out. Without them, the team repeats the same dead ends every few months, usually with a new hire doing the repeating.',
        },
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
      minutes: 10,
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
          kind: 'text',
          body: 'One more reason the model gate matters: machine learning has no compiler. A pipeline can run end to end, produce an artefact, pass every unit test and deploy a model that predicts a single constant. Nothing in the toolchain objects, because nothing in the toolchain knows what the output is supposed to mean. An evaluation gate is the only thing standing between that and production.',
        },

        {
          kind: 'text',
          body: 'Continuous integration for software asks one question: does the code still work? For machine learning there are three, because a model has three inputs that can each break independently — the code, the data and the trained artefact. A pipeline that only tests the first will ship a broken model with every test passing.',
        },
        {
          kind: 'heading',
          text: 'The gates worth having',
        },
        {
          kind: 'text',
          body: 'Test the **code** as normal: unit tests on transformations, a smoke test that trains on a tiny sample so the pipeline itself is exercised on every commit. Test the **data** with schema and distribution checks — column types, allowed ranges, null rates, category sets — because upstream changes are the most common cause of a model quietly degrading and they arrive without a pull request. Test the **model** by comparing it against the version currently in production on a fixed evaluation set, and refuse to promote it if it is worse.',
        },
        {
          kind: 'text',
          body: 'That last gate is the one teams skip and the one that matters most. Without it, "the tests passed" means the code ran, not that the model is any good.',
        },
        {
          kind: 'heading',
          text: 'Deployment is separate from release',
        },
        {
          kind: 'text',
          body: 'Getting a model onto a server and sending it live traffic are two different decisions, and separating them is what makes rollback possible. **Shadow mode** runs the new model alongside the old on real requests, logging its predictions without using them — the cheapest way to find out whether it behaves on production data. **Canary** releases send it a small share of traffic and watch the metrics before widening.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Rollback means data too',
          body: 'Reverting a model is not just redeploying the previous binary. The feature transformations have to match the model, so a version mismatch between the two produces predictions that are wrong rather than failures that are loud. Version the model and its preprocessing together, as one artefact.',
        },
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
      minutes: 10,
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
          kind: 'text',
          body: 'The job titles in this field are used inconsistently enough that two companies can mean almost opposite things by the same word. What is stable is the *work*, so it is worth reading roles by what they actually do rather than what they are called.',
        },
        {
          kind: 'text',
          body: 'Roughly, the field splits along two axes: how close you are to the data versus the production system, and whether you are creating models or applying existing ones. Almost every title sits somewhere on that grid.',
        },
        {
          kind: 'heading',
          text: 'What each one actually spends the day doing',
        },
        {
          kind: 'text',
          body: 'A **data analyst** answers questions with existing data — SQL, statistics, visualisation — and the output is a decision. A **data scientist** adds modelling and experiment design; much of the value is framing a vague business question into something measurable. A **machine learning engineer** builds and ships models, and is a software engineer first: the hard parts are pipelines, serving and reliability. A **data engineer** makes the data exist and keep existing, which is why they are usually the first hire that unblocks everyone else.',
        },
        {
          kind: 'text',
          body: 'An **AI engineer** is the newest and most ambiguous title. It usually means building applications on top of models you did not train — prompting, retrieval, agents, evaluation, cost and latency. The skill set overlaps far more with backend engineering than with research. A **research scientist** creates new methods and usually needs a doctorate; this is a small fraction of the jobs and the one most people overestimate.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'The most available route',
          body: 'If you can already write software, AI engineering is the shortest path in, because it rewards engineering discipline over mathematics and the demand currently exceeds supply. If you come from analysis or statistics, data science is nearer. Either way the differentiator at interview is the same: something that runs, that you can explain the failure modes of.',
        },
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
