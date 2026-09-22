import { InterviewQuestion } from '../../core/models/content.models';

/** Python, NumPy/pandas, mathematics and statistics. */
export const foundationsQuestions: InterviewQuestion[] = [
  {
    id: 'py-list-tuple',
    question: 'When would you use a tuple instead of a list?',
    category: 'Python',
    difficulty: 'beginner',
    kind: 'conceptual',
    answer:
      'When the collection is a fixed-shape record that should not change, and when it needs to be hashable — a tuple can be a dictionary key or a set member, a list cannot.',
    explanation:
      'Immutability also makes intent explicit: a tuple signals "these fields belong together", such as an array shape or a coordinate.',
    mistake: 'Claiming tuples are used mainly because they are faster. The speed difference is negligible; immutability and hashability are the reasons.',
    followUps: ['Why can a list not be a dict key?', 'What does hashable mean?'],
  },
  {
    id: 'py-mutable-default',
    question: 'What is wrong with `def add(item, bucket=[])`?',
    category: 'Python',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'The default is evaluated once when the function is defined, so every call without an explicit argument shares the same list and it accumulates across calls.',
    code: {
      lang: 'python',
      code: `def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket`,
    },
    mistake: 'Believing a fresh list is created on each call.',
    followUps: ['Which other types have this problem?', 'When might you want the shared default?'],
  },
  {
    id: 'py-generator',
    question: 'What is a generator and why does it matter for large datasets?',
    category: 'Python',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'A generator produces values one at a time and keeps only the current item in memory. It lets you iterate a file or stream larger than RAM, and it is the pattern behind data loaders.',
    code: {
      lang: 'python',
      code: `def read_examples(path):
    with open(path) as handle:
        for line in handle:        # one line in memory at a time
            yield json.loads(line)`,
    },
    mistake: 'Saying a generator is just a faster list. It is lazy and single-pass — you cannot index it or iterate it twice.',
    followUps: ['What does `yield` do to the function?', 'How do you get the length of a generator?'],
  },
  {
    id: 'py-shallow-deep',
    question: 'Shallow copy versus deep copy — where does this bite in ML code?',
    category: 'Python',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'A shallow copy copies the container but shares the nested objects. Mutating a nested config dict, or a list of arrays, then changes both copies — which silently corrupts experiment configurations and augmentation pipelines.',
    mistake: 'Using `dict(config)` for a nested configuration and assuming the copy is independent.',
    followUps: ['How do you deep copy a PyTorch model?', 'Why is deep copying a large array expensive?'],
  },
  {
    id: 'py-decorator',
    question: 'What is a decorator, with an ML-relevant example?',
    category: 'Python',
    difficulty: 'intermediate',
    kind: 'coding',
    answer:
      'A decorator wraps a function to add behaviour without changing its body. In ML code they are used for caching, timing, retries and registering model variants.',
    code: {
      lang: 'python',
      code: `from functools import lru_cache


@lru_cache(maxsize=4096)
def embed(text: str) -> tuple[float, ...]:
    """Identical inputs are embedded once, not once per call."""
    return tuple(model.encode(text))`,
    },
    followUps: ['Why must the cached function’s arguments be hashable?', 'What breaks if the wrapped function is not pure?'],
  },
  {
    id: 'np-view-copy',
    question: 'Does NumPy slicing return a view or a copy? Why does it matter?',
    category: 'NumPy & pandas',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'Basic slicing returns a view sharing memory, so writing to the slice modifies the original. Fancy indexing (a list of indices or a boolean mask) returns a copy.',
    explanation:
      'This is how a "validation split" can end up modified by an in-place training transform. Call `.copy()` when you need independence.',
    mistake: 'Assuming all indexing copies, which produces bugs that only appear when a transform is applied in place.',
    followUps: ['How do you check whether an array owns its data?', 'What does `np.may_share_memory` tell you?'],
  },
  {
    id: 'np-broadcast',
    question: 'Explain broadcasting and give a case where it silently does the wrong thing.',
    category: 'NumPy & pandas',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Shapes are aligned from the right and any dimension of size 1 is stretched. The silent failure is subtracting a shape `(n,)` vector from an `(n, n)` matrix: it applies row-wise when you may have intended column-wise, and no error is raised.',
    code: {
      lang: 'python',
      code: `x = np.ones((3, 3))
col = np.array([1, 2, 3])

x - col              # applied to each ROW
x - col[:, None]     # applied to each COLUMN — usually what was meant`,
    },
    followUps: ['What shapes are incompatible?', 'How does this relate to adding a bias vector in a layer?'],
  },
  {
    id: 'pd-loc-iloc',
    question: 'Difference between `.loc` and `.iloc`?',
    category: 'NumPy & pandas',
    difficulty: 'beginner',
    kind: 'conceptual',
    answer:
      '`.loc` selects by label and its slices are inclusive of the end point. `.iloc` selects by integer position and its slices exclude the end, like Python lists.',
    mistake: 'Using `.loc[0:5]` on a default integer index and expecting five rows — you get six.',
    followUps: ['What happens after `reset_index`?', 'Why does chained indexing raise a warning?'],
  },
  {
    id: 'pd-merge-explosion',
    question: 'A join grew your DataFrame from 10k to 14k rows. What happened and how do you prevent it?',
    category: 'NumPy & pandas',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'The right-hand table has duplicate join keys, so each left row matched several. Prevent it with `validate="many_to_one"` on the merge, or deduplicate the right side first.',
    explanation: 'Row-count checks before and after every join catch this class of bug in one line.',
    followUps: ['How does this corrupt downstream aggregates?', 'What does `indicator=True` show you?'],
  },
  {
    id: 'pd-groupby',
    question: 'How would you compute per-customer aggregates and attach them back to each row?',
    category: 'NumPy & pandas',
    difficulty: 'intermediate',
    kind: 'coding',
    answer:
      'Use `groupby(...).transform(...)` — it returns a series aligned to the original index, so no merge is needed.',
    code: {
      lang: 'python',
      code: `df["cust_avg_spend"] = df.groupby("customer_id")["spend"].transform("mean")
df["spend_vs_avg"] = df["spend"] / df["cust_avg_spend"]`,
    },
    mistake: 'Using `agg` then merging back, which is slower and risks the row-multiplication bug.',
    followUps: ['Why is this feature a leakage risk if computed before the split?'],
  },
  {
    id: 'stat-bayes',
    question: 'A test is 99% sensitive with a 5% false positive rate for a disease affecting 1 in 1,000. You test positive. Probability you are ill?',
    category: 'Statistics',
    difficulty: 'intermediate',
    kind: 'mathematical',
    answer:
      'About 2%. Out of 100,000 people, 100 are ill and 99 test positive; 99,900 are healthy and 4,995 test positive. 99 / (99 + 4,995) ≈ 1.9%.',
    explanation:
      'The base rate dominates. This is the same arithmetic that makes accuracy useless on imbalanced classification and explains false-positive floods in fraud detection.',
    mistake: 'Answering 99% by confusing P(positive | ill) with P(ill | positive).',
    followUps: ['How does this change if the base rate is 1 in 10?', 'Which metric captures this problem?'],
  },
  {
    id: 'stat-pvalue',
    question: 'What does a p-value of 0.03 mean?',
    category: 'Statistics',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'If the null hypothesis were true, there is a 3% chance of observing data at least this extreme. It is not the probability that the null hypothesis is false, and it says nothing about effect size.',
    mistake: 'Reading it as "97% chance the result is real".',
    followUps: ['What is a confidence interval and why is it often more useful?', 'What is p-hacking?'],
  },
  {
    id: 'stat-clt',
    question: 'What does the central limit theorem let you do?',
    category: 'Statistics',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'The distribution of sample means approaches a normal distribution as sample size grows, whatever the population distribution. That is what licenses confidence intervals and t-tests on non-normal data.',
    mistake: 'Claiming it makes the data normal. It concerns the sampling distribution of the statistic, not the raw values.',
    followUps: ['When does it fail?', 'How large a sample is enough?'],
  },
  {
    id: 'stat-correlation',
    question: 'Two features have correlation 0.02. Can you conclude they are unrelated?',
    category: 'Statistics',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'No. Pearson correlation measures linear association only. A perfect quadratic or cyclic relationship can have near-zero correlation, and tree models would still exploit it.',
    followUps: ['What does Spearman capture that Pearson does not?', 'How would you detect a non-linear relationship?'],
  },
  {
    id: 'math-dotproduct',
    question: 'Why is cosine similarity the default for comparing embeddings?',
    category: 'Mathematics',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'It compares direction and ignores magnitude. Embedding magnitude often reflects text length or frequency rather than meaning, so removing it makes the comparison about semantics.',
    explanation:
      'If vectors are L2-normalised, the dot product equals cosine similarity, which is why vector stores normalise on insert.',
    followUps: ['When would Euclidean distance be preferable?', 'What is the range of cosine similarity?'],
  },
  {
    id: 'math-gradient',
    question: 'What is a gradient, and what does its sign tell you?',
    category: 'Mathematics',
    difficulty: 'intermediate',
    kind: 'mathematical',
    answer:
      'A gradient is the vector of partial derivatives of a function with respect to each parameter. It points in the direction of steepest increase, so training steps in the opposite direction.',
    mistake: 'Confusing the gradient with the loss value. A small loss with a large gradient is possible, and vice versa.',
    followUps: ['What does a zero gradient mean?', 'Why divide attention scores by √d_k?'],
  },
  {
    id: 'math-eigen',
    question: 'Where do eigenvectors appear in machine learning?',
    category: 'Mathematics',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Principal component analysis: the eigenvectors of the covariance matrix are the directions of greatest variance, and their eigenvalues are how much variance each explains. They also appear in spectral clustering and graph methods.',
    followUps: ['What does PCA discard?', 'Why standardise before PCA?'],
  },
  {
    id: 'py-oom',
    question: 'Your training script is killed by the OS partway through. How do you diagnose it?',
    category: 'Python',
    difficulty: 'advanced',
    kind: 'debugging',
    answer:
      'That is usually the out-of-memory killer. Check whether the whole dataset is loaded eagerly, whether results are accumulated in a list each epoch, and whether tensors with graph history are being appended (use `.detach()` or `.item()`).',
    explanation:
      'Host RAM and GPU memory fail differently: an OS kill is host RAM, a CUDA out-of-memory error is the GPU.',
    followUps: ['How does gradient accumulation help GPU memory?', 'What does a DataLoader with workers change?'],
  },
  {
    id: 'stat-ab-test',
    question: 'How would you design an A/B test for a new recommendation model?',
    category: 'Statistics',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Define one primary metric and guardrail metrics up front, compute the sample size needed for the effect you care about, randomise at the user level (not the session level), run for a full business cycle, and decide against the pre-registered metric.',
    explanation:
      'Randomising per session lets one user see both variants, contaminating the comparison. Stopping as soon as significance appears inflates false positives.',
    mistake: 'Peeking daily and stopping at the first significant result.',
    followUps: ['What is a novelty effect?', 'How do you handle network effects between users?'],
  },
];
