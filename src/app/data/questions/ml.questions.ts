import { InterviewQuestion } from '../../core/models/content.models';

/** Machine learning, evaluation, deep learning and computer vision. */
export const mlQuestions: InterviewQuestion[] = [
  {
    id: 'ml-bias-variance',
    question: 'Explain the bias-variance trade-off.',
    category: 'Machine Learning',
    difficulty: 'beginner',
    kind: 'conceptual',
    answer:
      'Bias is error from an over-simple model that cannot represent the pattern; variance is error from a model so flexible it fits noise. Adding capacity lowers bias and raises variance, and total error is minimised somewhere between.',
    explanation:
      'Diagnose with two numbers: low training and low validation score means high bias; high training with much lower validation means high variance.',
    mistake: 'Describing it as a property of the dataset rather than of the model’s capacity relative to the data.',
    followUps: ['Where do ensembles sit on this trade-off?', 'Does more data reduce bias or variance?'],
  },
  {
    id: 'ml-overfit-fix',
    question: 'Your model scores 0.97 on training and 0.68 on validation. What do you do, in order?',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    kind: 'scenario',
    answer:
      'Check for a split problem first (leakage, duplicates, grouping). Then reduce capacity or add regularisation, add data or augmentation, and use early stopping. Cross-validate so you are not chasing one unlucky split.',
    mistake: 'Jumping straight to a bigger model or more epochs, which widens the gap.',
    followUps: ['Which regularisers would you try first for a tree ensemble?', 'How would you detect duplicate leakage?'],
  },
  {
    id: 'ml-l1-l2',
    question: 'L1 versus L2 regularisation?',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    kind: 'mathematical',
    answer:
      'L1 penalises the absolute value of weights and drives some exactly to zero, giving feature selection. L2 penalises squared magnitude and shrinks all weights smoothly without eliminating any.',
    explanation:
      'Geometrically, the L1 constraint region has corners on the axes, which is why optima land at zero for some coefficients.',
    followUps: ['What is elastic net for?', 'Why must features be scaled before regularising?'],
  },
  {
    id: 'ml-bagging-boosting',
    question: 'Bagging versus boosting?',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Bagging trains models independently on bootstrap samples and averages them, reducing variance. Boosting trains models sequentially, each fitting the previous ensemble’s errors, reducing bias.',
    explanation:
      'Hence forests use deep trees (high variance, averaged away) and boosting uses shallow ones (high bias, corrected by the sequence).',
    mistake: 'Saying boosting cannot overfit. Too many rounds or too high a learning rate will.',
    followUps: ['Why is bagging parallelisable and boosting not?', 'How does early stopping fit in?'],
  },
  {
    id: 'ml-imbalance',
    question: 'How do you handle a dataset that is 1% positive?',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    kind: 'scenario',
    answer:
      'Change the metric first — precision, recall, PR-AUC instead of accuracy. Then class weights in the loss, threshold tuning on a validation set, and resampling (SMOTE or undersampling) if needed. Reframing as ranking or anomaly detection is sometimes better than classification.',
    mistake: 'Oversampling before the split, which duplicates the same rows into train and validation and inflates the score.',
    followUps: ['Why is PR-AUC preferred over ROC-AUC here?', 'What does SMOTE actually do?'],
  },
  {
    id: 'ml-feature-importance',
    question: 'Is feature importance from a gradient boosting model a causal statement?',
    category: 'Machine Learning',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'No. It reports what the model used to reduce loss, which reflects correlation, feature encoding and cardinality. Split-based importance is biased towards high-cardinality features.',
    explanation:
      'Permutation importance and SHAP are better behaved, but still describe the model rather than the world.',
    followUps: ['How do correlated features split importance?', 'What would you need for a causal claim?'],
  },
  {
    id: 'ml-kmeans-k',
    question: 'How do you choose k for k-means?',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Elbow curve on within-cluster sum of squares, silhouette score across candidate k values, and — decisively — whether the resulting clusters mean something to a domain expert.',
    mistake: 'Treating the elbow as objective. It is frequently ambiguous, which is why silhouette and interpretability matter.',
    followUps: ['When would DBSCAN be better?', 'Why scale features before k-means?'],
  },
  {
    id: 'ml-generative-discriminative',
    question: 'Generative versus discriminative models?',
    category: 'Machine Learning',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'A discriminative model learns P(y | x) — the boundary. A generative model learns P(x, y), so it can also sample new data. Logistic regression is discriminative; Naive Bayes and language models are generative.',
    followUps: ['Why does Naive Bayes work well with little data?', 'Is an LLM generative or discriminative?'],
  },
  {
    id: 'eval-precision-recall',
    question: 'Precision or recall: which matters for spam filtering, and which for cancer screening?',
    category: 'Model Evaluation',
    difficulty: 'beginner',
    kind: 'scenario',
    answer:
      'Spam filtering favours precision — a legitimate email in the spam folder is worse than a spam message in the inbox. Screening favours recall — a missed diagnosis is far costlier than an extra follow-up test.',
    explanation: 'The metric follows the asymmetry of the two error costs, which is a business question, not a modelling one.',
    followUps: ['How would you set the threshold in each case?', 'What is F-beta for?'],
  },
  {
    id: 'eval-roc-pr',
    question: 'When does ROC-AUC mislead, and what do you use instead?',
    category: 'Model Evaluation',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'On heavily imbalanced data. The false positive rate has the large negative class in its denominator, so thousands of false positives barely move it. PR-AUC (average precision) exposes that directly.',
    mistake: 'Reporting 0.95 ROC-AUC on a 1%-positive problem as strong evidence.',
    followUps: ['What does average precision measure?', 'Is ROC-AUC threshold dependent?'],
  },
  {
    id: 'eval-cv-timeseries',
    question: 'Why can you not use random k-fold on time-series data?',
    category: 'Model Evaluation',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Random folds put future observations in the training set and past ones in validation, so the model uses information that would not exist at prediction time. Use a forward-chaining split.',
    followUps: ['How do you handle seasonality in the split?', 'What is a gap or embargo period?'],
  },
  {
    id: 'eval-metric-vs-loss',
    question: 'Why train with cross-entropy but report F1?',
    category: 'Model Evaluation',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'The loss must be differentiable for gradient descent; F1 is a step function of thresholded counts and is not. Cross-entropy is a differentiable surrogate that correlates with what you care about, and the threshold is tuned afterwards.',
    followUps: ['How would you optimise for recall at fixed precision?', 'What does class weighting do to the loss?'],
  },
  {
    id: 'eval-calibration',
    question: 'What does it mean for a model to be calibrated, and how do you check it?',
    category: 'Model Evaluation',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Among predictions of 0.7, roughly 70% should be positive. Check with a reliability diagram or Brier score; fix with Platt scaling or isotonic regression on a held-out set.',
    explanation:
      'It matters whenever the probability feeds a decision rule or expected-value calculation rather than just a ranking.',
    followUps: ['Are boosted trees well calibrated?', 'Does calibration change ranking metrics?'],
  },
  {
    id: 'dl-vanishing',
    question: 'What causes vanishing gradients and what fixes them?',
    category: 'Deep Learning',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Saturating activations have derivatives below 1, and backpropagation multiplies them across layers, so the signal reaching early layers approaches zero. Fixes: ReLU/GELU, residual connections, normalisation layers, and careful initialisation.',
    explanation: 'Sigmoid’s derivative peaks at 0.25, so ten layers scale the gradient by at most about 1e-6.',
    followUps: ['What is the opposite failure and how is it handled?', 'Why do residuals help specifically?'],
  },
  {
    id: 'dl-batchnorm',
    question: 'Batch normalisation versus layer normalisation?',
    category: 'Deep Learning',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Batch norm normalises each feature across the batch, so it depends on batch size and needs running statistics at inference. Layer norm normalises across features within each example, so it is batch independent — which is why transformers use it.',
    followUps: ['What breaks with batch norm at batch size 1?', 'What is pre-norm versus post-norm?'],
  },
  {
    id: 'dl-dropout-eval',
    question: 'What happens if you forget `model.eval()` before inference?',
    category: 'Deep Learning',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'Dropout stays active and batch norm keeps using batch statistics, so predictions are noisy, batch-size dependent and worse than they should be — with no error raised.',
    followUps: ['What does `torch.no_grad()` do differently?', 'How would you detect this in production?'],
  },
  {
    id: 'dl-lr-symptoms',
    question: 'How do you tell a learning rate is too high or too low from the loss curve?',
    category: 'Deep Learning',
    difficulty: 'intermediate',
    kind: 'debugging',
    answer:
      'Too high: the loss oscillates, plateaus at a poor value, or diverges to NaN. Too low: it decreases smoothly but far too slowly, or stalls early. A learning-rate range test finds a usable band quickly.',
    followUps: ['What does warmup fix?', 'How does batch size interact with the learning rate?'],
  },
  {
    id: 'dl-params',
    question: 'A network is 784 → 256 → 128 → 10, fully connected with biases. Parameter count?',
    category: 'Deep Learning',
    difficulty: 'intermediate',
    kind: 'mathematical',
    answer:
      '(784x256 + 256) + (256x128 + 128) + (128x10 + 10) = 200,960 + 32,896 + 1,290 = 235,146.',
    explanation: 'Worth being able to do quickly: it is how you estimate memory before launching a run.',
    followUps: ['How much memory does that need in fp32 during training?', 'Where do most parameters sit in a transformer?'],
  },
  {
    id: 'dl-augmentation',
    question: 'You have 2,000 labelled images and the model overfits immediately. Options?',
    category: 'Deep Learning',
    difficulty: 'intermediate',
    kind: 'scenario',
    answer:
      'Transfer learning from a pretrained backbone with the early layers frozen, aggressive but label-preserving augmentation, strong regularisation, and early stopping. Training from scratch at that scale is not viable.',
    mistake: 'Adding layers to "learn more" from 2,000 images.',
    followUps: ['Which augmentations would be wrong for medical imaging?', 'When would you unfreeze the backbone?'],
  },
  {
    id: 'cv-conv-vs-dense',
    question: 'Why use convolution instead of a fully connected layer on images?',
    category: 'Computer Vision',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Convolution encodes locality and reuses the same kernel across positions, so parameter count depends on kernel size rather than image size and a learned feature generalises across the image. A dense layer on 224x224x3 needs 150,528 weights per unit and learns each position separately.',
    followUps: ['What is translation equivariance?', 'Why do ViTs work without this bias?'],
  },
  {
    id: 'cv-output-size',
    question: 'Input 128x128, kernel 3x3, stride 2, padding 1. Output size?',
    category: 'Computer Vision',
    difficulty: 'intermediate',
    kind: 'mathematical',
    answer: 'floor((128 + 2 − 3) / 2) + 1 = floor(63.5) + 1 = 64. So 64x64.',
    followUps: ['What combination preserves spatial size?', 'How does dilation change this?'],
  },
  {
    id: 'cv-nms',
    question: 'What is non-maximum suppression and why is it needed?',
    category: 'Computer Vision',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Detectors emit many overlapping candidate boxes per object. NMS keeps the highest-scoring box and removes others overlapping it above an IoU threshold, leaving one box per object.',
    followUps: ['What does the IoU threshold trade off?', 'What is soft-NMS?'],
  },
  {
    id: 'cv-transfer',
    question: 'Would you freeze or fine-tune a pretrained backbone for satellite imagery?',
    category: 'Computer Vision',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Fine-tune, at a low learning rate, if you have enough data. Satellite imagery differs substantially from the natural photographs of the pretraining set, so the later layers’ features transfer poorly even though the early edge detectors still help.',
    explanation: 'The rule of thumb: the larger the domain shift, the deeper you need to retrain.',
    followUps: ['What learning rate would you use relative to a new head?', 'What is discriminative learning rate scheduling?'],
  },
];
