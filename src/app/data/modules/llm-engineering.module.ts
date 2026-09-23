import { Module } from '../../core/models/content.models';

export const llmEngineeringModule: Module = {
  slug: 'llm-engineering',
  title: 'LLM Engineering',
  short: 'LLM',
  stage: 10,
  level: 'advanced',
  tagline: 'Tokens, context, sampling parameters, embeddings and prompt infrastructure.',
  description:
    'LLM engineering is the discipline of building dependable systems on top of a stochastic ' +
    'component. That means knowing exactly what a token is, what each sampling parameter does to ' +
    'the output distribution, how embeddings turn text into geometry, and how to manage prompts ' +
    'like the production assets they are.',
  topics: [
    {
      slug: 'tokens-and-context',
      title: 'Tokens, context windows and cost',
      module: 'llm-engineering',
      level: 'intermediate',
      minutes: 9,
      summary: 'The unit of computation and billing, and how the context window is actually spent.',
      why: 'Tokens are the currency of the entire LLM stack: latency, price and the hard limit on how much the model can see are all measured in them.',
      prerequisites: ['text-preprocessing', 'transformer-architecture'],
      outcomes: [
        'Estimate token counts for a given input',
        'Budget a context window across system prompt, history and retrieval',
        'Explain why long context is not free even when it fits',
      ],
      tags: ['tokens', 'context window', 'cost'],
      blocks: [
        {
          kind: 'text',
          body: 'A token is a subword piece. For ordinary English, roughly **0.75 words per token** — about four characters. Code, JSON, non-Latin scripts and rare names consume considerably more tokens per character, which is why a payload that looks small can be expensive.',
        },
        { kind: 'visual', id: 'tokenizer', caption: 'Tokenise some text and see the count.' },
        {
          kind: 'table',
          head: ['Context consumer', 'Typical share', 'How to reduce it'],
          rows: [
            ['System prompt', 'Fixed, every call', 'Trim once, carefully; cache it if the provider supports it'],
            ['Conversation history', 'Grows without limit', 'Window it, or summarise older turns'],
            ['Retrieved context', 'Largest variable part', 'Rerank and keep the top few chunks, not the top twenty'],
            ['Tool definitions', 'Fixed per call', 'Register only the tools relevant to the current step'],
            ['Output', 'Reserved, not optional', 'Set max tokens deliberately; leave room or generation truncates'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: '"It fits in the window" is not a design',
          body: 'Cost is roughly linear in input tokens and attention cost is quadratic in sequence length, so a 100k-token prompt is slow and expensive on every call. Retrieval quality beats context quantity: relevance in the first few thousand tokens outperforms everything dumped in.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Budgeting a request before sending it',
          code: `MAX_CONTEXT = 128_000
RESERVED_OUTPUT = 2_000


def build_messages(system: str, history: list[dict], chunks: list[str]) -> list[dict]:
    budget = MAX_CONTEXT - RESERVED_OUTPUT - count_tokens(system)

    # History is trimmed from the oldest end; retrieval keeps the best chunks.
    kept_history, used = [], 0
    for message in reversed(history):
        size = count_tokens(message["content"])
        if used + size > budget * 0.3:
            break
        kept_history.insert(0, message)
        used += size

    context, ctx_used = [], 0
    for chunk in chunks:                       # already sorted by relevance
        size = count_tokens(chunk)
        if ctx_used + size > budget - used:
            break
        context.append(chunk)
        ctx_used += size

    return [{"role": "system", "content": system}, *kept_history,
            {"role": "user", "content": "\\n\\n".join(context)}]`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'tok-1',
            prompt: 'Roughly how many tokens is a 4,000-word English document?',
            options: ['About 1,000', 'About 5,300', 'About 40,000', 'About 400'],
            answer: 1,
            explanation:
              '4,000 words / 0.75 ≈ 5,333 tokens. Useful as a mental check when deciding whether a document needs chunking.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic: context windows', url: 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows', kind: 'docs' },
        { label: 'tiktoken (BPE tokenizer)', url: 'https://github.com/openai/tiktoken', kind: 'repo' },
      ],
      related: ['llm-apis-and-parameters', 'chunking-strategies'],
    },
    {
      slug: 'llm-apis-and-parameters',
      title: 'Inference parameters: temperature, top-k, top-p',
      module: 'llm-engineering',
      level: 'intermediate',
      minutes: 8,
      summary: 'How sampling turns a probability distribution into text, and which dial to turn.',
      why: 'These parameters control the determinism of your system. Getting them wrong produces either robotic repetition or unusable variance, and the defaults are rarely right for a specific task.',
      prerequisites: ['tokens-and-context'],
      outcomes: [
        'Explain what temperature does to the distribution',
        'Choose between top-k and top-p and set a sensible value',
        'Pick parameters appropriate to the task',
      ],
      tags: ['temperature', 'sampling', 'top-p', 'inference'],
      blocks: [
        {
          kind: 'text',
          body: 'At each step the model produces a probability for every token in its vocabulary. Sampling parameters reshape that distribution before one token is drawn.',
        },
        { kind: 'visual', id: 'sampling', caption: 'Move temperature and top-p and watch the distribution change.' },
        {
          kind: 'table',
          head: ['Parameter', 'Effect', 'Typical'],
          rows: [
            ['Temperature', 'Divides the logits — low sharpens towards the top token, high flattens', '0 for extraction, 0.7 for prose'],
            ['Top-k', 'Keeps only the k most likely tokens', '20–50, or unused'],
            ['Top-p (nucleus)', 'Keeps the smallest set whose probabilities sum to p', '0.9–0.95'],
            ['Frequency / presence penalty', 'Discourages repeating tokens already produced', 'Small, for long generation'],
            ['Max tokens', 'Hard cap on output length', 'Always set it'],
            ['Stop sequences', 'Ends generation at a marker', 'Useful for structured output'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Adjust one, not both',
          body: 'Temperature and top-p both control randomness and interact confusingly. The usual practice is to fix top-p around 0.95 and tune temperature — or set temperature to 0 when you want the most deterministic behaviour available.',
        },
        {
          kind: 'table',
          head: ['Task', 'Temperature', 'Why'],
          rows: [
            ['Classification, extraction, routing', '0', 'One correct answer; variance is pure risk'],
            ['Code generation', '0–0.2', 'Slight variety helps, incorrectness does not'],
            ['Summarisation', '0.3', 'Mild phrasing freedom'],
            ['Chat and explanation', '0.7', 'Natural, non-repetitive prose'],
            ['Brainstorming, creative drafts', '0.9–1.0', 'Diversity is the point'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Temperature 0 is not a guarantee of identical output',
          body: 'Batching, hardware and floating-point non-determinism can still change a token, and that one token can change everything after it. If you need exact reproducibility, cache the response rather than assuming the model will repeat itself.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'samp-1',
            prompt: 'An invoice extraction service returns slightly different field values on identical documents. First fix?',
            options: [
              'Raise the temperature for more variety',
              'Set temperature to 0 and constrain the output to a schema',
              'Use a larger model',
              'Increase max tokens',
            ],
            answer: 1,
            explanation:
              'Extraction has one right answer. Sampling randomness is only a liability, and schema-constrained decoding removes the remaining format variance.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic Messages API reference', url: 'https://docs.anthropic.com/en/api/messages', kind: 'docs' },
        { label: 'The Curious Case of Neural Text Degeneration (top-p)', url: 'https://arxiv.org/abs/1904.09751', kind: 'paper' },
      ],
      related: ['prompt-engineering', 'latency-throughput-and-cost'],
    },
    {
      slug: 'embeddings-explained',
      title: 'Embeddings: text as geometry',
      module: 'llm-engineering',
      level: 'intermediate',
      minutes: 10,
      summary: 'Text → vector → similarity search, and the decisions that determine retrieval quality.',
      why: 'Embeddings are the bridge between language and search. Every RAG system, semantic search feature, deduplication job and clustering of user feedback runs on them.',
      prerequisites: ['word-embeddings', 'vectors-and-matrices'],
      outcomes: [
        'Explain what an embedding model produces and how to compare two vectors',
        'Choose an embedding model on the axes that matter',
        'Avoid the three most common embedding mistakes',
      ],
      tags: ['embeddings', 'cosine similarity', 'retrieval'],
      blocks: [
        {
          kind: 'text',
          body: 'An embedding model maps a piece of text to a fixed-length vector — commonly 384 to 3,072 dimensions — positioned so that semantically similar texts are close together. Unlike Word2Vec, the vector depends on the whole input, so "bank" in two different sentences lands in two different places.',
        },
        { kind: 'visual', id: 'embeddings', caption: 'Query this projected space and see the nearest neighbours.' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Semantic search over a handful of documents',
          code: `import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")   # 384 dimensions

docs = [
    "Reset a forgotten password from the account settings page.",
    "Refunds are processed within five business days.",
    "Two-factor authentication can be enabled in security settings.",
]

# normalize_embeddings makes the dot product equal to cosine similarity.
doc_vecs = model.encode(docs, normalize_embeddings=True)
query_vec = model.encode("I cannot log in", normalize_embeddings=True)

scores = doc_vecs @ query_vec
for rank in np.argsort(scores)[::-1]:
    print(f"{scores[rank]:.3f}  {docs[rank]}")

# 0.421  Reset a forgotten password from the account settings page.
# 0.318  Two-factor authentication can be enabled in security settings.
# 0.061  Refunds are processed within five business days.`,
        },
        {
          kind: 'table',
          head: ['Choice', 'What to weigh'],
          rows: [
            ['Dimensions', 'Higher can be more expressive but costs storage and search time; 384–1024 covers most needs'],
            ['Max input length', 'Text beyond the limit is truncated silently — match it to your chunk size'],
            ['Domain', 'General models handle general text; code, legal and biomedical benefit from specialised ones'],
            ['Multilingual', 'Needed if queries and documents are in different languages'],
            ['Hosted vs local', 'Hosted is simpler; local removes per-call cost and keeps data in your network'],
            ['Asymmetric support', 'Some models embed short queries and long passages differently, which improves retrieval'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Three mistakes that quietly ruin retrieval',
          body: 'Embedding queries with one model and documents with another — the spaces are unrelated. Changing the embedding model without re-indexing everything. Silently truncating chunks longer than the model’s input limit, so the tail of every chunk is invisible to search.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'emb-1',
            prompt: 'You upgrade your embedding model. What must happen to the existing index?',
            options: [
              'Nothing, vectors are compatible',
              'Every document must be re-embedded and re-indexed',
              'Only new documents use the new model',
              'Re-embed the queries only',
            ],
            answer: 1,
            explanation:
              'Each model defines its own space. Comparing a new query vector against old document vectors produces meaningless distances, so a model change is a full re-index.',
          },
        },
      ],
      resources: [
        { label: 'Sentence Transformers documentation', url: 'https://sbert.net/', kind: 'docs' },
        { label: 'MTEB embedding benchmark leaderboard', url: 'https://huggingface.co/spaces/mteb/leaderboard', kind: 'tool' },
      ],
      related: ['vector-search-and-hybrid', 'rag-pipeline'],
    },
    {
      slug: 'prompt-infrastructure',
      title: 'Prompt infrastructure: templates, versions and caching',
      module: 'llm-engineering',
      level: 'advanced',
      minutes: 8,
      summary: 'Treating prompts as versioned artefacts with tests, and exploiting prefix caching.',
      why: 'The gap between a prototype and a product is largely operational: where prompts live, how they are changed safely, and how repeated prefixes are paid for once instead of every call.',
      prerequisites: ['prompt-engineering', 'llm-apis-and-parameters'],
      outcomes: [
        'Store prompts as versioned templates outside application logic',
        'Structure requests so a cached prefix is reused',
        'Roll a prompt change out without a blind deploy',
      ],
      tags: ['prompts', 'templates', 'caching', 'versioning'],
      blocks: [
        {
          kind: 'code',
          lang: 'python',
          caption: 'A registry, so a prompt change is a reviewable diff',
          code: `from dataclasses import dataclass
from string import Template


@dataclass(frozen=True)
class PromptSpec:
    name: str
    version: str
    template: Template
    temperature: float

    def render(self, **kwargs: str) -> str:
        return self.template.substitute(**kwargs)


REGISTRY = {
    "support.answer": PromptSpec(
        name="support.answer",
        version="2026-09-14",
        template=Template(
            "Answer using only the context below. If it is not there, say NOT_IN_DOCS.\\n\\n"
            "Context:\\n$context\\n\\nQuestion: $question"
        ),
        temperature=0.0,
    ),
}

spec = REGISTRY["support.answer"]
# Log name + version with every call, so a bad output traces to an exact prompt.`,
        },
        { kind: 'heading', text: 'Prefix caching' },
        {
          kind: 'text',
          body: 'Providers can cache the processed prefix of a prompt, so repeated system instructions, tool definitions and few-shot examples are not recomputed on every request. That means **ordering matters**: put everything stable first and everything per-request last. Getting this right can cut both cost and time-to-first-token substantially on high-volume endpoints.',
        },
        {
          kind: 'list',
          items: [
            '**Stable prefix** — system prompt, tool definitions, few-shot examples, long reference documents.',
            '**Then** — conversation history, oldest to newest.',
            '**Last** — the retrieved context and the current question.',
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Ship prompt changes like code changes',
          body: 'Run the evaluation suite, deploy to a fraction of traffic, compare the metrics you defined, then roll forward. A prompt edit can change behaviour more than a model swap, and it is far easier to do accidentally.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'pi-1',
            prompt: 'Why put retrieved context at the end of the prompt rather than the beginning?',
            options: [
              'Models read backwards',
              'It keeps the stable prefix cacheable, since the retrieved part changes every request',
              'It reduces hallucination',
              'It lowers the token count',
            ],
            answer: 1,
            explanation:
              'Prefix caching only helps up to the first byte that differs. Per-request content at the front invalidates the cache for the entire prompt.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic prompt caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', kind: 'docs' },
        { label: 'Jinja2 templating', url: 'https://jinja.palletsprojects.com/', kind: 'docs' },
      ],
      related: ['latency-throughput-and-cost', 'observability-and-evals'],
    },
    {
      slug: 'hugging-face-ecosystem',
      title: 'Hugging Face and running open models',
      module: 'llm-engineering',
      level: 'intermediate',
      minutes: 9,
      summary:
        'Pipelines, tokenizers and AutoModel, the model hub, and what changes when the model runs on your own hardware.',
      why: 'Open weights are the alternative to a metered API: no per-token cost, no data leaving your network, and full control of the version. The price is that serving, memory and throughput become your problem — and Hugging Face is where almost all of it starts.',
      prerequisites: ['pytorch-and-frameworks', 'tokens-and-context'],
      outcomes: [
        'Run a model three ways: pipeline, AutoModel, and a local server',
        'Read a model card and judge whether a model fits your constraints',
        'Estimate the memory a given model needs before downloading it',
      ],
      tags: ['hugging face', 'transformers', 'ollama', 'open models'],
      blocks: [
        {
          kind: 'text',
          body: 'The library has three levels, and picking the right one saves a lot of code. **`pipeline`** is one line for a standard task. **`AutoTokenizer` + `AutoModel`** gives you the tensors when you need control. A **served endpoint** (vLLM, TGI, Ollama) is what you use when the model has to answer many requests rather than run in a script.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'The same model, three levels of control',
          code: `from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

# 1. Pipeline — tokenisation, batching and decoding handled for you.
classify = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
print(classify("The migration finished three days early."))
# [{'label': 'POSITIVE', 'score': 0.9998}]

# 2. Tokenizer + model — when you need logits, embeddings or custom batching.
name = "distilbert-base-uncased-finetuned-sst-2-english"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name)

batch = tok(["ships on time", "broke immediately"], padding=True, return_tensors="pt")
logits = model(**batch).logits          # (2, 2) — raw scores, not probabilities
print(logits.softmax(-1).round(decimals=3))`,
        },
        {
          kind: 'code',
          lang: 'bash',
          caption: '3. A local server, for anything that serves traffic',
          code: `# Ollama: simplest path to a local chat model
ollama pull llama3.2
ollama run llama3.2 "Summarise this changelog in three bullets"

# vLLM: an OpenAI-compatible endpoint with continuous batching
vllm serve meta-llama/Llama-3.1-8B-Instruct --max-model-len 8192

curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "meta-llama/Llama-3.1-8B-Instruct",
       "messages": [{"role": "user", "content": "hello"}]}'`,
        },
        { kind: 'heading', text: 'Will it fit?' },
        {
          kind: 'table',
          head: ['Precision', 'Bytes per parameter', '7B model', '70B model'],
          rows: [
            ['fp32', '4', '~28 GB', '~280 GB'],
            ['fp16 / bf16', '2', '~14 GB', '~140 GB'],
            ['8-bit', '1', '~7 GB', '~70 GB'],
            ['4-bit', '0.5', '~3.5 GB', '~35 GB'],
          ],
          caption: 'Weights only. Add the KV cache, which grows with context length and concurrency, and headroom for activations.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Read the model card before the benchmark table',
          body: 'The card carries the licence, the training data description, the intended use and the known limitations. A model that benchmarks well and forbids commercial use is not a candidate, and finding that out after integration is an expensive way to learn it.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'A downloaded model is executable content',
          body: 'Prefer `safetensors` over pickle-based checkpoints, which can run arbitrary code on load. Pin revisions rather than tracking `main`, so a model you audited is the model you serve.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'hf-1',
            prompt: 'You have a 24 GB GPU and want to serve a 70B model. What is the realistic option?',
            options: [
              'Load it in fp16',
              'Quantise to 4-bit and accept a quality trade-off, or use a smaller model',
              'Increase the batch size',
              'Use a longer context window',
            ],
            answer: 1,
            explanation:
              '70B at fp16 needs roughly 140 GB for weights alone. Even at 4-bit it is about 35 GB, still beyond one 24 GB card — so it is multi-GPU, a smaller model, or a hosted API.',
          },
        },
      ],
      resources: [
        { label: 'Hugging Face Transformers documentation', url: 'https://huggingface.co/docs/transformers/index', kind: 'docs' },
        { label: 'Ollama', url: 'https://ollama.com/', kind: 'tool' },
        { label: 'safetensors', url: 'https://huggingface.co/docs/safetensors/index', kind: 'docs' },
      ],
      related: ['model-selection-and-cost', 'serving-and-inference'],
    },
    {
      slug: 'model-selection-and-cost',
      title: 'Choosing a model: quality, latency and cost',
      module: 'llm-engineering',
      level: 'advanced',
      minutes: 8,
      summary:
        'Frontier against open weights, benchmarks against your own evaluation, and the arithmetic that decides.',
      why: 'Model choice is the single biggest lever on both quality and the bill, and it is usually made on a leaderboard screenshot. The decision is a measurement on your own task, against your own latency and cost budget.',
      prerequisites: ['genai-evaluation', 'llm-apis-and-parameters'],
      outcomes: [
        'Run a fair bake-off between candidate models',
        'Read a public benchmark without over-trusting it',
        'Compute the break-even point between a hosted API and self-hosting',
      ],
      tags: ['model selection', 'benchmarks', 'cost', 'routing'],
      blocks: [
        {
          kind: 'table',
          head: ['', 'Frontier API', 'Open weights, hosted', 'Open weights, self-hosted'],
          rows: [
            ['Quality ceiling', 'Highest today', 'Close on many tasks', 'Same as hosted, your tuning'],
            ['Cost shape', 'Per token', 'Per token, usually lower', 'Per GPU-hour, busy or idle'],
            ['Data path', 'Leaves your network', 'Leaves your network', 'Stays inside it'],
            ['Version control', "Provider's schedule", 'You pin it', 'You pin it'],
            ['Fine-tuning', 'Limited, provider-specific', 'Full', 'Full'],
            ['Operational load', 'None', 'Low', 'Real — GPUs, upgrades, scaling'],
          ],
        },
        { kind: 'heading', text: 'Benchmarks are a filter, not a decision' },
        {
          kind: 'list',
          items: [
            '**Contamination** — public benchmark items leak into training data, so scores drift upward without capability changing.',
            '**Distribution** — a model strong on competition mathematics may be mediocre at your extraction schema.',
            '**Aggregation** — a single headline number hides the subtask you actually care about.',
            '**Use them to shortlist** three candidates, then decide on your own eval set. That set is the deliverable; the leaderboard is a hint.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A bake-off that produces a decision table',
          code: `import time

CANDIDATES = ["small-fast", "large-capable", "open-8b-local"]

def bake_off(cases):
    for model in CANDIDATES:
        scores, latencies, tokens = [], [], 0

        for case in cases:
            started = time.perf_counter()
            reply = call(model, case.prompt)
            latencies.append(time.perf_counter() - started)
            tokens += reply.usage.total
            scores.append(grade(reply.text, case))   # your rubric, not a vibe

        latencies.sort()
        print(f"{model:>14}  quality {sum(scores)/len(scores):.3f}"
              f"  p95 {latencies[int(len(latencies) * 0.95)]:.2f}s"
              f"  cost/1k {price(model, tokens) / len(cases) * 1000:.2f}")`,
        },
        {
          kind: 'math',
          expr: 'break-even monthly tokens ≈ (GPU hours × hourly rate) / API price per token',
          note: 'Include engineering time and on-call in the GPU side. Self-hosting usually wins on steady high volume and loses on spiky low volume.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Route rather than choose',
          body: 'Most products do not need one model. Classification, routing and extraction go to a small fast model; analysis and generation go to a capable one. That split is typically a larger saving than any provider negotiation, and it needs the same eval set to keep honest.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'sel-1',
            prompt: 'A model tops the leaderboard but scores worse than a smaller one on your 40-case eval set. What do you ship?',
            options: [
              'The leaderboard leader — the benchmark covers more ground',
              'The one that wins on your eval set, because it measures your actual task',
              'Both, alternating',
              'Neither; wait for the next release',
            ],
            answer: 1,
            explanation:
              'A benchmark measures an average over tasks that are not yours. Your eval set is the only measurement of the job you are paying the model to do.',
          },
        },
      ],
      resources: [
        { label: 'Hugging Face open LLM leaderboards', url: 'https://huggingface.co/open-llm-leaderboard', kind: 'tool' },
        { label: 'LMSYS Chatbot Arena', url: 'https://lmarena.ai/', kind: 'tool' },
        { label: 'Anthropic model overview', url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', kind: 'docs' },
      ],
      related: ['latency-throughput-and-cost', 'genai-evaluation'],
    },
  ],
};
