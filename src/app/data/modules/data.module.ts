import { Module } from '../../core/models/content.models';

export const dataModule: Module = {
  slug: 'data',
  title: 'Data and Feature Engineering',
  short: 'Data',
  stage: 2,
  level: 'beginner',
  tagline: 'NumPy, pandas, cleaning, features and the split discipline that keeps results honest.',
  description:
    'Model choice is rarely what decides a project. Data quality and feature construction are. ' +
    'This stage covers the two libraries every Python data workflow runs on, the cleaning steps ' +
    'that come before any model, and the evaluation split rules that stop you fooling yourself.',
  topics: [
    {
      slug: 'numpy-arrays',
      title: 'NumPy: arrays, shapes and vectorisation',
      module: 'data',
      level: 'beginner',
      minutes: 8,
      summary: 'The n-dimensional array, broadcasting, and why a loop over rows is the wrong answer.',
      why: 'NumPy is the memory layout underneath pandas, scikit-learn, PyTorch and TensorFlow. Understanding arrays and broadcasting is what makes the rest of the stack legible.',
      prerequisites: ['python-for-ml', 'vectors-and-matrices'],
      outcomes: [
        'Create, reshape and slice arrays confidently',
        'Replace Python loops with vectorised operations',
        'Predict what broadcasting will do to two shapes',
      ],
      tags: ['numpy', 'arrays', 'vectorisation'],
      blocks: [
        {
          kind: 'text',
          body: 'A NumPy array is a contiguous block of same-typed numbers plus a shape. That layout is why operations on it run in compiled code at memory bandwidth instead of in the Python interpreter.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Vectorised vs looped standardisation',
          code: `import numpy as np

x = np.random.default_rng(0).normal(50, 12, size=(100_000, 4))

# Loop: about 40x slower and three times the code.
# Vectorised: one expression, applied column-wise.
standardised = (x - x.mean(axis=0)) / x.std(axis=0)

print(x.shape, standardised.mean(axis=0).round(6))
# (100000, 4) [ 0. -0.  0. -0.]`,
        },
        { kind: 'heading', text: 'Broadcasting' },
        {
          kind: 'text',
          body: 'When shapes differ, NumPy aligns them from the right and stretches any dimension of size 1. `(100000, 4)` minus `(4,)` works because the row vector is applied to every row — that is the whole mechanism behind per-feature scaling and bias addition.',
        },
        {
          kind: 'table',
          head: ['Shape A', 'Shape B', 'Result'],
          rows: [
            ['(3, 4)', '(4,)', '(3, 4) — B applied to each row'],
            ['(3, 4)', '(3, 1)', '(3, 4) — B applied to each column'],
            ['(3, 4)', '(3,)', 'Error — 4 and 3 do not align'],
            ['(2, 1, 4)', '(3, 4)', '(2, 3, 4)'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Views share memory',
          body: 'Slicing returns a view, not a copy: `b = a[:5]` then `b[0] = 0` changes `a`. Use `a[:5].copy()` when you mean a copy. This bites hardest when preparing train and validation slices.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'np-1',
            prompt: 'You need the mean of each feature in an array shaped (1000, 20). Which call?',
            options: ['`x.mean()`', '`x.mean(axis=0)`', '`x.mean(axis=1)`', '`x.T.mean()`'],
            answer: 1,
            explanation:
              '`axis=0` collapses the rows and leaves one value per column, giving 20 feature means. `axis=1` would give 1,000 per-sample means.',
          },
        },
      ],
      resources: [
        { label: 'NumPy absolute beginners guide', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', kind: 'docs' },
        { label: 'NumPy broadcasting rules', url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html', kind: 'docs' },
      ],
      related: ['pandas-dataframes', 'vectors-and-matrices'],
    },
    {
      slug: 'pandas-dataframes',
      title: 'pandas: loading, reshaping and grouping data',
      module: 'data',
      level: 'beginner',
      minutes: 9,
      summary: 'DataFrames, selection, group-by aggregation and joins — the tabular workhorse.',
      why: 'Most real datasets arrive as CSV, Parquet or SQL rows. pandas is where you inspect them, fix them and turn them into the numeric matrix a model wants.',
      prerequisites: ['numpy-arrays'],
      outcomes: [
        'Select rows and columns without ambiguity',
        'Aggregate with group-by and read the result',
        'Join two tables and check what the join did',
      ],
      tags: ['pandas', 'dataframe', 'sql'],
      blocks: [
        {
          kind: 'text',
          body: 'A DataFrame is a dict of named columns, each a typed array, sharing one index. Almost every operation is one of four things: select, transform, aggregate, join.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'The first five minutes with any new dataset',
          code: `import pandas as pd

df = pd.read_csv("churn.csv")

df.shape             # rows, columns
df.dtypes            # what pandas inferred — check for object where you expect numbers
df.head(3)
df.describe()        # numeric ranges: spot impossible values
df.isna().sum()      # missing values per column
df["churned"].value_counts(normalize=True)  # class balance`,
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Selection, aggregation and joins',
          code: `# .loc is label-based, .iloc is position-based. Mixing them is the classic bug.
recent = df.loc[df["tenure_months"] > 12, ["customer_id", "monthly_spend", "churned"]]

by_plan = df.groupby("plan").agg(
    customers=("customer_id", "count"),
    avg_spend=("monthly_spend", "mean"),
    churn_rate=("churned", "mean"),
).sort_values("churn_rate", ascending=False)

# Always check row counts after a join: a duplicated key silently multiplies rows.
merged = df.merge(plans, on="plan", how="left", validate="many_to_one")`,
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'validate= is free insurance',
          body: 'Passing `validate="many_to_one"` makes pandas raise if the right-hand key is not unique, instead of quietly producing a table with more rows than you started with. Row-count explosions after a join are one of the most common silent data bugs.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'pd-1',
            prompt: 'After a left join your DataFrame grew from 10,000 to 14,300 rows. What happened?',
            options: [
              'A left join always adds rows',
              'The join key is duplicated in the right-hand table',
              'Missing values were filled in',
              'The index was reset',
            ],
            answer: 1,
            explanation:
              'A left join keeps every left row once per match on the right. Duplicate keys on the right multiply rows — which then double-counts those customers in every downstream metric.',
          },
        },
      ],
      resources: [
        { label: 'pandas user guide', url: 'https://pandas.pydata.org/docs/user_guide/index.html', kind: 'docs' },
        { label: 'pandas 10 minutes tutorial', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', kind: 'docs' },
      ],
      related: ['cleaning-and-preprocessing', 'exploratory-data-analysis'],
    },
    {
      slug: 'cleaning-and-preprocessing',
      title: 'Cleaning: missing values, categories and scaling',
      module: 'data',
      level: 'beginner',
      minutes: 10,
      summary: 'Imputation, encoding and normalisation — with the fit/transform rule that keeps them honest.',
      why: 'Models cannot read blanks, strings or wildly different scales. How you fill, encode and scale is a modelling decision, and doing it before the split leaks information from the test set.',
      prerequisites: ['pandas-dataframes'],
      outcomes: [
        'Choose an imputation strategy and say why',
        'Encode categorical features without inventing false order',
        'Explain when to standardise and when it does not matter',
      ],
      tags: ['preprocessing', 'encoding', 'scaling'],
      blocks: [
        { kind: 'heading', text: 'Missing values' },
        {
          kind: 'table',
          head: ['Strategy', 'When it fits', 'Risk'],
          rows: [
            ['Drop rows', 'Few rows affected, missing at random', 'Throws away data; biased if missingness is informative'],
            ['Drop column', 'Mostly empty column', 'Loses a signal if absence itself is predictive'],
            ['Mean / median fill', 'Numeric, roughly symmetric', 'Shrinks variance; median is safer with outliers'],
            ['Category "missing"', 'Categorical features', 'None serious — often the best option'],
            ['Model-based (KNN, iterative)', 'Few columns, strong correlations', 'Slow; can leak if fit on all data'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Missingness is a feature',
          body: 'A blank income field on a loan application is not random. Add a boolean `income_missing` column alongside the imputed value — models frequently find it more predictive than the value itself.',
        },
        { kind: 'heading', text: 'Encoding categories' },
        {
          kind: 'list',
          items: [
            '**One-hot** — one binary column per category. Default for nominal features with modest cardinality.',
            '**Ordinal** — integers, but only when order is real (`small < medium < large`). Applied to city names it invents a false ranking.',
            '**Target / frequency encoding** — replace a category with a statistic of the target or its count. Powerful for high cardinality, and leaks badly if computed before the split.',
            '**Embeddings** — learned dense vectors, used when cardinality is in the thousands (user ids, product ids).',
          ],
        },
        { kind: 'heading', text: 'Scaling' },
        {
          kind: 'table',
          head: ['Method', 'Formula', 'Use when'],
          rows: [
            ['Standardisation', '(x - mean) / std', 'Default; linear models, SVM, neural networks, PCA'],
            ['Min-max', '(x - min) / (max - min)', 'Bounded inputs needed, e.g. image pixels'],
            ['Robust', '(x - median) / IQR', 'Heavy outliers'],
            ['None', '—', 'Trees and gradient boosting — splits are order-based'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A pipeline learns its parameters from training data only',
          code: `from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

numeric = ["monthly_spend", "tenure_months"]
categorical = ["plan", "region"]

prep = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ]), numeric),
    ("cat", Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("encode", OneHotEncoder(handle_unknown="ignore")),
    ]), categorical),
])

model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])

# fit() learns medians, category lists and scaling parameters from X_train only.
# Everything applied to X_test is a transform with those stored values.
model.fit(X_train, y_train)
print(model.score(X_test, y_test))`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'The fit/transform rule',
          body: 'Fit on train, transform everything. Calling `fit` on the full dataset — even just for a scaler — lets test-set statistics into training, and your reported score becomes optimistic for no good reason.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'clean-1',
            prompt: 'You standardise the whole dataset, then split into train and test. What is wrong?',
            options: [
              'Nothing, scaling is harmless',
              'The test set’s mean and variance influenced the training features — mild leakage',
              'Standardisation requires a normal distribution',
              'The split must come before loading',
            ],
            answer: 1,
            explanation:
              'The scaler learned statistics that include test rows, so the test score no longer estimates performance on genuinely unseen data. Fit the scaler inside the pipeline, after the split.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn preprocessing guide', url: 'https://scikit-learn.org/stable/modules/preprocessing.html', kind: 'docs' },
        { label: 'scikit-learn pipelines', url: 'https://scikit-learn.org/stable/modules/compose.html', kind: 'docs' },
      ],
      related: ['feature-engineering', 'validation-strategy'],
    },
    {
      slug: 'feature-engineering',
      title: 'Feature engineering',
      module: 'data',
      level: 'intermediate',
      minutes: 8,
      summary: 'Turning raw columns into signal: ratios, aggregates, time features and interaction terms.',
      why: 'On tabular problems, a well-built feature set with a simple model usually beats a raw feature set with a complicated one. Features are where domain knowledge enters the model.',
      prerequisites: ['cleaning-and-preprocessing'],
      outcomes: [
        'Derive features that encode domain meaning',
        'Handle dates, cycles and text length sensibly',
        'Recognise a feature that cannot exist at prediction time',
      ],
      tags: ['features', 'tabular', 'domain knowledge'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**Ratios and differences** — `spend / tenure` or `balance - credit_limit` often carry the signal that neither column has alone.',
            '**Aggregates** — per-customer mean, max and count over history, joined back onto each row.',
            '**Time** — hour of day, day of week, days since last event. Encode cyclic values as sine/cosine so 23:00 and 00:00 sit next to each other.',
            '**Counts and lengths** — number of words, number of prior tickets, number of failed logins.',
            '**Interactions** — the product or concatenation of two features, when the effect of one depends on the other.',
            '**Binning** — turn a continuous variable into ranges when the relationship is a step rather than a slope.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Cyclic time features and a ratio',
          code: `import numpy as np
import pandas as pd

df["hour"] = pd.to_datetime(df["created_at"]).dt.hour
df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

df["spend_per_month"] = df["total_spend"] / df["tenure_months"].clip(lower=1)
df["used_support"] = (df["support_tickets"] > 0).astype(int)`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Ask when each feature becomes known',
          body: 'A churn model with `cancellation_reason` as a feature will look outstanding in validation and be useless in production, because that column only exists after the customer has churned. For every feature, ask: is this available at the moment of prediction?',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'fe-1',
            prompt: 'Your model reaches 0.99 AUC on a churn dataset. What should you do first?',
            options: [
              'Ship it',
              'Look for a leaking feature that encodes the outcome',
              'Add more layers',
              'Collect more data',
            ],
            answer: 1,
            explanation:
              'Near-perfect performance on a messy business problem almost always means a feature contains the answer. Audit the feature list against what is knowable at prediction time before celebrating.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn feature extraction', url: 'https://scikit-learn.org/stable/modules/feature_extraction.html', kind: 'docs' },
        { label: 'Kaggle feature engineering course', url: 'https://www.kaggle.com/learn/feature-engineering', kind: 'course' },
      ],
      related: ['exploratory-data-analysis', 'trees-and-ensembles'],
    },
    {
      slug: 'exploratory-data-analysis',
      title: 'Exploratory data analysis',
      module: 'data',
      level: 'beginner',
      minutes: 7,
      summary: 'Looking at the data before modelling it: distributions, relationships, outliers and imbalance.',
      why: 'Every serious modelling mistake is visible in the data first. EDA is the cheapest debugging you will ever do, and it is what tells you which model class is even appropriate.',
      prerequisites: ['pandas-dataframes'],
      outcomes: [
        'Run a systematic first pass over an unfamiliar dataset',
        'Spot skew, outliers and class imbalance',
        'Decide what to fix before touching a model',
      ],
      tags: ['eda', 'visualisation', 'matplotlib'],
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Shape and types', body: 'How many rows and columns? Which columns arrived as strings that should be numbers or dates?' },
            { title: 'Target distribution', body: 'For classification, the class balance. For regression, the shape and tail — heavy skew usually wants a log transform.' },
            { title: 'Per-feature distributions', body: 'Histograms for numeric, value counts for categorical. Look for impossible values: age 200, negative prices, one category holding 98% of rows.' },
            { title: 'Relationships', body: 'Correlation with the target for numeric features; group means per category. This is also how you find duplicate columns.' },
            { title: 'Missingness', body: 'How much, in which columns, and whether it correlates with the target.' },
            { title: 'Duplicates and identifiers', body: 'Exact duplicate rows inflate scores. Identifier columns must be dropped, not modelled.' },
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A compact first look',
          code: `import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(13, 3.5))

df["monthly_spend"].plot.hist(bins=40, ax=axes[0], title="Monthly spend")
df["churned"].value_counts().plot.bar(ax=axes[1], title="Class balance")
df.plot.scatter(x="tenure_months", y="monthly_spend", alpha=0.2, ax=axes[2])

plt.tight_layout()
plt.show()

print("duplicate rows:", df.duplicated().sum())
print(df.corr(numeric_only=True)["churned"].sort_values(ascending=False).head(6))`,
        },
        { kind: 'heading', text: 'Class imbalance' },
        {
          kind: 'text',
          body: 'If 2% of rows are positive, accuracy is meaningless and most models will learn to predict the majority class. The options, roughly in order of preference: use metrics that survive imbalance (precision, recall, PR-AUC), weight the classes in the loss, resample (SMOTE or undersampling), or reframe the problem as ranking or anomaly detection.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'eda-1',
            prompt: 'A numeric column is strongly right-skewed with a long tail. Common first move for a linear model?',
            options: [
              'Drop the column',
              'Log-transform it (log1p) to compress the tail',
              'One-hot encode it',
              'Nothing — linear models are scale invariant',
            ],
            answer: 1,
            explanation:
              'A log transform pulls in the tail so a handful of extreme values stop dominating the fit. Tree-based models are unaffected by monotone transforms, so this matters most for linear and distance-based models.',
          },
        },
      ],
      resources: [
        { label: 'Matplotlib user guide', url: 'https://matplotlib.org/stable/users/index.html', kind: 'docs' },
        { label: 'seaborn tutorial', url: 'https://seaborn.pydata.org/tutorial.html', kind: 'docs' },
      ],
      related: ['feature-engineering', 'validation-strategy'],
    },
  ],
};
