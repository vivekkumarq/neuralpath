import { Module } from '../../core/models/content.models';

export const machineLearningModule: Module = {
  slug: 'machine-learning',
  title: 'Machine Learning',
  short: 'ML',
  stage: 4,
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
        {
          kind: 'visual',
          id: 'kmeans',
          caption: 'Assign, move, repeat — until assignments stop changing.',
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
      minutes: 11,
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
          kind: 'text',
          body: 'Overfitting is the central failure of machine learning, and it is not a bug — it is what you get when a model does exactly what you asked. You asked it to minimise error on the training set, and a model with enough capacity can do that by memorising, which is perfect on the examples and worthless on anything new.',
        },
        {
          kind: 'text',
          body: 'The diagnosis is the gap between training and validation error. Both high: the model is too simple to capture the pattern — underfitting. Training low, validation high: it is memorising. Both low and close: you are done, assuming the split was honest.',
        },
        {
          kind: 'heading',
          text: 'Why a penalty helps',
        },
        {
          kind: 'text',
          body: 'Memorising usually requires large, finely balanced weights — extreme coefficients that cancel each other to reproduce individual points. Adding the size of the weights to the loss makes that expensive, so the model keeps a large weight only if it buys enough accuracy to pay for itself. That is all regularisation is: a price on complexity.',
        },
        {
          kind: 'math',
          expr: 'L_total = L_data + λ · penalty(w)',
          note: 'λ sets the exchange rate between fitting the data and staying simple. Too low and nothing changes; too high and the model underfits. It is a hyperparameter, so it is chosen on validation data.',
        },
        {
          kind: 'text',
          body: '**L2** squares the weights, which punishes large ones hardest and shrinks everything smoothly towards zero without reaching it — the sensible default. **L1** uses absolute values, and its geometry drives some weights to exactly zero, so it performs feature selection as a side effect. **Elastic net** mixes both, which is the usual choice when features are correlated.',
        },
        {
          kind: 'heading',
          text: 'The other levers',
        },
        {
          kind: 'text',
          body: 'More training data is the most effective regulariser there is, and the one most often available. **Early stopping** halts training when validation error turns upward, which costs nothing. **Dropout** randomly disables units during training so the network cannot rely on any single path. **Simplifying the model** — fewer trees, shallower depth, fewer features — attacks the cause rather than the symptom.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Overfitting the validation set',
          body: 'Tune hyperparameters against a validation set for long enough and you overfit that too, by selection rather than by gradient. The validation score drifts upward while real performance does not move. This is why the test set is held back untouched, and why a result that only appears after fifty experiments deserves suspicion.',
        },
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
    {
      slug: 'anomaly-detection',
      title: 'Anomaly and outlier detection',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 10,
      summary:
        'Finding the rare, the broken and the fraudulent when you have almost no examples of it — and usually no labels at all.',
      why: 'Fraud, equipment failure and intrusion share a shape that breaks ordinary classification: the positive class is a fraction of a percent, the examples you do have are not representative of the next one, and often nobody labelled anything. A classifier that predicts "normal" every time scores 99.9% accuracy and is worthless.',
      prerequisites: ['ml-fundamentals', 'unsupervised-learning'],
      outcomes: [
        'Choose between supervised, semi-supervised and unsupervised framing for a rare-event problem',
        'Explain how isolation forest, one-class SVM and LOF each define "unusual"',
        'Set a threshold from a contamination budget rather than a score',
        'Say why precision at k is the metric operations teams actually care about',
      ],
      tags: ['anomaly detection', 'isolation forest', 'outliers', 'fraud'],
      blocks: [
        {
          kind: 'text',
          body: 'Start by deciding what you actually have. If you have a reasonable number of labelled anomalies, this is an **imbalanced classification** problem and the tools from that stage apply. If you have only normal data, it is **novelty detection**. If you have unlabelled data that probably contains some anomalies already, it is **outlier detection**. The three need different algorithms.',
        },
        {
          kind: 'visual',
          id: 'isolation',
          caption: 'Random cuts isolate the outlier in two splits; the dense point takes nine.',
        },
        {
          kind: 'table',
          head: ['Method', 'How it defines unusual', 'Where it fits'],
          rows: [
            ['Isolation forest', 'Points that random splits separate quickly', 'Default first try; scales well, few assumptions'],
            ['One-class SVM', 'Points outside a learned boundary around normal data', 'Clean training data with no contamination'],
            ['Local outlier factor', 'Points in a sparser neighbourhood than their neighbours', 'Clusters of differing density'],
            ['Gaussian / elliptic envelope', 'Low probability under a fitted distribution', 'Roughly normal, low-dimensional data'],
            ['Autoencoder reconstruction error', 'Points the model cannot reconstruct', 'High-dimensional data: images, signals'],
          ],
        },
        { kind: 'heading', text: 'Why isolation forest is the sensible default' },
        {
          kind: 'text',
          body: 'Most methods model what normal looks like and measure distance from it. Isolation forest inverts the idea: build random trees by picking a feature and a random split point, and count how many splits it takes to isolate each point. Anomalies are, by definition, easy to separate — so they sit at shallow depth. It needs no distance metric, makes no distributional assumption, and is linear in the number of samples.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Contamination is the expected anomaly rate, and it sets the threshold.',
          code: `from sklearn.ensemble import IsolationForest

model = IsolationForest(
    n_estimators=200,
    contamination=0.01,   # you expect ~1% anomalies
    random_state=0,
).fit(X_train)

# -1 is an anomaly, 1 is normal.
labels = model.predict(X_test)

# The raw score is more useful: rank by it and work down the list.
scores = -model.score_samples(X_test)`,
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Set the threshold from capacity, not from the score',
          body: 'A fraud team can investigate perhaps two hundred cases a day. That number, not a score cutoff, is the real threshold: rank by anomaly score and take the top two hundred. It also gives you the honest metric — **precision at k** — which answers "of the cases we actually looked at, how many were real".',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Scale first, and watch for drift',
          body: 'Every distance-based method (one-class SVM, LOF) is meaningless on unscaled features, exactly as k-means is. And normal behaviour moves: a model trained on last year decides this year is entirely anomalous. Anomaly detection needs the monitoring discipline from the MLOps stage more than most models do.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'anom-1',
            prompt: 'You have 5 million transactions and 300 confirmed frauds. Which framing is usually best?',
            options: [
              'Unsupervised outlier detection, ignoring the labels',
              'Supervised classification with class weighting, using anomaly scores as an extra feature',
              'Train a one-class SVM on the 300 frauds',
              'Downsample the normal transactions to 300 and train normally',
            ],
            answer: 1,
            explanation:
              'Three hundred labels is few, but it is not zero, and labels are far more informative than any unsupervised score. Use them in a weighted classifier and feed an unsupervised anomaly score in as a feature so the model still benefits from the unlabelled structure.',
          },
        },
      ],
      resources: [
        {
          label: 'scikit-learn: outlier and novelty detection',
          url: 'https://scikit-learn.org/stable/modules/outlier_detection.html',
          kind: 'docs',
        },
        {
          label: 'Isolation Forest (Liu, Ting and Zhou, 2008)',
          url: 'https://ieeexplore.ieee.org/document/4781136',
          kind: 'paper',
        },
      ],
      related: ['unsupervised-learning', 'classification-metrics', 'monitoring-and-drift'],
    },

    {
      slug: 'time-series-forecasting',
      title: 'Time series forecasting',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 13,
      summary:
        'Data where order matters: stationarity, seasonality, ARIMA and the validation discipline that stops you fooling yourself.',
      why: 'Every cross-validation habit you have learned is wrong here. Shuffle a time series and you train on the future to predict the past; the score is excellent and the model is useless. Demand, traffic, prices and load are all time series, and they are where leakage does the most damage.',
      prerequisites: ['ml-fundamentals', 'validation-strategy'],
      outcomes: [
        'Decompose a series into trend, seasonality and residual',
        'Explain stationarity and how differencing achieves it',
        'Read the p, d and q of an ARIMA model',
        'Design a walk-forward split and say why k-fold is invalid here',
        'Choose between a statistical model and gradient boosting on lag features',
      ],
      tags: ['time series', 'arima', 'stationarity', 'forecasting'],
      blocks: [
        {
          kind: 'text',
          body: 'A time series is an ordered sequence of observations, and the order carries information: today looks like yesterday, December looks like last December. Three components are usually worth separating — **trend** (long-run direction), **seasonality** (a repeating cycle of known period), and the **residual** left over.',
        },
        {
          kind: 'visual',
          id: 'decomposition',
          caption: 'The same series separated into trend, seasonality and what is left over.',
        },
        { kind: 'heading', text: 'Stationarity' },
        {
          kind: 'text',
          body: 'A series is **stationary** if its statistical properties do not change over time: constant mean, constant variance, and an autocorrelation that depends only on the lag. Classical models require it, because a model fitted to a series whose mean is drifting is fitting the drift rather than the structure. The usual fix is **differencing** — model the change from one step to the next instead of the level.',
        },
        {
          kind: 'table',
          head: ['Symptom', 'What it means', 'Fix'],
          rows: [
            ['Mean rises over time', 'Trend', 'First difference'],
            ['A cycle of fixed period', 'Seasonality', 'Seasonal difference at the period'],
            ['Variance grows with level', 'Multiplicative behaviour', 'Log transform first'],
          ],
        },
        {
          kind: 'text',
          body: 'The **augmented Dickey-Fuller** test gives a formal check, but plotting the series and its rolling mean answers the question most of the time. **Autocorrelation** plots are the other essential diagnostic: they show which lags actually carry signal.',
        },
        { kind: 'heading', text: 'ARIMA and its relatives' },
        {
          kind: 'text',
          body: 'ARIMA(p, d, q) combines three ideas. **AR(p)** regresses on the previous *p* values. **I(d)** differences the series *d* times to make it stationary. **MA(q)** regresses on the previous *q* forecast errors. **SARIMA** adds a second set of terms at the seasonal period. **Exponential smoothing** is the other classical family, weighting recent observations more heavily and extending naturally to trend and seasonality (Holt-Winters).',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Always beat the naive forecast first',
          body: 'The baseline for a time series is "tomorrow equals today", or for seasonal data "this December equals last December". A surprising number of published models fail to beat it. Report your error against that baseline, not in isolation — an MAE of 40 means nothing until you know the naive forecast scores 38.',
        },
        { kind: 'heading', text: 'Validating without leaking' },
        {
          kind: 'text',
          body: 'K-fold cross-validation assumes examples are exchangeable. They are not. The only sound approach is **walk-forward** validation: train on everything up to time *t*, predict the window after it, roll forward, repeat. Every fold trains only on its own past.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'TimeSeriesSplit never lets a fold see its own future.',
          code: `from sklearn.model_selection import TimeSeriesSplit

splitter = TimeSeriesSplit(n_splits=5, test_size=30)

for train_idx, test_idx in splitter.split(X):
    # train_idx is always strictly earlier than test_idx
    model.fit(X[train_idx], y[train_idx])
    score(model, X[test_idx], y[test_idx])`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'The subtle leak is in the features',
          body: 'Splitting correctly is not enough. Scaling with statistics computed over the whole series, filling gaps by interpolating from later values, or building a rolling mean that is centred rather than trailing all leak the future into the past. Every feature must be computable from data available at prediction time.',
        },
        {
          kind: 'text',
          body: 'Machine learning models are also viable and often win on messy real data: build **lag features** (value at t−1, t−7, t−365), rolling statistics and calendar flags, then use gradient boosting. You lose the statistical interpretation and gain the ability to use external signals like promotions and weather.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ts-1',
            prompt: 'Your demand forecast scores an R² of 0.95 in five-fold cross-validation and fails in production. What is the most likely cause?',
            options: [
              'The model is underfitting',
              'Random folds let it train on future data and predict the past',
              'The learning rate was too high',
              'There was not enough training data',
            ],
            answer: 1,
            explanation:
              'Random k-fold on a time series puts future observations in the training set for a fold whose test data is earlier. Near-neighbours in time are nearly identical, so the model effectively memorises the answer. Walk-forward validation removes the illusion.',
          },
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ts-2',
            prompt: 'What does the "I" in ARIMA do?',
            options: [
              'Adds an intercept term',
              'Differences the series to make it stationary',
              'Interpolates missing values',
              'Includes external regressors',
            ],
            answer: 1,
            explanation:
              'I stands for integrated: the series is differenced d times so that trend is removed and the result is stationary, which is the condition the AR and MA parts require.',
          },
        },
      ],
      resources: [
        {
          label: 'Forecasting: Principles and Practice (Hyndman and Athanasopoulos)',
          url: 'https://otexts.com/fpp3/',
          kind: 'book',
        },
        {
          label: 'statsmodels: time series analysis',
          url: 'https://www.statsmodels.org/stable/tsa.html',
          kind: 'docs',
        },
      ],
      related: ['validation-strategy', 'regression-metrics', 'feature-engineering'],
    },

    {
      slug: 'recommender-systems',
      title: 'Recommender systems',
      module: 'machine-learning',
      level: 'intermediate',
      minutes: 12,
      summary:
        'Content-based filtering, collaborative filtering and matrix factorisation — and why the cold start never fully goes away.',
      why: 'Recommendation is the highest-revenue application of machine learning in most consumer products, and it does not fit the standard supervised template: there is no label, only behaviour; the data is overwhelmingly missing; and the model changes the very behaviour it is trained on.',
      prerequisites: ['ml-fundamentals', 'unsupervised-learning'],
      outcomes: [
        'Contrast content-based and collaborative filtering and their failure modes',
        'Explain matrix factorisation as learning latent factors for users and items',
        'Handle implicit feedback without treating absence as dislike',
        'Name three strategies for the cold-start problem',
        'Say why offline accuracy is a weak proxy for recommendation quality',
      ],
      tags: ['recommenders', 'collaborative filtering', 'matrix factorisation', 'cold start'],
      blocks: [
        {
          kind: 'text',
          body: 'There are two ways to decide what someone will like. **Content-based** filtering describes the items and recommends things similar to what they already chose. **Collaborative** filtering ignores the items entirely and uses the crowd: people who behaved like you also liked this.',
        },
        {
          kind: 'visual',
          id: 'matrix-factorisation',
          caption: 'A mostly empty ratings matrix rebuilt from two small factor matrices.',
        },
        {
          kind: 'table',
          head: ['', 'Content-based', 'Collaborative'],
          rows: [
            ['Needs', 'Item features', 'Interaction history'],
            ['New item', 'Works immediately', 'Invisible until someone interacts'],
            ['New user', 'Needs one interaction', 'Needs several'],
            ['Weakness', 'Recommends more of the same', 'Popularity bias'],
            ['Strength', 'Explainable', 'Finds non-obvious connections'],
          ],
        },
        { kind: 'heading', text: 'Matrix factorisation' },
        {
          kind: 'text',
          body: 'Lay users along one axis and items along the other and you get a matrix that is almost entirely empty — a typical user has touched a vanishing fraction of the catalogue. Factorisation assumes this sparse matrix is approximately the product of two much smaller ones: a vector of latent factors per user, and one per item.',
        },
        {
          kind: 'math',
          expr: 'r̂(u,i) = μ + b_u + b_i + p_u · q_i',
          note: 'A global average, a bias for how generous this user is, a bias for how well-liked this item is, and the dot product of the two latent vectors. The biases alone are a surprisingly strong baseline.',
        },
        {
          kind: 'text',
          body: 'Nobody labels the factors; they are learned. In practice they come out interpretable anyway — a dimension that separates documentary from action, or mainstream from niche. This is the same idea as the embeddings used throughout the LLM stages: a dense vector whose geometry encodes similarity.',
        },
        { kind: 'heading', text: 'Implicit feedback' },
        {
          kind: 'text',
          body: 'Explicit ratings are rare and biased towards the extremes. Most systems run on **implicit** signals: clicks, plays, purchases, dwell time. The critical difference is that a missing entry is not a negative. A film you never watched might be one you would love, or one you never saw listed. Implicit models treat observations as positive with a **confidence** weight, and unobserved pairs as weak negatives rather than confirmed dislikes.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'The feedback loop is the real hazard',
          body: 'A recommender trains on interactions it caused. Show popular items, they get more clicks, they look more popular, you show them more. Left alone the catalogue collapses to a handful of items and the model looks excellent on every offline metric while the experience narrows. Deliberate exploration and diversity constraints are not nice-to-haves.',
        },
        { kind: 'heading', text: 'Cold start' },
        {
          kind: 'list',
          items: [
            '**New item.** Fall back to content features until interactions accumulate — a hybrid model handles this by construction.',
            '**New user.** Ask directly during onboarding, or recommend popular-but-diverse items and learn fast from the first few actions.',
            '**New everything.** Use whatever context exists: device, locale, referrer, time of day. Weak signals beat none.',
          ],
        },
        {
          kind: 'text',
          body: 'Evaluate with ranking metrics — precision at k, recall at k, NDCG — not RMSE on predicted ratings. Users see a list, not a number, and being right about the top five matters far more than being calibrated about item nine hundred. And offline metrics reward recommending what the user would have found anyway; the honest test is an online one.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rec-1',
            prompt: 'In an implicit-feedback system, what does an unobserved user-item pair mean?',
            options: [
              'The user disliked the item',
              'Unknown — it may be unseen rather than rejected',
              'The item is unavailable to that user',
              'It should be dropped from training',
            ],
            answer: 1,
            explanation:
              'Absence conflates "did not like" with "never encountered". Treating every unobserved pair as a hard negative teaches the model that most of the catalogue is bad, which is why implicit models weight observed interactions by confidence instead.',
          },
        },
      ],
      resources: [
        {
          label: 'Matrix Factorization Techniques for Recommender Systems (Koren, Bell and Volinsky)',
          url: 'https://ieeexplore.ieee.org/document/5197422',
          kind: 'paper',
        },
        {
          label: 'Collaborative Filtering for Implicit Feedback Datasets (Hu, Koren and Volinsky)',
          url: 'https://ieeexplore.ieee.org/document/4781121',
          kind: 'paper',
        },
      ],
      related: ['unsupervised-learning', 'embeddings-explained', 'feature-engineering'],
    },
  ],
};
