import { Module } from '../../core/models/content.models';

export const evaluationModule: Module = {
  slug: 'evaluation',
  title: 'Model Evaluation',
  short: 'Evaluation',
  stage: 4,
  level: 'intermediate',
  tagline: 'Metrics that tell you the truth, and the split discipline behind them.',
  description:
    'A model is only as trustworthy as its evaluation. This stage covers the classification and ' +
    'regression metrics you will be asked about in every interview, how to read a confusion ' +
    'matrix, and how to design a split that does not flatter you.',
  topics: [
    {
      slug: 'classification-metrics',
      title: 'Classification metrics and the confusion matrix',
      module: 'evaluation',
      level: 'intermediate',
      minutes: 11,
      summary: 'Precision, recall, F1, ROC-AUC and PR-AUC — what each one hides and when to use it.',
      why: 'Choosing the wrong metric is how a model that looks excellent in a notebook causes damage in production. On imbalanced problems, accuracy is actively misleading.',
      prerequisites: ['ml-fundamentals', 'probability-and-statistics'],
      outcomes: [
        'Derive every classification metric from a confusion matrix',
        'Pick the metric that matches the cost of each error type',
        'Explain when ROC-AUC flatters a model and PR-AUC does not',
      ],
      tags: ['metrics', 'precision', 'recall', 'roc-auc'],
      blocks: [
        {
          kind: 'text',
          body: 'Everything starts with four counts. **TP** and **TN** are correct; **FP** is a false alarm; **FN** is a miss. Which of the two errors is worse is a business question, and it determines the metric.',
        },
        {
          kind: 'visual',
          id: 'confusion-matrix',
          caption: 'Change the four counts and watch every metric move.',
        },
        {
          kind: 'table',
          head: ['Metric', 'Formula', 'Answers', 'Use when'],
          rows: [
            ['Accuracy', '(TP+TN) / all', 'How often is it right?', 'Balanced classes only'],
            ['Precision', 'TP / (TP+FP)', 'When it says yes, is it right?', 'False alarms are expensive'],
            ['Recall', 'TP / (TP+FN)', 'Of the real positives, how many did it catch?', 'Misses are expensive'],
            ['F1', 'Harmonic mean of the two', 'One number balancing both', 'You need a single comparison score'],
            ['Specificity', 'TN / (TN+FP)', 'How well are negatives left alone?', 'Screening contexts'],
            ['ROC-AUC', 'Area under TPR/FPR curve', 'Ranking quality across thresholds', 'Roughly balanced classes'],
            ['PR-AUC', 'Area under precision/recall curve', 'Ranking quality on the positive class', 'Rare positives'],
          ],
        },
        {
          kind: 'visual',
          id: 'threshold',
          caption: 'One dial. Move it and watch precision and recall pull apart.',
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Precision and recall trade against each other',
          body: 'They are two ends of one threshold dial. Lower the threshold and recall rises while precision falls. There is no setting that maximises both, so decide which error you can least afford and fix that one.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Choosing a threshold from the precision/recall curve',
          code: `import numpy as np
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    precision_recall_curve,
)

probs = model.predict_proba(X_test)[:, 1]
precision, recall, thresholds = precision_recall_curve(y_test, probs)

# The lowest threshold that still holds precision at 0.90.
ok = precision[:-1] >= 0.90
chosen = thresholds[ok][np.argmax(recall[:-1][ok])]

print(f"threshold {chosen:.3f}  PR-AUC {average_precision_score(y_test, probs):.3f}")
print(classification_report(y_test, probs >= chosen, digits=3))`,
        },
        { kind: 'heading', text: 'ROC-AUC vs PR-AUC' },
        {
          kind: 'text',
          body: 'ROC-AUC uses the false positive rate, whose denominator is the large negative class. With 1% positives, thousands of false positives barely move it, so a poor model can still score 0.95. PR-AUC puts false positives against true positives and collapses when precision is bad. **On imbalanced data, report PR-AUC.**',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'metric-1',
            prompt: 'A cancer screening model. Which error do you minimise first?',
            options: [
              'False positives — unnecessary follow-up tests',
              'False negatives — a missed diagnosis',
              'Both equally, via accuracy',
              'Neither; optimise ROC-AUC',
            ],
            answer: 1,
            explanation:
              'A missed cancer is far more costly than a follow-up scan, so recall on the positive class dominates. You then report precision so the follow-up load stays workable.',
          },
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'metric-2',
            prompt: 'TP=40, FP=10, FN=60, TN=890. What is recall?',
            options: ['0.80', '0.40', '0.93', '0.29'],
            answer: 1,
            explanation:
              'Recall = TP / (TP + FN) = 40 / 100 = 0.40. Precision is 0.80 and accuracy is 0.93 — which is exactly why the single number you quote matters.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn model evaluation', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html', kind: 'docs' },
        { label: 'Google: classification metrics', url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall', kind: 'course' },
      ],
      related: ['regression-metrics', 'validation-strategy'],
    },
    {
      slug: 'regression-metrics',
      title: 'Regression metrics',
      module: 'evaluation',
      level: 'beginner',
      minutes: 6,
      summary: 'MAE, MSE, RMSE and R² — what each penalises and which to report.',
      why: 'Regression errors have units and a distribution. Picking a metric decides whether one catastrophic miss matters more than twenty small ones.',
      prerequisites: ['ml-fundamentals'],
      outcomes: [
        'Explain MAE vs RMSE in terms of outlier sensitivity',
        'Interpret R² honestly, including negative values',
        'Report an error in units a stakeholder understands',
      ],
      tags: ['metrics', 'regression', 'rmse'],
      blocks: [
        {
          kind: 'table',
          head: ['Metric', 'Units', 'Outliers', 'Reads as'],
          rows: [
            ['MAE', 'Same as target', 'Treated linearly', 'Average miss, in rupees/degrees/days'],
            ['MSE', 'Target squared', 'Punished heavily', 'Optimisation target, hard to interpret'],
            ['RMSE', 'Same as target', 'Punished heavily', 'Like MAE, but dominated by large errors'],
            ['R²', 'None (0–1, can go negative)', 'Indirect', 'Fraction of variance explained'],
            ['MAPE', 'Percent', 'Explodes near zero', 'Relative error — avoid if the target can be ~0'],
          ],
        },
        {
          kind: 'text',
          body: 'RMSE above MAE by a wide margin tells you the error distribution has a heavy tail: most predictions are fine and a few are badly wrong. That gap is a diagnostic, so report both.',
        },
        {
          kind: 'code',
          lang: 'python',
          code: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

pred = model.predict(X_test)

mae = mean_absolute_error(y_test, pred)
rmse = mean_squared_error(y_test, pred) ** 0.5

print(f"MAE  {mae:,.0f}")        # MAE  18,420
print(f"RMSE {rmse:,.0f}")       # RMSE 41,880  -> a few large misses
print(f"R2   {r2_score(y_test, pred):.3f}")`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'A negative R² is possible and meaningful',
          body: 'R² compares your model against predicting the mean every time. Below zero means you are worse than that constant baseline — usually a sign of leakage in training, a distribution shift, or a bug in the prediction path.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'reg-1',
            prompt: 'House prices with a handful of luxury properties. You care about typical accuracy. Which metric?',
            options: ['RMSE', 'MAE', 'MSE', 'MAPE'],
            answer: 1,
            explanation:
              'RMSE and MSE will be dominated by the few mansions. MAE reports the typical miss in currency units, which is the question being asked.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn regression metrics', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics', kind: 'docs' },
      ],
      related: ['classification-metrics', 'linear-and-logistic-regression'],
    },
    {
      slug: 'validation-strategy',
      title: 'Splits, leakage and honest evaluation',
      module: 'evaluation',
      level: 'intermediate',
      minutes: 8,
      summary: 'Train/validation/test, the kinds of leakage, and how to design a split that mirrors deployment.',
      why: 'Most "great model, terrible production performance" stories are a split problem, not a model problem. Leakage is the single most expensive mistake in applied ML.',
      prerequisites: ['overfitting-and-regularisation'],
      outcomes: [
        'Explain the distinct jobs of the three splits',
        'Name four kinds of leakage and how each is caught',
        'Design a split that matches how the model will be used',
      ],
      tags: ['leakage', 'validation', 'splits'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**Training set** — the model fits its parameters here.',
            '**Validation set** — you choose hyperparameters, features and thresholds here. Looked at many times.',
            '**Test set** — touched once, at the end, to report. Any decision made from it spends its independence.',
          ],
        },
        { kind: 'heading', text: 'Four kinds of leakage' },
        {
          kind: 'table',
          head: ['Kind', 'Example', 'Caught by'],
          rows: [
            ['Preprocessing leakage', 'Scaler or imputer fit on all rows before the split', 'Doing all preprocessing inside a pipeline'],
            ['Target leakage', 'A feature that only exists after the outcome', 'Asking when each feature becomes known'],
            ['Duplicate leakage', 'Near-identical rows in both train and test', 'Deduplicating; grouping by entity'],
            ['Temporal leakage', 'Training on the future to predict the past', 'Time-ordered splits'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Make the split look like deployment',
          body: 'If the model will score new customers, hold out whole customers. If it will forecast next week, hold out the last weeks. If it will read documents from a new client, hold out a whole client. The split is a simulation of the job.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Grouped split: no entity appears on both sides',
          code: `from sklearn.model_selection import GroupShuffleSplit

splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(splitter.split(X, y, groups=df["customer_id"]))

assert set(df.loc[train_idx, "customer_id"]).isdisjoint(df.loc[test_idx, "customer_id"])`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'val-1',
            prompt: 'A medical model scores 0.97 in validation and 0.68 in the clinic. Most likely cause?',
            options: [
              'The clinic’s hardware is slower',
              'Scans from the same patient appeared in both train and validation',
              'The learning rate was too low',
              'Not enough epochs',
            ],
            answer: 1,
            explanation:
              'Multiple images per patient split randomly means the model recognises patients rather than pathology. A grouped split by patient id makes validation match the real task.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn: common pitfalls', url: 'https://scikit-learn.org/stable/common_pitfalls.html', kind: 'docs' },
      ],
      related: ['classification-metrics', 'monitoring-and-drift'],
    },
  ],
};
