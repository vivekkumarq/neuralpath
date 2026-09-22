import { Module } from '../../core/models/content.models';

export const transformersModule: Module = {
  slug: 'transformers',
  title: 'Transformers',
  short: 'Transformers',
  stage: 8,
  level: 'advanced',
  tagline: 'Self-attention, multi-head attention, positional encoding and the full architecture.',
  description:
    'Every current language model, most new vision models and all the multimodal ones are ' +
    'transformers. This is the most load-bearing architecture in the field, and it is built from ' +
    'three ideas: attention, position, and a residual stack. Take this stage slowly.',
  topics: [
    {
      slug: 'self-attention',
      title: 'Self-attention: query, key, value',
      module: 'transformers',
      level: 'advanced',
      minutes: 12,
      summary: 'How every token decides which other tokens to read, and how much of each.',
      why: 'Attention is the mechanism that gives a model context-dependent representations. If you understand Q, K and V, the rest of the architecture is plumbing around them.',
      prerequisites: ['sequence-models', 'vectors-and-matrices'],
      outcomes: [
        'Explain query, key and value with a concrete analogy',
        'Walk through scaled dot-product attention step by step',
        'Say why the scores are divided by the square root of the dimension',
      ],
      tags: ['attention', 'self-attention', 'qkv'],
      blocks: [
        {
          kind: 'text',
          body: 'Each token produces three vectors by multiplying its embedding with three learned matrices. The **query** is what this token is looking for. The **key** is what each token offers. The **value** is what it passes on if selected. Matching a query against all keys gives a relevance score per token; softmax turns those scores into weights; the output is the weighted sum of values.',
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'The retrieval analogy',
          body: 'Query is your search box. Keys are document titles. Values are document contents. Attention is soft retrieval: instead of picking one result, you blend all of them in proportion to how well each title matches.',
        },
        {
          kind: 'math',
          expr: 'Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V',
        },
        {
          kind: 'steps',
          items: [
            { title: 'Project', body: 'X (n x d) is multiplied by W_Q, W_K, W_V to give Q, K, V, each (n x d_k).' },
            { title: 'Score', body: 'Q·Kᵀ gives an n x n matrix — how much each token should attend to each other token.' },
            { title: 'Scale', body: 'Divide by √d_k. Without this, dot products of high-dimensional vectors grow large, softmax saturates, and gradients vanish.' },
            { title: 'Mask (decoder only)', body: 'Set future positions to −∞ so a token cannot read ahead of itself.' },
            { title: 'Normalise', body: 'Softmax each row into weights summing to 1.' },
            { title: 'Mix', body: 'Multiply by V to get a new representation of each token, informed by the whole sequence.' },
          ],
        },
        { kind: 'visual', id: 'attention', caption: 'Pick a token to see what it attends to, and how strongly.' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Scaled dot-product attention in fifteen lines',
          code: `import numpy as np


def softmax(z: np.ndarray) -> np.ndarray:
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)


def attention(Q, K, V, causal=False):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)             # (n, n)

    if causal:
        mask = np.triu(np.ones_like(scores), k=1).astype(bool)
        scores = np.where(mask, -np.inf, scores)

    weights = softmax(scores)
    return weights @ V, weights


rng = np.random.default_rng(0)
X = rng.normal(size=(4, 8))                      # 4 tokens, 8 dims
out, w = attention(X, X, X, causal=True)

print(w.round(2))
# row 0 attends only to itself; row 3 can attend to all four.`,
        },
        {
          kind: 'text',
          body: 'The n x n score matrix is the source of the quadratic cost: doubling the sequence length quadruples the attention computation and memory. Every long-context technique — sliding windows, sparse patterns, FlashAttention, linear attention — is an attack on this one term.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'attn-1',
            prompt: 'Why divide the attention scores by √d_k?',
            options: [
              'To normalise the output to unit length',
              'Dot products grow with dimension; without scaling, softmax saturates and gradients vanish',
              'To save memory',
              'To make attention causal',
            ],
            answer: 1,
            explanation:
              'With d_k = 64, random dot products have standard deviation around 8. Softmax over values that large is nearly one-hot, so almost no gradient flows. Scaling keeps the distribution usable.',
          },
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'attn-2',
            prompt: 'What does masked (causal) attention prevent?',
            options: [
              'Attending to padding tokens',
              'A token attending to positions after it, which would leak the answer during next-token training',
              'Overfitting',
              'Attention to itself',
            ],
            answer: 1,
            explanation:
              'Decoder-only models are trained to predict the next token. Without the mask, position t could simply read position t+1 and the task would be trivial and useless.',
          },
        },
      ],
      resources: [
        { label: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', kind: 'paper' },
        { label: 'The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', kind: 'docs' },
      ],
      related: ['multi-head-and-position', 'transformer-architecture'],
    },
    {
      slug: 'multi-head-and-position',
      title: 'Multi-head attention and positional encoding',
      module: 'transformers',
      level: 'advanced',
      minutes: 9,
      summary: 'Why one attention pattern is not enough, and how a permutation-invariant model learns word order.',
      why: 'These are the two additions that turn bare attention into a usable layer. Both are standard interview questions and both explain real model behaviour.',
      prerequisites: ['self-attention'],
      outcomes: [
        'Explain what separate heads specialise in',
        'Compute the per-head dimension for a given model size',
        'Compare sinusoidal, learned and rotary position encodings',
      ],
      tags: ['multi-head', 'positional encoding', 'rope'],
      blocks: [
        {
          kind: 'text',
          body: 'One attention pattern must compromise between every kind of relationship in a sentence: syntax, coreference, adjacency, topic. Multi-head attention runs several attention operations in parallel on lower-dimensional projections, then concatenates them. Heads demonstrably specialise — some track the previous token, some link pronouns to their referents, some follow syntactic dependencies.',
        },
        {
          kind: 'math',
          expr: 'd_head = d_model / n_heads',
          note: 'A 768-dimensional model with 12 heads gives 64 dimensions per head — so total compute is roughly unchanged versus a single 768-dimensional head.',
        },
        { kind: 'heading', text: 'Position' },
        {
          kind: 'text',
          body: 'Attention is a weighted sum over a set; shuffle the tokens and the outputs shuffle with them. Nothing in the mechanism knows about order, so position must be injected explicitly.',
        },
        {
          kind: 'table',
          head: ['Scheme', 'How', 'Trade-off'],
          rows: [
            ['Sinusoidal', 'Fixed sine/cosine of varying frequency added to embeddings', 'No parameters; extrapolates weakly'],
            ['Learned absolute', 'A trainable vector per position', 'Simple; cannot exceed trained length'],
            ['Relative', 'Bias added to attention scores by distance', 'Generalises better across lengths'],
            ['RoPE (rotary)', 'Rotates Q and K by an angle set by position', 'Current standard; extends with interpolation'],
            ['ALiBi', 'Linear distance penalty on scores', 'Cheap, strong length extrapolation'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Why context extension is not just a config change',
          body: 'A model’s position encoding was trained over a specific range. Feeding it far longer inputs puts it in territory it has never seen, which is why long-context variants need RoPE scaling or continued training rather than a larger number in a config file.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'mh-1',
            prompt: 'A model has d_model 1024 and 16 heads. Dimension per head?',
            options: ['1024', '64', '16', '256'],
            answer: 1,
            explanation: '1024 / 16 = 64. Heads split the model dimension rather than each taking the full width.',
          },
        },
      ],
      resources: [
        { label: 'RoFormer: Rotary Position Embedding', url: 'https://arxiv.org/abs/2104.09864', kind: 'paper' },
        { label: 'A Visual Guide to Attention (Hugging Face blog)', url: 'https://huggingface.co/blog', kind: 'docs' },
      ],
      related: ['transformer-architecture', 'tokens-and-context'],
    },
    {
      slug: 'transformer-architecture',
      title: 'The full transformer block',
      module: 'transformers',
      level: 'advanced',
      minutes: 10,
      summary: 'Attention plus feed-forward, residuals, normalisation — and the encoder/decoder family split.',
      why: 'Model names stop being a jumble once you can place them in the encoder-only, decoder-only or encoder-decoder families, because the family determines what a model is good for.',
      prerequisites: ['multi-head-and-position'],
      outcomes: [
        'Draw a transformer block from memory',
        'Explain the role of the feed-forward sub-layer',
        'Place BERT, GPT-style and T5-style models in their families',
      ],
      tags: ['transformer', 'bert', 'gpt', 'architecture'],
      blocks: [
        { kind: 'visual', id: 'transformer', caption: 'One block, sub-layer by sub-layer.' },
        {
          kind: 'list',
          items: [
            '**Multi-head self-attention** — mixes information between tokens.',
            '**Feed-forward network** — a two-layer MLP applied to each token independently, usually 4x the model width. This is where most parameters live and, evidence suggests, much of the stored knowledge.',
            '**Residual connections** — around each sub-layer, keeping a clean gradient path.',
            '**Layer normalisation** — stabilises activations. Modern models apply it before each sub-layer (pre-norm), which trains more reliably at depth.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A pre-norm transformer block',
          code: `import torch
from torch import nn


class Block(nn.Module):
    def __init__(self, d_model: int = 512, n_heads: int = 8, mult: int = 4, p: float = 0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.attn = nn.MultiheadAttention(d_model, n_heads, dropout=p, batch_first=True)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * mult),
            nn.GELU(),
            nn.Linear(d_model * mult, d_model),
            nn.Dropout(p),
        )

    def forward(self, x: torch.Tensor, mask: torch.Tensor | None = None) -> torch.Tensor:
        h = self.norm1(x)
        attended, _ = self.attn(h, h, h, attn_mask=mask, need_weights=False)
        x = x + attended                      # residual
        return x + self.ffn(self.norm2(x))    # residual`,
        },
        {
          kind: 'table',
          head: ['Family', 'Attention', 'Trained to', 'Good at', 'Examples'],
          rows: [
            ['Encoder-only', 'Bidirectional', 'Fill in masked tokens', 'Classification, embeddings, extraction', 'BERT, RoBERTa, DeBERTa'],
            ['Decoder-only', 'Causal', 'Predict the next token', 'Generation, chat, reasoning, tool use', 'The current generation of LLMs'],
            ['Encoder-decoder', 'Both', 'Map sequence to sequence', 'Translation, summarisation', 'T5, BART, FLAN-T5'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Why decoder-only won for general models',
          body: 'Next-token prediction on raw text needs no labels, so it scales to the entire web, and every task can be phrased as text continuation. That combination of unlimited training signal and universal interface is what made general-purpose assistants possible.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'tf-1',
            prompt: 'You need sentence embeddings for semantic search. Which family fits best?',
            options: [
              'Decoder-only',
              'Encoder-only (or a sentence-embedding model built on one)',
              'Encoder-decoder',
              'Any, they are equivalent',
            ],
            answer: 1,
            explanation:
              'Bidirectional encoders see the whole sentence at every position, which suits producing one fixed representation. Embedding models are typically encoders fine-tuned with a contrastive objective.',
          },
        },
      ],
      resources: [
        { label: 'The Annotated Transformer (Harvard NLP)', url: 'https://nlp.seas.harvard.edu/annotated-transformer/', kind: 'docs' },
        { label: 'BERT paper', url: 'https://arxiv.org/abs/1810.04805', kind: 'paper' },
        { label: 'Hugging Face model architectures', url: 'https://huggingface.co/docs/transformers/model_summary', kind: 'docs' },
      ],
      related: ['foundation-models', 'tokens-and-context'],
    },
  ],
};
