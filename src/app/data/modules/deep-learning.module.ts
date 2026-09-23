import { Module } from '../../core/models/content.models';

export const deepLearningModule: Module = {
  slug: 'deep-learning',
  title: 'Deep Learning',
  short: 'Deep Learning',
  stage: 5,
  level: 'intermediate',
  tagline: 'Neural networks from the perceptron up: layers, activations, backpropagation, training.',
  description:
    'Deep learning is the same supervised setup as classical ML with a much more flexible model ' +
    'class and gradient descent doing the work. This stage builds the network from its smallest ' +
    'part and covers the practical decisions — activation, optimiser, batch size, regularisation — ' +
    'that determine whether training works.',
  topics: [
    {
      slug: 'neural-network-basics',
      title: 'From perceptron to network',
      module: 'deep-learning',
      level: 'intermediate',
      minutes: 10,
      summary: 'A neuron, a layer, a forward pass — and why depth buys representational power.',
      why: 'Every architecture that follows, including transformers, is built from this one component. Understanding the forward pass makes the rest reading comprehension rather than memorisation.',
      prerequisites: ['vectors-and-matrices', 'calculus-and-gradients', 'ml-fundamentals'],
      outcomes: [
        'Compute a forward pass by hand for a small network',
        'Explain why a network without activations is just linear regression',
        'Count the parameters in a given architecture',
      ],
      tags: ['neural networks', 'perceptron', 'forward pass'],
      blocks: [
        {
          kind: 'text',
          body: 'A neuron takes a weighted sum of its inputs, adds a bias, and passes the result through a non-linear function. A layer is many neurons sharing the same inputs. A network is layers composed, each feeding the next.',
        },
        { kind: 'visual', id: 'perceptron', caption: 'One neuron: inputs, weights, bias, activation.' },
        {
          kind: 'math',
          expr: 'h = σ(W·x + b)',
          note: 'For a layer with 128 inputs and 64 units, W is 64x128 and b is 64 — 8,256 parameters.',
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Why the non-linearity is not optional',
          body: 'Compose two linear layers and you get another linear function — depth without activations adds parameters and no expressive power. The activation is what lets a network approximate curved decision boundaries.',
        },
        { kind: 'visual', id: 'neural-net', caption: 'A small network: hover a layer to see its shape and parameter count.' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A forward pass in plain NumPy',
          code: `import numpy as np

rng = np.random.default_rng(0)

x = rng.normal(size=(8, 4))            # batch of 8, four features
W1, b1 = rng.normal(size=(4, 16)) * 0.5, np.zeros(16)
W2, b2 = rng.normal(size=(16, 1)) * 0.5, np.zeros(1)


def relu(z):
    return np.maximum(0, z)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


hidden = relu(x @ W1 + b1)             # (8, 16)
logits = hidden @ W2 + b2              # (8, 1)
probs = sigmoid(logits)

print(hidden.shape, probs.round(3).ravel()[:4])`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'dl-1',
            prompt: 'A network has layers 784 → 128 → 10, all fully connected with biases. How many parameters?',
            options: ['101,770', '100,480', '8,970', '79,360'],
            answer: 0,
            explanation:
              '(784x128 + 128) + (128x10 + 10) = 100,480 + 1,290 = 101,770. Being able to do this arithmetic quickly is how you sanity-check a model’s memory footprint.',
          },
        },
      ],
      resources: [
        { label: '3Blue1Brown — Neural Networks', url: 'https://www.3blue1brown.com/topics/neural-networks', kind: 'video' },
        { label: 'PyTorch nn.Module guide', url: 'https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html', kind: 'docs' },
      ],
      related: ['activation-functions', 'backpropagation'],
    },
    {
      slug: 'activation-functions',
      title: 'Activation functions',
      module: 'deep-learning',
      level: 'intermediate',
      minutes: 7,
      summary: 'Sigmoid, tanh, ReLU, Leaky ReLU, GELU and softmax — what each does to the gradient.',
      why: 'Activation choice decides whether gradients survive the trip back through a deep network. It is the difference between a model that trains and one that stalls at random-guess accuracy.',
      prerequisites: ['neural-network-basics'],
      outcomes: [
        'Pick a hidden-layer activation with a reason',
        'Explain the vanishing gradient problem concretely',
        'Use softmax and sigmoid correctly at the output',
      ],
      tags: ['activations', 'relu', 'gelu', 'softmax'],
      blocks: [
        { kind: 'visual', id: 'activations', caption: 'Select a function to see its curve and its derivative.' },
        {
          kind: 'table',
          head: ['Function', 'Range', 'Problem', 'Use for'],
          rows: [
            ['Sigmoid', '(0, 1)', 'Saturates; gradient ≈ 0 at the tails', 'Binary output layer only'],
            ['Tanh', '(-1, 1)', 'Saturates, but zero-centred', 'Older RNNs; gates'],
            ['ReLU', '[0, ∞)', 'Dead units (gradient exactly 0 below zero)', 'Default hidden activation'],
            ['Leaky ReLU', '(-∞, ∞)', 'One more hyperparameter', 'When ReLU units die'],
            ['GELU', '(-∞, ∞)', 'Slightly costlier', 'Transformers — the modern default'],
            ['Softmax', '(0, 1), sums to 1', 'Not for hidden layers', 'Multi-class output layer'],
          ],
        },
        { kind: 'heading', text: 'Vanishing gradients, concretely' },
        {
          kind: 'text',
          body: 'The derivative of sigmoid peaks at 0.25. Backpropagation multiplies these derivatives layer by layer, so ten sigmoid layers scale the gradient by at most 0.25¹⁰ ≈ 0.000001. The early layers receive essentially nothing and stop learning. ReLU has derivative 1 for positive inputs, so the signal passes through undamped — which is the main reason deep networks became trainable.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Softmax with the numerical stability trick',
          code: `import numpy as np


def softmax(logits: np.ndarray) -> np.ndarray:
    # Subtracting the max changes nothing mathematically and prevents
    # exp() from overflowing on large logits.
    shifted = logits - logits.max(axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=-1, keepdims=True)


print(softmax(np.array([2.0, 1.0, 0.1])).round(3))   # [0.659 0.242 0.099]
print(softmax(np.array([1000.0, 999.0])).round(3))   # [0.731 0.269] — no overflow`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Do not apply softmax twice',
          body: 'PyTorch’s `CrossEntropyLoss` expects raw logits and applies log-softmax internally. Passing it softmax output is a common bug: training still runs, but converges slowly and to a worse model.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'act-1',
            prompt: 'Your deep network’s early layers barely change during training. Most likely cause?',
            options: [
              'Too much data',
              'Sigmoid activations in the hidden layers causing vanishing gradients',
              'The batch size is too large',
              'Missing bias terms',
            ],
            answer: 1,
            explanation:
              'Saturating activations multiply small derivatives across depth until nothing reaches the early layers. ReLU or GELU plus normalisation and residual connections is the standard remedy.',
          },
        },
      ],
      resources: [
        { label: 'PyTorch activation functions', url: 'https://docs.pytorch.org/docs/stable/nn.html#non-linear-activations-weighted-sum-nonlinearity', kind: 'docs' },
        { label: 'Gaussian Error Linear Units (GELU) paper', url: 'https://arxiv.org/abs/1606.08415', kind: 'paper' },
      ],
      related: ['backpropagation', 'transformer-architecture'],
    },
    {
      slug: 'backpropagation',
      title: 'Backpropagation',
      module: 'deep-learning',
      level: 'advanced',
      minutes: 9,
      summary: 'The chain rule applied backwards through a computation graph — how credit is assigned.',
      why: 'Backpropagation is the algorithm that makes training deep models feasible. Without it you are guessing at the cause of every training failure.',
      prerequisites: ['calculus-and-gradients', 'activation-functions'],
      outcomes: [
        'Explain the forward and backward pass as one graph traversal',
        'Derive the gradient for a two-layer network',
        'Diagnose exploding and vanishing gradients',
      ],
      tags: ['backpropagation', 'gradients', 'autograd'],
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Forward pass', body: 'Compute the prediction, caching every intermediate value. Those caches are what make backprop cheap — and what makes activations use memory.' },
            { title: 'Loss', body: 'Reduce prediction and target to a single number.' },
            { title: 'Backward pass', body: 'Walk the graph in reverse, multiplying local derivatives by the gradient flowing in — the chain rule, applied once per node.' },
            { title: 'Update', body: 'The optimiser steps each parameter against its gradient. Then zero the gradients, or the next batch adds to them.' },
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Manual backprop for one linear layer plus sigmoid and BCE loss',
          code: `import numpy as np

x = np.array([[1.0, 2.0]])      # one example, two features
y = np.array([[1.0]])
W = np.array([[0.3], [-0.1]])
b = np.array([[0.0]])

# Forward
z = x @ W + b
p = 1 / (1 + np.exp(-z))
loss = -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()

# Backward. For sigmoid + binary cross-entropy the two derivatives
# collapse into (p - y), which is why this pairing is standard.
dz = p - y                      # (1, 1)
dW = x.T @ dz                   # (2, 1)
db = dz

print(round(float(loss), 4), dW.ravel().round(4))   # 0.4741 [-0.3814 -0.7629]`,
        },
        { kind: 'heading', text: 'Two failure modes' },
        {
          kind: 'visual',
          id: 'backprop',
          caption: 'Forward to the loss, then the same graph in reverse.',
        },
        {
          kind: 'table',
          head: ['Symptom', 'Cause', 'Fix'],
          rows: [
            ['Loss stuck, early layers frozen', 'Vanishing gradients', 'ReLU/GELU, residual connections, normalisation, better init'],
            ['Loss spikes to NaN', 'Exploding gradients', 'Gradient clipping, lower learning rate, check for divide-by-zero'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Residual connections are a gradient highway',
          body: 'A skip connection `y = x + f(x)` gives the gradient a path that passes straight through, unmultiplied. That is why networks with hundreds of layers — and every transformer — train at all.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'bp-1',
            prompt: 'Why must gradients be zeroed between batches in PyTorch?',
            options: [
              'To free GPU memory',
              'Because `.backward()` accumulates into `.grad` rather than replacing it',
              'To reshuffle the data',
              'It is only needed with Adam',
            ],
            answer: 1,
            explanation:
              'Accumulation is deliberate — it enables gradient accumulation across micro-batches. Forgetting `optimizer.zero_grad()` silently sums gradients from every batch so far, and training degrades without an error.',
          },
        },
      ],
      resources: [
        { label: 'PyTorch autograd mechanics', url: 'https://docs.pytorch.org/docs/stable/notes/autograd.html', kind: 'docs' },
        { label: 'Karpathy — micrograd', url: 'https://github.com/karpathy/micrograd', kind: 'repo' },
      ],
      related: ['optimisers-and-schedules', 'neural-network-basics'],
    },
    {
      slug: 'optimisers-and-schedules',
      title: 'Optimisers, learning rates and batch size',
      module: 'deep-learning',
      level: 'intermediate',
      minutes: 9,
      summary: 'SGD, momentum, Adam and AdamW, plus the schedule and batch decisions around them.',
      why: 'These are the knobs you will actually turn. Learning rate is the single most important hyperparameter in deep learning, and batch size interacts with it directly.',
      prerequisites: ['backpropagation'],
      outcomes: [
        'Choose an optimiser and an initial learning rate sensibly',
        'Explain momentum and adaptive rates in one sentence each',
        'Reason about the batch-size/learning-rate relationship',
      ],
      tags: ['optimisers', 'adam', 'learning rate', 'batch size'],
      blocks: [
        {
          kind: 'table',
          head: ['Optimiser', 'Idea', 'In practice'],
          rows: [
            ['SGD', 'Step against the gradient', 'Needs tuning; can generalise best in vision'],
            ['SGD + momentum', 'Accumulate a velocity to smooth noise', 'Strong default for CNNs'],
            ['RMSProp', 'Per-parameter step scaled by recent gradient size', 'Largely superseded'],
            ['Adam', 'Momentum plus per-parameter scaling', 'Works out of the box; the usual first choice'],
            ['AdamW', 'Adam with decoupled weight decay', 'Standard for transformers'],
          ],
        },
        {
          kind: 'text',
          body: 'Reasonable starting points: **3e-4** for Adam on a network trained from scratch, **1e-5 to 5e-5** when fine-tuning a pretrained transformer, **0.1** for SGD with momentum on a CNN. Then move by factors of 3, not by 10%.',
        },
        { kind: 'heading', text: 'Schedules' },
        {
          kind: 'list',
          items: [
            '**Warmup** — ramp up over the first few hundred steps so early, unreliable gradients do not wreck the initialisation. Essential for transformers.',
            '**Cosine decay** — smoothly anneal to near zero. The common modern default.',
            '**Step decay** — cut by 10x at fixed milestones. Simple, still effective.',
            '**Reduce on plateau** — drop when validation stops improving. Good when you cannot predict the run length.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A standard PyTorch training loop',
          code: `import torch
from torch import nn

model = nn.Sequential(nn.Linear(20, 64), nn.GELU(), nn.Linear(64, 1))
optimiser = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimiser, T_max=epochs)
loss_fn = nn.BCEWithLogitsLoss()

for epoch in range(epochs):
    model.train()
    for xb, yb in train_loader:
        optimiser.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimiser.step()
    scheduler.step()`,
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Batch size and learning rate move together',
          body: 'A larger batch gives a less noisy gradient estimate, so it tolerates — and usually needs — a larger learning rate. The common heuristic is to scale the learning rate linearly with batch size, with warmup. Batch size is also a memory decision: gradient accumulation simulates a large batch on a small GPU.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'opt-1',
            prompt: 'You move from batch size 32 to 256 and training gets worse. Most likely fix?',
            options: [
              'Revert — large batches never work',
              'Raise the learning rate (roughly proportionally) and add warmup',
              'Add more layers',
              'Remove weight decay',
            ],
            answer: 1,
            explanation:
              'With 8x fewer updates per epoch at the same learning rate, the model travels a fraction of the distance. Scaling the rate up with a short warmup restores the effective progress per epoch.',
          },
        },
      ],
      resources: [
        { label: 'PyTorch optim documentation', url: 'https://docs.pytorch.org/docs/stable/optim.html', kind: 'docs' },
        { label: 'Decoupled Weight Decay Regularization (AdamW)', url: 'https://arxiv.org/abs/1711.05101', kind: 'paper' },
      ],
      related: ['regularising-deep-networks', 'calculus-and-gradients'],
    },
    {
      slug: 'regularising-deep-networks',
      title: 'Dropout, normalisation and early stopping',
      module: 'deep-learning',
      level: 'intermediate',
      minutes: 8,
      summary: 'The techniques that keep a high-capacity model from memorising its training set.',
      why: 'Deep networks have enough parameters to memorise the data outright. Regularisation is what converts that capacity into generalisation.',
      prerequisites: ['optimisers-and-schedules', 'overfitting-and-regularisation'],
      outcomes: [
        'Apply dropout in the right places, with the right rate',
        'Explain batch vs layer normalisation and where each belongs',
        'Set up early stopping against a validation metric',
      ],
      tags: ['dropout', 'batch norm', 'layer norm', 'regularisation'],
      blocks: [
        {
          kind: 'visual',
          id: 'training-curve',
          caption: 'Watch validation loss turn while training loss keeps falling.',
        },
        {
          kind: 'text',
          body: '**Dropout** zeroes a random fraction of activations during training, so no single unit can be relied on and the network is forced to spread its representation. It is disabled at inference — which is what `model.eval()` does, and forgetting it is a classic source of unstable predictions.',
        },
        {
          kind: 'table',
          head: ['Technique', 'What it does', 'Notes'],
          rows: [
            ['Dropout', 'Randomly zeroes activations', '0.1–0.3 typical; rarely used with batch norm in CNNs'],
            ['Batch normalisation', 'Normalises across the batch per feature', 'Batch-size dependent; standard in CNNs'],
            ['Layer normalisation', 'Normalises across features per example', 'Batch independent; standard in transformers'],
            ['Weight decay', 'Penalises large weights', 'Use AdamW so it is applied correctly'],
            ['Early stopping', 'Stops when validation stops improving', 'Cheapest regulariser there is'],
            ['Data augmentation', 'Expands the effective dataset', 'Often the highest-value option of all'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Early stopping with the best weights kept',
          code: `import copy

best_loss, best_state, patience, waited = float("inf"), None, 5, 0

for epoch in range(200):
    train_one_epoch(model, train_loader)
    val_loss = evaluate(model, val_loader)

    if val_loss < best_loss - 1e-4:
        best_loss, best_state, waited = val_loss, copy.deepcopy(model.state_dict()), 0
    else:
        waited += 1
        if waited >= patience:
            print(f"stopped at epoch {epoch}, best val loss {best_loss:.4f}")
            break

model.load_state_dict(best_state)`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'model.eval() and torch.no_grad()',
          body: 'The first switches dropout off and batch norm to running statistics; the second stops building a graph you will not use. Missing the first gives noisy, worse predictions. Missing the second just wastes memory.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'reg-2',
            prompt: 'Why do transformers use layer normalisation rather than batch normalisation?',
            options: [
              'It is faster to compute',
              'It normalises per example, so it is independent of batch size and works with variable-length sequences',
              'It needs fewer parameters',
              'Batch norm cannot run on GPUs',
            ],
            answer: 1,
            explanation:
              'Batch statistics are unreliable with small batches and awkward with padded, variable-length sequences. Layer norm normalises across the feature dimension of each token, so behaviour is identical at batch size 1 and 1,024.',
          },
        },
      ],
      resources: [
        { label: 'Dropout paper', url: 'https://jmlr.org/papers/v15/srivastava14a.html', kind: 'paper' },
        { label: 'Layer Normalization paper', url: 'https://arxiv.org/abs/1607.06450', kind: 'paper' },
      ],
      related: ['pytorch-and-frameworks', 'overfitting-and-regularisation'],
    },
    {
      slug: 'pytorch-and-frameworks',
      title: 'PyTorch, TensorFlow and the framework question',
      module: 'deep-learning',
      level: 'intermediate',
      minutes: 7,
      summary: 'What each framework is good at, and the parts of the ecosystem you will actually import.',
      why: 'Research and most open model releases are PyTorch; a large body of production systems is TensorFlow. Knowing the shape of both keeps you employable and lets you read any codebase.',
      prerequisites: ['neural-network-basics'],
      outcomes: [
        'Write a small model and training loop in PyTorch',
        'Explain eager vs graph execution',
        'Know which library to reach for beyond the core framework',
      ],
      tags: ['pytorch', 'tensorflow', 'keras', 'frameworks'],
      blocks: [
        {
          kind: 'table',
          head: ['', 'PyTorch', 'TensorFlow / Keras'],
          rows: [
            ['Style', 'Eager Python, define-by-run', 'Keras layers; graph via tf.function'],
            ['Debugging', 'Plain Python breakpoints', 'Harder inside compiled graphs'],
            ['Research share', 'Dominant', 'Smaller'],
            ['Mobile / edge', 'ExecuTorch, growing', 'TFLite, mature'],
            ['Serving', 'TorchServe, vLLM, custom', 'TF Serving, mature'],
            ['Learning curve', 'More explicit', 'Faster to a first model with Keras'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'The idiomatic PyTorch model',
          code: `import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset


class Classifier(nn.Module):
    def __init__(self, n_features: int, hidden: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_features, hidden),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(hidden, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)          # logits, not probabilities


device = "cuda" if torch.cuda.is_available() else "cpu"
model = Classifier(n_features=20).to(device)

loader = DataLoader(TensorDataset(X, y), batch_size=64, shuffle=True)`,
        },
        {
          kind: 'list',
          items: [
            '**Hugging Face Transformers** — pretrained models and tokenizers; the default entry point for anything language or vision-language.',
            '**Datasets** — streaming, memory-mapped dataset loading.',
            '**Accelerate / DeepSpeed** — multi-GPU and mixed-precision training without rewriting the loop.',
            '**PyTorch Lightning** — removes training-loop boilerplate; useful once the loop is a distraction rather than a lesson.',
            '**ONNX** — a portable exchange format when training and serving stacks differ.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'fw-1',
            prompt: 'A new research paper releases weights. Which framework will they almost certainly be in?',
            options: ['TensorFlow', 'PyTorch', 'JAX only', 'MXNet'],
            answer: 1,
            explanation:
              'PyTorch dominates published research and Hugging Face hosting. JAX appears in some large-lab work, and conversion paths exist, but PyTorch is the default assumption.',
          },
        },
      ],
      resources: [
        { label: 'PyTorch learn-the-basics tutorial', url: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html', kind: 'docs' },
        { label: 'Keras developer guides', url: 'https://keras.io/guides/', kind: 'docs' },
        { label: 'Hugging Face Transformers docs', url: 'https://huggingface.co/docs/transformers/index', kind: 'docs' },
      ],
      related: ['transfer-learning-and-vits', 'serving-and-inference'],
    },
  ],
};
