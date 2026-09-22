import { Module } from '../../core/models/content.models';

export const machineLearningModule: Module = {
  slug: 'machine-learning',
  title: 'Machine Learning',
  short: 'ML',
  stage: 3,
  level: 'intermediate',
  tagline: 'Supervised and unsupervised learning, and the concepts that generalise to everything after.',
  description:
    'Classical machine learning is not a stepping stone you discard once you reach deep learning. ' +
    'It is where the vocabulary comes from — loss, generalisation, bias and variance, ' +
    'regularisation, validation — and it is still the right answer for most tabular problems.',
  topics: [
    {
      slug: 'ml-fundamentals',
      title: 'What learning means',
      module: 'machine-learning',
      level: 'beginner',
      minutes: 8,
      summary: 'Features, labels, training, inference, loss and generalisation in one coherent picture.',
      why: 'Machine learning is fitting a function to examples so it works on examples you have not seen. Every technique later is a variation on that sentence, so it pays to be precise about it.',
      prerequisites: ['calculus-and-gradients', 'cleaning-and-preprocessing'],
      outcomes: [
        'Distinguish training, inference and evaluation cleanly',
        'Explain what a loss function does',
        'State what generalisation means and why it is the only thing that matters',
      ],
      tags: ['fundamentals', 'training', 'loss'],
      blocks: [
        {
          kind: 'table',
          head: ['Term', 'Meaning'],
          rows: [
            ['Feature (X)', 'An input the model can see'],
            ['Label (y)', 'The answer you want predicted'],
            ['Model', 'A parameterised function from X to a prediction'],
            ['Loss', 'A number measuring how wrong a prediction is'],
            ['Training', 'Adjusting parameters to reduce loss on known examples'],
            ['Inference', 'Running the trained model on new inputs'],
            ['Generalisation', 'Performance on data never used for training'],
          ],
        },
        {
          kind: 'text',
          body: 'Three problem families cover nearly everything: **supervised** learning (labels exist — classification and regression), **unsupervised** learning (no labels — clustering, dimensionality reduction), and **reinforcement** learning (an agent acting for reward). Most commercial ML is supervised.',
        },
        { kind: 'heading', text: 'The loss function is the specification' },
        {
          kind: 'table',
          head: ['Task', 'Loss', 'Penalises'],
          rows: [
            ['Regression', 'Mean squared error', 'Large errors quadratically — sensitive to outliers'],
            ['Regression', 'Mean absolute error', 'All errors linearly — robust to outliers'],
            ['Binary classification', 'Binary cross-entropy', 'Confident wrong answers heavily'],
            ['Multi-class', 'Categorical cross-entropy', 'As above, over a softmax distribution'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'The loss is what the model optimises; the metric is what you care about',
          body: 'They are often different. You might train with cross-entropy but be judged on recall at a fixed precision. Keep both in view: the loss guides learning, the metric decides whether to ship.',
        },
        { kind: 'visual', id: 'bias-variance', caption: 'Model capacity against error: the shape every project moves along.' },
        {
          kind: 'quiz',
          quiz: {
            id: 'mlf-1',
            prompt: 'A model scores 0.98 on training data and 0.61 on held-out data. What is happening?',
            options: [
              'Underfitting — the model is too simple',
              'Overfitting — it memorised the training set',
              'The learning rate is too low',
              'The labels are wrong',
            ],
            answer: 1,
            explanation:
              'A large gap between training and held-out performance is the definition of overfitting. The fixes are more data, fewer parameters, or regularisation — not more training.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn: an introduction to machine learning', url: 'https://scikit-learn.org/stable/tutorial/basic/tutorial.html', kind: 'docs' },
        { label: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', kind: 'course' },
      ],
      related: ['overfitting-and-regularisation', 'classification-metrics'],
    },
    {
      slug: 'linear-and-logistic-regression',
      title: 'Linear and logistic regression',
      module: 'machine-learning',
      level: 'beginner',
      minutes: 9,
      summary: 'The two models worth trying first, and the only ones whose coefficients you can read directly.',
      why: 'Linear models are fast, interpretable and a genuine baseline. If a gradient boosting model cannot beat logistic regression by a meaningful margin, the extra complexity is not earning its keep.',
      prerequisites: ['ml-fundamentals'],
      outcomes: [
        'Fit and interpret a linear and a logistic model',
        'Explain what a logistic model actually outputs',
        'Apply L1 and L2 regularisation and say what each does',
      ],
      tags: ['regression', 'classification', 'baseline'],
      blocks: [
        {
          kind: 'math',
          expr: 'ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b',
          note: 'Linear regression: a weighted sum. Each weight is the predicted change in the output per unit change in that feature, holding the others fixed.',
        },
        {
          kind: 'text',
          body: 'Logistic regression takes the same weighted sum and squashes it through a sigmoid into (0, 1), giving a **probability** rather than a class. The class comes afterwards, by comparing against a threshold you choose — and 0.5 is a default, not a law.',
        },
        {
          kind: 'math',
          expr: 'p = 1 / (1 + e^-(w·x + b))',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Reading the coefficients',
          code: `import numpy as np
from sklearn.linear_model import LogisticRegression

model = LogisticRegression(C=1.0, max_iter=1000).fit(X_train, y_train)

# Odds ratio per feature: exp(coefficient). Above 1 pushes towards the positive
# class, below 1 pushes away from it.
for name, coef in zip(feature_names, model.coef_[0]):
    print(f"{name:>22}  {np.exp(coef):.2f}x odds")

probs = model.predict_proba(X_test)[:, 1]   # probabilities, not classes
preds = (probs > 0.35).astype(int)          # threshold chosen for recall`,
        },
        { kind: 'heading', text: 'Regularisation' },
        {
          kind: 'table',
          head: ['Penalty', 'Effect', 'Use when'],
          rows: [
            ['L2 (ridge)', 'Shrinks all weights smoothly', 'Default; correlated features'],
            ['L1 (lasso)', 'Drives some weights to exactly zero', 'You want feature selection'],
            ['Elastic net', 'A mix of both', 'Many correlated features, want sparsity too'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Scale before you regularise',
          body: 'A penalty on weight size is meaningless if one feature is in rupees and another in years — the penalty falls on whichever happens to have small units. Standardise inside the pipeline.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'lin-2',
            prompt: 'Logistic regression outputs 0.62 for a customer. What does that mean?',
            options: [
              'The model is 62% confident in its architecture',
              'The estimated probability of the positive class is 0.62',
              '62% of similar customers were in the training set',
              'The prediction is class 62',
            ],
            answer: 1,
            explanation:
              'It is a calibrated-ish probability estimate for the positive class. Turning it into a decision requires a threshold, and that threshold is a business choice about the cost of each error type.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn linear models', url: 'https://scikit-learn.org/stable/modules/linear_model.html', kind: 'docs' },
        { label: 'An Introduction to Statistical Learning (free PDF)', url: 'https://www.statlearning.com/', kind: 'book' },
      ],
      related: ['classification-metrics', 'overfitting-and-regularisation'],
    },
    {
      slug: 'trees-and-ensembles',
      title: 'Decision trees, random forests and gradient boosting',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 10,
      summary: 'Why tree ensembles still win on tabular data, and how bagging differs from boosting.',
      why: 'For structured, tabular problems, gradient-boosted trees are the state of the art and have been for years. Knowing when to reach for them — and how they differ from a forest — is directly employable knowledge.',
      prerequisites: ['ml-fundamentals'],
      outcomes: [
        'Explain how a tree chooses a split',
        'State the difference between bagging and boosting',
        'Tune the handful of parameters that actually matter',
      ],
      tags: ['trees', 'xgboost', 'ensembles', 'tabular'],
      blocks: [
        {
          kind: 'text',
          body: 'A decision tree asks a sequence of threshold questions. At each node it picks the feature and cut point that best separates the target — measured by Gini impurity or entropy for classification, variance reduction for regression. A single deep tree fits the training data almost perfectly and generalises poorly.',
        },
        { kind: 'visual', id: 'tree-splits', caption: 'A tree splits the feature space into rectangles; an ensemble averages many of them.' },
        {
          kind: 'table',
          head: ['', 'Random forest (bagging)', 'Gradient boosting'],
          rows: [
            ['How trees are built', 'Independently, in parallel, on bootstrap samples', 'Sequentially — each tree fits the previous errors'],
            ['Tree depth', 'Deep, low bias, high variance', 'Shallow, high bias, corrected by the sequence'],
            ['Reduces', 'Variance', 'Bias'],
            ['Overfits if', 'Rarely — more trees is safe', 'Too many rounds or too high a learning rate'],
            ['Tuning effort', 'Low', 'Moderate — worth it'],
            ['Typical accuracy', 'Strong', 'Usually the best on tabular data'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Gradient boosting with early stopping',
          code: `from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score

model = HistGradientBoostingClassifier(
    learning_rate=0.05,      # smaller needs more trees but generalises better
    max_depth=None,
    max_leaf_nodes=31,       # the real capacity dial
    l2_regularization=1.0,
    early_stopping=True,     # stops when validation loss stops improving
    validation_fraction=0.1,
    random_state=42,
).fit(X_train, y_train)

print(model.n_iter_, "trees kept")
print(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]).round(4))`,
        },
        {
          kind: 'list',
          items: [
            '**XGBoost, LightGBM, CatBoost** — three mature boosting libraries. CatBoost handles categorical features natively; LightGBM is fastest on wide data; XGBoost is the most widely deployed. The differences matter less than tuning.',
            '**No scaling needed** — splits depend on order, not magnitude.',
            '**Feature importance is not causality** — it tells you what the model used, not what drives the outcome. Use permutation importance or SHAP if you need to explain a prediction.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'tree-1',
            prompt: 'You lower the boosting learning rate from 0.3 to 0.05. What else must change?',
            options: [
              'Nothing',
              'Increase the number of trees — each one now contributes less',
              'Reduce the number of features',
              'Switch to a random forest',
            ],
            answer: 1,
            explanation:
              'Learning rate and number of rounds trade off directly. A smaller rate takes smaller steps towards the fit, so it needs more rounds — which is why early stopping on a validation set is the practical way to set both.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn ensembles', url: 'https://scikit-learn.org/stable/modules/ensemble.html', kind: 'docs' },
        { label: 'XGBoost documentation', url: 'https://xgboost.readthedocs.io/en/stable/', kind: 'docs' },
        { label: 'LightGBM documentation', url: 'https://lightgbm.readthedocs.io/en/stable/', kind: 'docs' },
      ],
      related: ['feature-engineering', 'overfitting-and-regularisation'],
    },
    {
      slug: 'svm-knn-and-naive-bayes',
      title: 'SVM, KNN and Naive Bayes',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 8,
      summary: 'Three classical models that are still the right tool in specific, recognisable situations.',
      why: 'These appear constantly in interviews and occasionally in production. Each embodies a different idea — margins, neighbourhoods, and conditional independence — worth having in your head.',
      prerequisites: ['linear-and-logistic-regression', 'probability-and-statistics'],
      outcomes: [
        'Explain the margin idea behind SVMs and what a kernel buys',
        'Say why KNN has no training phase and what that costs',
        'Explain the "naive" assumption and why it works anyway',
      ],
      tags: ['svm', 'knn', 'naive bayes'],
      blocks: [
        { kind: 'heading', text: 'Support vector machines' },
        {
          kind: 'text',
          body: 'An SVM looks for the boundary with the widest margin between classes, determined only by the closest points (the support vectors). A **kernel** lets it draw a curved boundary by implicitly mapping features into a higher-dimensional space without ever building it. Strong on small, high-dimensional, clean datasets; slow past roughly a hundred thousand rows.',
        },
        { kind: 'heading', text: 'K-nearest neighbours' },
        {
          kind: 'text',
          body: 'KNN stores the training set and classifies a new point by majority vote among its `k` closest neighbours. There is no training — all the cost is at prediction time, which makes it a poor fit for latency-sensitive serving but a useful baseline and the conceptual ancestor of vector search.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Distance breaks down in high dimensions',
          body: 'With hundreds of features, all pairwise distances converge towards the same value and "nearest" stops meaning anything. Reduce dimensions first, or use a model that does not depend on raw distance.',
        },
        { kind: 'heading', text: 'Naive Bayes' },
        {
          kind: 'text',
          body: 'Applies Bayes’ theorem while assuming every feature is independent given the class. That assumption is plainly false for text — words are correlated — yet the model remains a strong, near-instant spam and topic classifier, because the ranking of probabilities survives the wrong assumption even when the values do not.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A complete spam baseline in six lines',
          code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), min_df=2), MultinomialNB())
model.fit(train_texts, train_labels)

print(model.score(test_texts, test_labels))
print(model.predict(["claim your free prize now"]))  # [1]`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'clf-1',
            prompt: 'Which model needs no training time but the most prediction time?',
            options: ['SVM with an RBF kernel', 'K-nearest neighbours', 'Naive Bayes', 'Logistic regression'],
            answer: 1,
            explanation:
              'KNN is a lazy learner: fitting just stores the data, and every prediction searches it. That trade-off is exactly what approximate nearest-neighbour indexes in vector databases exist to fix.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn SVM guide', url: 'https://scikit-learn.org/stable/modules/svm.html', kind: 'docs' },
        { label: 'scikit-learn Naive Bayes', url: 'https://scikit-learn.org/stable/modules/naive_bayes.html', kind: 'docs' },
      ],
      related: ['vector-search-and-hybrid', 'bag-of-words-and-tfidf'],
    },
    {
      slug: 'unsupervised-learning',
      title: 'Clustering and dimensionality reduction',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 9,
      summary: 'K-means, hierarchical clustering, DBSCAN and PCA — structure without labels.',
      why: 'Labels are expensive. Unsupervised methods let you segment customers, compress features, detect anomalies and visualise high-dimensional embeddings — all of which appear again in the LLM stack.',
      prerequisites: ['ml-fundamentals', 'numpy-arrays'],
      outcomes: [
        'Choose between k-means, hierarchical and DBSCAN',
        'Explain what PCA keeps and what it throws away',
        'Evaluate a clustering without ground truth',
      ],
      tags: ['clustering', 'pca', 'unsupervised'],
      blocks: [
        {
          kind: 'table',
          head: ['Method', 'Assumes', 'Needs k?', 'Handles noise'],
          rows: [
            ['K-means', 'Round, similarly sized clusters', 'Yes', 'No — every point joins a cluster'],
            ['Hierarchical', 'A nested structure exists', 'No (cut the dendrogram)', 'Poorly'],
            ['DBSCAN', 'Clusters are dense regions', 'No (needs eps, min_samples)', 'Yes — labels outliers as noise'],
            ['Gaussian mixture', 'Clusters are Gaussian blobs', 'Yes', 'Soft assignment'],
          ],
        },
        {
          kind: 'text',
          body: 'K-means minimises within-cluster variance by alternating two steps: assign each point to the nearest centroid, then move each centroid to the mean of its points. It is fast and it will happily split one elongated cluster into three, because its notion of a cluster is a sphere.',
        },
        { kind: 'heading', text: 'PCA' },
        {
          kind: 'text',
          body: 'Principal component analysis finds the orthogonal directions of greatest variance and re-expresses the data in them. Keeping the first few gives a compact representation; what it discards is variance, which is not always the same as noise. Use it to compress features, decorrelate inputs, or project embeddings to 2-D for a plot.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Choosing k, and checking it with a silhouette score',
          code: `from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

reduced = PCA(n_components=0.95, random_state=0).fit_transform(X_scaled)
print(reduced.shape[1], "components keep 95% of the variance")

for k in range(2, 7):
    labels = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(reduced)
    print(k, round(silhouette_score(reduced, labels), 3))`,
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Clusters are hypotheses, not findings',
          body: 'K-means returns k clusters for any k, including on pure noise. Validate with a silhouette or elbow curve, then check the clusters mean something to a domain expert before building anything on them.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'unsup-1',
            prompt: 'Your data has two crescent-shaped interleaved clusters. K-means fails. Better choice?',
            options: ['More clusters', 'DBSCAN', 'PCA then k-means', 'Logistic regression'],
            answer: 1,
            explanation:
              'K-means can only carve space into convex cells around centroids. DBSCAN grows clusters along regions of density, so it follows arbitrary shapes.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html', kind: 'docs' },
        { label: 'scikit-learn decomposition (PCA)', url: 'https://scikit-learn.org/stable/modules/decomposition.html', kind: 'docs' },
      ],
      related: ['embeddings-explained', 'vector-search-and-hybrid'],
    },
    {
      slug: 'overfitting-and-regularisation',
      title: 'Overfitting, bias, variance and cross-validation',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 9,
      summary: 'The central tension of the field, and the tools that manage it.',
      why: 'Every modelling decision — capacity, regularisation strength, how much data, when to stop training — is a position on the bias/variance trade-off. This is the topic that transfers unchanged to deep learning and LLM fine-tuning.',
      prerequisites: ['ml-fundamentals'],
      outcomes: [
        'Diagnose under- and overfitting from two numbers',
        'Pick a cross-validation scheme that matches the data',
        'Tune hyperparameters without contaminating the test set',
      ],
      tags: ['overfitting', 'bias-variance', 'cross-validation'],
      blocks: [
        {
          kind: 'table',
          head: ['Training score', 'Validation score', 'Diagnosis', 'Fix'],
          rows: [
            ['Low', 'Low', 'Underfitting (high bias)', 'More capacity, better features, train longer'],
            ['High', 'Much lower', 'Overfitting (high variance)', 'More data, regularisation, less capacity, early stopping'],
            ['High', 'High', 'Healthy', 'Confirm on the untouched test set'],
            ['Low', 'High', 'A bug', 'Check your split, leakage and metric code'],
          ],
        },
        { kind: 'visual', id: 'bias-variance', caption: 'Total error splits into bias, variance and irreducible noise.' },
        { kind: 'heading', text: 'Cross-validation' },
        {
          kind: 'list',
          items: [
            '**K-fold** — split into k parts, train on k-1, validate on the rest, rotate. The default.',
            '**Stratified k-fold** — preserves class proportions in every fold. Mandatory for imbalanced classification.',
            '**Group k-fold** — keeps all rows of one entity (patient, customer, document) inside a single fold, so the model cannot see the same entity in train and validation.',
            '**Time-series split** — always train on the past and validate on the future. A random split on time-ordered data leaks the future and produces a fantasy score.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Search inside cross-validation, score once on the test set',
          code: `from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

search = GridSearchCV(
    pipeline,
    {"clf__C": [0.01, 0.1, 1, 10]},
    cv=StratifiedKFold(5, shuffle=True, random_state=42),
    scoring="average_precision",
    n_jobs=-1,
).fit(X_train, y_train)

print(search.best_params_, round(search.best_score_, 4))
print("held out:", round(search.score(X_test, y_test), 4))   # touched once`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'The test set is a one-shot resource',
          body: 'Every time you look at the test score and change something, a little of its independence is spent. Tune on validation folds; use the test set to report, not to decide.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'cv-split',
            prompt: 'You are predicting next month’s demand from historical sales. Which split?',
            options: [
              'Random 80/20',
              'Stratified k-fold',
              'Time-series split — train on earlier periods, validate on later ones',
              'Leave-one-out',
            ],
            answer: 2,
            explanation:
              'A random split lets the model train on July and validate on June, using the future to predict the past. Only a forward-chaining split measures what you will actually be asked to do.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn cross-validation', url: 'https://scikit-learn.org/stable/modules/cross_validation.html', kind: 'docs' },
        { label: 'scikit-learn model selection', url: 'https://scikit-learn.org/stable/modules/grid_search.html', kind: 'docs' },
      ],
      related: ['validation-strategy', 'regularising-deep-networks'],
    },
  ],
};
