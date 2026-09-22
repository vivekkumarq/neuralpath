import { InterviewQuestion } from '../../core/models/content.models';

/** NLP, transformers, LLMs, RAG and fine-tuning. */
export const llmQuestions: InterviewQuestion[] = [
  {
    id: 'nlp-tfidf',
    question: 'What does the IDF term in TF-IDF do?',
    category: 'NLP',
    difficulty: 'beginner',
    kind: 'mathematical',
    answer:
      'It down-weights terms that appear in many documents and up-weights rare ones, so a word that occurs everywhere contributes almost nothing to the representation.',
    followUps: ['What does BM25 add on top?', 'Why is TF-IDF still used alongside embeddings?'],
  },
  {
    id: 'nlp-subword',
    question: 'Why do LLMs use subword tokenisation rather than words?',
    category: 'NLP',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'A word vocabulary is huge and still hits unknown tokens; characters make sequences too long. Subwords give a bounded vocabulary with complete coverage — any string decomposes into known pieces.',
    followUps: ['Roughly how many tokens per English word?', 'Why is code more token-expensive than prose?'],
  },
  {
    id: 'nlp-word2vec-limit',
    question: 'What limitation of Word2Vec did contextual models fix?',
    category: 'NLP',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'One static vector per word, so "bank" in "river bank" and "savings bank" share a representation. Contextual models compute a different vector per occurrence based on the surrounding tokens.',
    followUps: ['How does attention produce that context?', 'Are static embeddings ever still useful?'],
  },
  {
    id: 'nlp-rnn-limits',
    question: 'What two limitations of RNNs did transformers remove?',
    category: 'NLP',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Sequential computation, which prevented parallelism across the sequence; and the fixed-size hidden-state bottleneck, which lost detail on long inputs. Self-attention gives every position direct access to every other in one parallel operation.',
    followUps: ['What did transformers pay for this?', 'What does the quadratic cost apply to?'],
  },
  {
    id: 'tf-attention-formula',
    question: 'Write down scaled dot-product attention and explain each term.',
    category: 'Transformers',
    difficulty: 'advanced',
    kind: 'mathematical',
    answer:
      'softmax(Q·Kᵀ / √d_k)·V. Q is what each token is looking for, K what each token offers, Q·Kᵀ the relevance of every pair, √d_k a scale factor keeping softmax out of saturation, and V the content that gets mixed according to those weights.',
    mistake: 'Omitting the scaling, or describing V as the output rather than the content being averaged.',
    followUps: ['What changes for cross-attention?', 'What does the mask do?'],
  },
  {
    id: 'tf-sqrt-dk',
    question: 'Why divide by the square root of d_k?',
    category: 'Transformers',
    difficulty: 'advanced',
    kind: 'mathematical',
    answer:
      'Dot products of independent high-dimensional vectors have variance proportional to d_k, so raw scores grow with dimension. Unscaled, softmax becomes nearly one-hot and gradients vanish. Dividing by √d_k keeps the variance roughly constant.',
    followUps: ['What would happen with d_k = 4,096 and no scaling?'],
  },
  {
    id: 'tf-multihead',
    question: 'Why multiple attention heads rather than one large one?',
    category: 'Transformers',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'One softmax distribution must compromise across all relationship types. Splitting the model dimension into several lower-dimensional heads lets each learn a different pattern — adjacency, coreference, syntax — at roughly the same total compute.',
    followUps: ['What is d_head for d_model 1024 and 16 heads?', 'What is grouped-query attention for?'],
  },
  {
    id: 'tf-positional',
    question: 'Why do transformers need positional encoding?',
    category: 'Transformers',
    difficulty: 'intermediate',
    kind: 'conceptual',
    answer:
      'Attention is a weighted sum over a set, so permuting the input permutes the output identically — the mechanism has no notion of order. Position must be injected, via sinusoidal, learned, relative or rotary encodings.',
    followUps: ['Why is RoPE the current default?', 'Why can a model not simply take longer inputs?'],
  },
  {
    id: 'tf-families',
    question: 'Encoder-only, decoder-only, encoder-decoder: what is each for?',
    category: 'Transformers',
    difficulty: 'intermediate',
    kind: 'architecture',
    answer:
      'Encoder-only is bidirectional and suits classification, extraction and embeddings (BERT-style). Decoder-only is causal and suits generation, chat and tool use. Encoder-decoder maps one sequence to another and suits translation and summarisation (T5-style).',
    followUps: ['Why did decoder-only become dominant for general models?', 'Which family would you use for semantic search?'],
  },
  {
    id: 'tf-quadratic',
    question: 'Why is transformer attention quadratic, and what is done about it?',
    category: 'Transformers',
    difficulty: 'expert',
    kind: 'conceptual',
    answer:
      'The score matrix is n x n for sequence length n, so compute and memory scale with n². Mitigations: FlashAttention (same maths, far less memory traffic), sliding-window and sparse patterns, linear-attention approximations, and retrieval instead of longer context.',
    followUps: ['Does FlashAttention change the result?', 'What is the KV cache and how does it grow?'],
  },
  {
    id: 'llm-temperature',
    question: 'What does temperature do, and what would you set for extraction?',
    category: 'LLMs',
    difficulty: 'beginner',
    kind: 'conceptual',
    answer:
      'It divides the logits before softmax: low sharpens the distribution towards the most likely token, high flattens it. For extraction or classification use 0 — there is one correct answer and variance is pure risk.',
    mistake: 'Saying temperature 0 guarantees identical output. Batching and floating-point non-determinism can still change a token.',
    followUps: ['How does top-p differ?', 'Why tune one and not both?'],
  },
  {
    id: 'llm-context-cost',
    question: 'A 100k-token prompt fits the context window. Why might it still be the wrong design?',
    category: 'LLMs',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Cost is roughly linear in input tokens on every call, latency grows with prefill, and models attend unevenly across very long contexts — relevant content in the middle is used less reliably. Retrieving the right few thousand tokens usually beats supplying everything.',
    followUps: ['What is the "lost in the middle" effect?', 'How does prefix caching change the economics?'],
  },
  {
    id: 'llm-hallucination',
    question: 'Why do LLMs hallucinate, and can it be eliminated?',
    category: 'LLMs',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'They are trained to produce likely continuations, not verified statements, so a fluent plausible answer is on-distribution behaviour. It can be constrained — grounding with retrieval, requiring citations, permitting refusal, verifying claims mechanically — but not removed.',
    mistake: 'Claiming a larger model or a stern prompt eliminates it.',
    followUps: ['How would you measure hallucination rate?', 'Why must refusal be rewarded in evaluation?'],
  },
  {
    id: 'llm-embedding-change',
    question: 'You switch embedding model. What must you do?',
    category: 'LLMs',
    difficulty: 'intermediate',
    kind: 'scenario',
    answer:
      'Re-embed and re-index every document. Each model defines its own vector space, so comparing new query vectors against old document vectors produces meaningless distances.',
    mistake: 'Assuming vectors of the same dimensionality are interchangeable.',
    followUps: ['How would you run the migration with no downtime?', 'How do you A/B test two retrievers?'],
  },
  {
    id: 'llm-structured',
    question: 'How do you guarantee parseable JSON from a model?',
    category: 'LLMs',
    difficulty: 'intermediate',
    kind: 'coding',
    answer:
      'Use the provider’s schema-constrained output mode where available, which makes invalid output impossible. Otherwise validate against a schema, and on failure retry once with the validation error appended to the prompt.',
    code: {
      lang: 'python',
      code: `try:
    result = Schema.model_validate_json(raw)
except ValidationError as error:
    raw = call_model(f"{prompt}\\n\\nInvalid: {error}\\nReturn valid JSON only.")
    result = Schema.model_validate_json(raw)`,
    },
    followUps: ['Why is "please return JSON" insufficient in production?', 'What do you log when repair fails?'],
  },
  {
    id: 'rag-vs-finetune',
    question: 'RAG or fine-tuning: how do you decide?',
    category: 'RAG',
    difficulty: 'intermediate',
    kind: 'scenario',
    answer:
      'Knowledge gap → RAG: it handles private and changing information and supports citations. Behaviour gap (format, tone, a narrow skill) → fine-tuning. They combine well; try prompting first because it costs an afternoon.',
    mistake: 'Fine-tuning on documentation to make a model "know" a product. It learns the style far more than the facts, and every update needs retraining.',
    followUps: ['What does fine-tuning save at high volume?', 'When is neither the answer?'],
  },
  {
    id: 'rag-pipeline-stages',
    question: 'Walk through a RAG pipeline and name a failure mode at each stage.',
    category: 'RAG',
    difficulty: 'advanced',
    kind: 'architecture',
    answer:
      'Parse (tables mangled), chunk (ideas split across boundaries), embed (wrong model or silent truncation), index and retrieve (top-k too small, no lexical path), rerank (absent, so the right chunk sits at rank 14), generate (no grounding instruction, so the model answers from memory).',
    followUps: ['How do you tell retrieval from generation failure?', 'What do you log per request to make that possible?'],
  },
  {
    id: 'rag-chunk-size',
    question: 'How do you choose chunk size and overlap?',
    category: 'RAG',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'Start at 400–800 tokens with 10–15% overlap, split on document structure rather than character counts, and tune against a labelled retrieval set using recall@k. Smaller chunks retrieve precisely and lose context; larger ones dilute the embedding.',
    followUps: ['What is parent/child retrieval?', 'How do you keep tables intact?'],
  },
  {
    id: 'rag-hybrid',
    question: 'Why add keyword search to a vector-based RAG system?',
    category: 'RAG',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Dense retrieval blurs rare exact tokens — part numbers, error codes, function names, surnames. BM25 rewards exactly those. Running both and fusing with reciprocal rank fusion is strictly better than either alone.',
    followUps: ['Why is RRF preferred over score averaging?', 'How would you evaluate the gain?'],
  },
  {
    id: 'rag-rerank',
    question: 'Bi-encoder versus cross-encoder in retrieval?',
    category: 'RAG',
    difficulty: 'advanced',
    kind: 'architecture',
    answer:
      'A bi-encoder embeds query and document separately, so documents are precomputed and search is fast — that is retrieval. A cross-encoder scores the pair jointly, which is far more accurate but needs one model pass per candidate, so it reranks a shortlist of 20–50.',
    followUps: ['Why can a cross-encoder not be precomputed?', 'How many candidates would you rerank?'],
  },
  {
    id: 'rag-metrics',
    question: 'Recall@5 is 0.95 but answers are still wrong. Where is the problem?',
    category: 'RAG',
    difficulty: 'advanced',
    kind: 'debugging',
    answer:
      'Retrieval is working, so the failure is downstream: too much irrelevant context alongside the right chunk, poor ordering, missing citation requirements, or a prompt that does not force grounding and allow refusal.',
    followUps: ['Which generation metrics would you add?', 'How do you validate an LLM judge?'],
  },
  {
    id: 'rag-injection',
    question: 'A retrieved document contains instructions telling the model to exfiltrate data. What stops it?',
    category: 'RAG',
    difficulty: 'expert',
    kind: 'scenario',
    answer:
      'Not the prompt. The controls are outside the model: least-privilege tools, authorisation enforced in code per user, human approval for irreversible actions, egress filtering, and clearly fenced retrieved content that can never grant permissions.',
    explanation: 'This is indirect prompt injection, and it is why tool permissions rather than prompt wording form the security boundary.',
    followUps: ['How would you detect an attempt?', 'What is the OWASP LLM top ten?'],
  },
  {
    id: 'ft-lora',
    question: 'How does LoRA make fine-tuning cheap?',
    category: 'Fine-Tuning',
    difficulty: 'expert',
    kind: 'mathematical',
    answer:
      'It freezes the base weights and learns a low-rank update B·A added to selected matrices. At rank 8 on a 4096x4096 layer that is 65k trainable values instead of 16.7M, so gradients and optimiser state — which dominate training memory — exist only for the adapter.',
    followUps: ['What do rank and alpha control?', 'What does QLoRA add?'],
  },
  {
    id: 'ft-forgetting',
    question: 'What is catastrophic forgetting and how do you limit it?',
    category: 'Fine-Tuning',
    difficulty: 'advanced',
    kind: 'conceptual',
    answer:
      'Training hard on a narrow distribution overwrites general capability. Limit it with fewer epochs, a lower learning rate, parameter-efficient methods, mixing general instruction data into the set, and evaluating on general benchmarks as well as your task.',
    mistake: 'Only measuring the target task, so the regression is invisible until users find it.',
    followUps: ['Why does LoRA reduce this?', 'How much general data would you mix in?'],
  },
  {
    id: 'ft-data',
    question: 'How much data do you need to fine-tune, and what matters most?',
    category: 'Fine-Tuning',
    difficulty: 'advanced',
    kind: 'scenario',
    answer:
      'For format and style, a few hundred consistent examples often suffice; for a harder skill, low thousands. Quality and internal consistency dominate volume — every inconsistency in the data is a behaviour you are teaching.',
    followUps: ['How do you build a held-out set for this?', 'What does 1–3 epochs guard against?'],
  },
  {
    id: 'llm-quantisation',
    question: 'What does quantisation cost you?',
    category: 'LLMs',
    difficulty: 'expert',
    kind: 'conceptual',
    answer:
      'It stores weights in fewer bits — 8-bit is usually close to lossless, 4-bit is a measurable quality trade — in exchange for much less memory and often higher throughput. The loss is task-dependent, so it has to be benchmarked on your own evaluation set rather than assumed.',
    followUps: ['What is NF4?', 'How does this interact with QLoRA training?'],
  },
];
