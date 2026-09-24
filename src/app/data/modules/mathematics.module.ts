import { Module } from '../../core/models/content.models';

export const mathematicsModule: Module = {
  slug: 'mathematics',
  title: 'Mathematics for ML',
  short: 'Mathematics',
  stage: 2,
  level: 'beginner',
  tagline: 'Linear algebra, probability and calculus — only the parts models are built from.',
  description:
    'You do not need a mathematics degree to do machine learning, and you cannot debug a model ' +
    'without the intuition. This stage covers the three areas that actually appear in model code: ' +
    'linear algebra for representation, probability for uncertainty, and calculus for learning.',
  topics: [
    {
      slug: 'vectors-and-matrices',
      title: 'Vectors, matrices and why everything is one',
      module: 'mathematics',
      level: 'beginner',
      minutes: 9,
      summary: 'Data as vectors, transformations as matrices, and the shape rules that govern every layer.',
      why: 'A model does not see text or pixels. It sees arrays of numbers. Linear algebra is the language for describing those arrays and the transformations applied to them — which is why nearly every error message you will get is about shapes.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Read a tensor shape and know what each dimension means',
        'Predict the output shape of a matrix multiplication',
        'Explain why a dot product measures similarity',
      ],
      tags: ['linear algebra', 'vectors', 'matrices'],
      blocks: [
        {
          kind: 'text',
          body: 'A **vector** is an ordered list of numbers describing one thing: a house as `[bedrooms, area, age]`, a word as a 768-number embedding. A **matrix** is a stack of vectors — a dataset of 1,000 houses with 3 features is a 1000x3 matrix.',
        },
        {
          kind: 'math',
          expr: 'A (m x n) · B (n x p) = C (m x p)',
          note: 'The inner dimensions must match and they vanish; the outer ones survive. This single rule explains most shape errors in deep learning.',
        },
        { kind: 'heading', text: 'The dot product is a similarity score' },
        {
          kind: 'text',
          body: 'The dot product of two vectors is large when they point the same way, zero when they are perpendicular, negative when opposed. Cosine similarity is the same quantity with the lengths divided out, which is why it is the default comparison for embeddings.',
        },
        {
          kind: 'math',
          expr: 'cos(θ) = (a · b) / (‖a‖ ‖b‖)',
          note: 'Ranges from -1 (opposite) through 0 (unrelated) to 1 (identical direction).',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Similarity between three tiny embeddings',
          code: `import numpy as np

king = np.array([0.9, 0.8, 0.1])
queen = np.array([0.88, 0.75, 0.15])
laptop = np.array([0.1, 0.05, 0.95])


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))


print(round(cosine(king, queen), 3))   # 0.999  — near-identical direction
print(round(cosine(king, laptop), 3))  # 0.253  — unrelated`,
        },
        {
          kind: 'text',
          body: 'A neural network layer is `output = activation(input @ W + b)`. The matrix `W` is a learned transformation; training is the search for the numbers inside it.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Debugging by shape',
          body: 'When a model will not run, print shapes at every step before reading the code. `(32, 128)` meeting `(768, 256)` tells you exactly which layer disagrees with the one before it.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'lin-1',
            prompt: 'A batch of 64 sentences, each 128 tokens, each token a 768-dim embedding. What is the tensor shape?',
            options: ['(128, 64, 768)', '(64, 128, 768)', '(768, 128, 64)', '(64, 768)'],
            answer: 1,
            explanation:
              'Convention is batch first, then sequence, then feature: (batch=64, sequence=128, model dimension=768).',
          },
        },
      ],
      resources: [
        { label: '3Blue1Brown — Essence of Linear Algebra', url: 'https://www.3blue1brown.com/topics/linear-algebra', kind: 'video' },
        { label: 'NumPy linear algebra reference', url: 'https://numpy.org/doc/stable/reference/routines.linalg.html', kind: 'docs' },
      ],
      related: ['numpy-arrays', 'embeddings-explained'],
    },
    {
      slug: 'probability-and-statistics',
      title: 'Probability and statistics you will actually use',
      module: 'mathematics',
      level: 'beginner',
      minutes: 10,
      summary: 'Distributions, expectation, variance, conditional probability and Bayes — the vocabulary of uncertainty.',
      why: 'Every model output is a claim under uncertainty. Probability is how you state that claim precisely, and statistics is how you decide whether a measured improvement is real or noise.',
      prerequisites: ['vectors-and-matrices'],
      outcomes: [
        'Read mean, variance and distribution shape from data',
        'Apply Bayes’ theorem to a realistic screening problem',
        'Explain why a 99% accurate test can still be usually wrong',
      ],
      tags: ['probability', 'statistics', 'bayes'],
      blocks: [
        {
          kind: 'table',
          head: ['Quantity', 'Question it answers', 'Where it shows up'],
          rows: [
            ['Mean', 'Where is the centre?', 'Feature scaling, baseline predictors'],
            ['Variance / std dev', 'How spread out is it?', 'Standardisation, weight initialisation'],
            ['Distribution', 'What shape is the data?', 'Choosing a loss, spotting skew and outliers'],
            ['Conditional probability', 'Given A, how likely is B?', 'Classification, language modelling'],
            ['Expectation', 'What is the long-run average?', 'Loss functions, reinforcement learning'],
          ],
        },
        { kind: 'heading', text: 'Bayes’ theorem, and why base rates dominate' },
        {
          kind: 'math',
          expr: 'P(A | B) = P(B | A) · P(A) / P(B)',
          note: 'Posterior = likelihood x prior / evidence.',
        },
        {
          kind: 'text',
          body: 'A disease affects 1 in 1,000 people. A test catches 99% of cases and has a 5% false positive rate. You test positive. The intuitive answer is "99% likely ill"; the correct answer is under 2%.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Worked out on 100,000 people',
          code: `prior = 0.001          # 100 ill out of 100,000
sensitivity = 0.99     # 99 of them test positive
false_positive = 0.05  # 4,995 of the 99,900 healthy also test positive

true_positives = 100_000 * prior * sensitivity           # 99
false_positives = 100_000 * (1 - prior) * false_positive # 4,995

posterior = true_positives / (true_positives + false_positives)
print(f"{posterior:.1%}")  # 1.9%`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'This is the fraud-detection trap',
          body: 'Rare-event classifiers drown in false positives for exactly this reason. It is why accuracy is a useless metric on imbalanced data, and why precision and recall exist.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'prob-1',
            prompt: 'A model is 99.9% accurate at detecting fraud, where 0.1% of transactions are fraudulent. What does that tell you?',
            options: [
              'The model is excellent',
              'Almost nothing — predicting "not fraud" every time also scores 99.9%',
              'The dataset is too small',
              'It will have high recall',
            ],
            answer: 1,
            explanation:
              'With a 0.1% base rate, the majority-class predictor is 99.9% accurate while catching zero fraud. Accuracy on imbalanced data is a measure of the base rate, not the model.',
          },
        },
      ],
      resources: [
        { label: 'Seeing Theory — visual probability', url: 'https://seeing-theory.brown.edu/', kind: 'course' },
        { label: 'SciPy statistics reference', url: 'https://docs.scipy.org/doc/scipy/reference/stats.html', kind: 'docs' },
      ],
      related: ['classification-metrics', 'svm-knn-and-naive-bayes'],
    },
    {
      slug: 'calculus-and-gradients',
      title: 'Derivatives, gradients and optimisation',
      module: 'mathematics',
      level: 'intermediate',
      minutes: 9,
      summary: 'What a gradient is, why it points uphill, and how that single fact makes learning possible.',
      why: 'Training is optimisation. A model learns by computing how much each parameter contributed to the error and stepping the other way. That "how much" is a partial derivative.',
      prerequisites: ['vectors-and-matrices'],
      outcomes: [
        'Explain a gradient as a vector of partial derivatives',
        'Describe gradient descent as an update rule',
        'Reason about what a learning rate that is too big or too small does',
      ],
      tags: ['calculus', 'gradients', 'optimisation'],
      blocks: [
        {
          kind: 'text',
          body: 'A derivative answers: if I nudge this input slightly, how much does the output move? For a function of many parameters, collect one partial derivative per parameter and you have the **gradient** — a vector pointing in the direction of steepest increase.',
        },
        {
          kind: 'math',
          expr: 'θ ← θ − η · ∇L(θ)',
          note: 'New parameters = old parameters minus the learning rate times the gradient of the loss. This one line is the engine of nearly all modern ML.',
        },
        { kind: 'visual', id: 'gradient-descent', caption: 'Change the learning rate and watch the path to the minimum.' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Gradient descent by hand on a one-parameter problem',
          code: `def loss(w: float) -> float:
    return (w - 3) ** 2          # minimum at w = 3


def gradient(w: float) -> float:
    return 2 * (w - 3)           # derivative of the loss


w, lr = 0.0, 0.1
for step in range(5):
    w -= lr * gradient(w)
    print(f"step {step}: w={w:.3f} loss={loss(w):.3f}")

# step 0: w=0.600 loss=5.760
# step 1: w=1.080 loss=3.686
# step 2: w=1.464 loss=2.359
# step 3: w=1.771 loss=1.510
# step 4: w=2.017 loss=0.966`,
        },
        {
          kind: 'table',
          head: ['Learning rate', 'Behaviour'],
          rows: [
            ['Too small', 'Converges, but slowly; may stall in a flat region'],
            ['About right', 'Loss falls steadily and levels off'],
            ['Too large', 'Loss oscillates or diverges to NaN'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'You will not compute these by hand',
          body: 'PyTorch and TensorFlow build a graph of operations and differentiate it automatically (autograd). Understanding the mechanism matters because it explains vanishing gradients, exploding gradients and why activation choice is not cosmetic.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'calc-1',
            prompt: 'Training loss jumps around and then becomes NaN. Most likely cause?',
            options: [
              'The dataset is too small',
              'The learning rate is too high',
              'Too few epochs',
              'The model has too few parameters',
            ],
            answer: 1,
            explanation:
              'Oversized steps overshoot the minimum, amplify each iteration, and overflow to NaN. Lowering the learning rate (or clipping gradients) is the first thing to try.',
          },
        },
      ],
      resources: [
        { label: '3Blue1Brown — Essence of Calculus', url: 'https://www.3blue1brown.com/topics/calculus', kind: 'video' },
        { label: 'PyTorch autograd guide', url: 'https://docs.pytorch.org/docs/stable/notes/autograd.html', kind: 'docs' },
      ],
      related: ['backpropagation', 'optimisers-and-schedules'],
    },
  ],
};
