import { Module } from '../../core/models/content.models';

export const nlpModule: Module = {
  slug: 'nlp',
  title: 'Natural Language Processing',
  short: 'NLP',
  stage: 7,
  level: 'intermediate',
  tagline: 'From tokenisation and TF-IDF to embeddings and sequence models.',
  description:
    'This stage is the direct run-up to transformers. Each step exists because the previous one ' +
    'hit a wall: counts lose word order, embeddings lose context, recurrence loses long-range ' +
    'dependencies and parallelism. Knowing which wall each technique hit is how the transformer ' +
    'stops looking arbitrary.',
  topics: [
    {
      slug: 'text-preprocessing',
      title: 'Tokenisation and text preprocessing',
      module: 'nlp',
      level: 'beginner',
      minutes: 8,
      summary: 'Splitting text into units, normalising it, and where stemming and stop words still apply.',
      why: 'Tokenisation is the boundary between human text and model input. It decides vocabulary size, sequence length, how unknown words are handled — and, in the LLM era, what you pay per request.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Explain word, character and subword tokenisation',
        'Say when lowercasing or stop-word removal helps and when it destroys signal',
        'Describe how BPE handles a word it has never seen',
      ],
      tags: ['tokenisation', 'preprocessing', 'bpe'],
      blocks: [
        {
          kind: 'table',
          head: ['Level', 'Vocabulary', 'Unknown words', 'Used by'],
          rows: [
            ['Word', 'Large (100k+)', 'Become <UNK> — information lost', 'Classical NLP, word2vec'],
            ['Character', 'Tiny (~100)', 'Never unknown', 'Some specialised models'],
            ['Subword (BPE, WordPiece)', 'Moderate (30k–100k)', 'Split into known pieces', 'Every modern LLM'],
          ],
        },
        {
          kind: 'text',
          body: 'Byte-pair encoding starts from characters and repeatedly merges the most frequent adjacent pair. Common words end up as single tokens; rare ones decompose. "tokenisation" might become `token` + `isation`, and a nonsense string still encodes without ever hitting an unknown token.',
        },
        { kind: 'visual', id: 'tokenizer', caption: 'Type text and see how subword tokenisation splits it.' },
        { kind: 'heading', text: 'Classical normalisation, and when it hurts' },
        {
          kind: 'list',
          items: [
            '**Lowercasing** — helps bag-of-words models; destroys the difference between "Apple" and "apple" in named-entity work.',
            '**Stop-word removal** — useful for TF-IDF retrieval; harmful for sentiment, where "not" is doing the work.',
            '**Stemming** — crude suffix chopping (`running → run`, `studies → studi`). Fast, produces non-words.',
            '**Lemmatisation** — dictionary-based reduction to a real base form (`better → good`). Slower, linguistically correct.',
            '**For transformers** — do almost none of this. The pretrained tokenizer expects raw text, casing and punctuation included.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Classical pipeline vs pretrained tokenizer',
          code: `# Classical: normalise aggressively, because features are word counts.
import re

STOP = {"the", "a", "is", "of", "and", "to"}


def classical(text: str) -> list[str]:
    words = re.findall(r"[a-z']+", text.lower())
    return [w for w in words if w not in STOP]


print(classical("The Model is Learning the Patterns of Language"))
# ['model', 'learning', 'patterns', 'language']

# Transformer: hand over raw text; the tokenizer owns the decisions.
# from transformers import AutoTokenizer
# tok = AutoTokenizer.from_pretrained("bert-base-uncased")
# tok("The Model is Learning")["input_ids"]`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'nlp-1',
            prompt: 'Why do modern LLMs use subword tokenisation?',
            options: [
              'It is faster to compute',
              'It keeps the vocabulary manageable while never failing on an unseen word',
              'It removes the need for embeddings',
              'It makes sequences shorter than character-level',
            ],
            answer: 1,
            explanation:
              'Word vocabularies explode and still hit unknown tokens; character sequences are too long to model efficiently. Subwords sit between: a bounded vocabulary with full coverage of any input string.',
          },
        },
      ],
      resources: [
        { label: 'Hugging Face tokenizer summary', url: 'https://huggingface.co/docs/transformers/tokenizer_summary', kind: 'docs' },
        { label: 'spaCy linguistic features', url: 'https://spacy.io/usage/linguistic-features', kind: 'docs' },
      ],
      related: ['bag-of-words-and-tfidf', 'tokens-and-context'],
    },
    {
      slug: 'bag-of-words-and-tfidf',
      title: 'Bag of words and TF-IDF',
      module: 'nlp',
      level: 'beginner',
      minutes: 7,
      summary: 'Counting words into vectors, weighting them by rarity, and what that representation cannot do.',
      why: 'TF-IDF remains a genuinely strong baseline for classification and keyword retrieval, and it is one half of the hybrid search used in production RAG systems. It is also the clearest illustration of what embeddings fixed.',
      prerequisites: ['text-preprocessing'],
      outcomes: [
        'Build a TF-IDF representation and use it for classification',
        'Explain the IDF term and why it matters',
        'State the three things bag-of-words loses',
      ],
      tags: ['tf-idf', 'bm25', 'bag of words'],
      blocks: [
        {
          kind: 'text',
          body: 'Bag of words turns a document into a vector of word counts over a fixed vocabulary. Order is discarded entirely — "the dog bit the man" and "the man bit the dog" are identical vectors.',
        },
        {
          kind: 'math',
          expr: 'tfidf(t, d) = tf(t, d) · log(N / df(t))',
          note: 'Frequent in this document, rare across the corpus, scores highest. Words appearing everywhere are weighted towards zero automatically.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'The top TF-IDF terms per document',
          code: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

docs = [
    "gradient descent optimises the loss function",
    "the transformer uses self attention",
    "attention scores weight the value vectors",
]

vec = TfidfVectorizer(stop_words="english")
X = vec.fit_transform(docs)
terms = np.array(vec.get_feature_names_out())

for i, row in enumerate(X.toarray()):
    top = terms[row.argsort()[::-1][:3]]
    print(i, list(top))

# 0 ['descent', 'gradient', 'optimises']
# 1 ['self', 'transformer', 'attention']
# 2 ['scores', 'value', 'vectors']`,
        },
        {
          kind: 'list',
          items: [
            '**Order is gone** — negation and syntax disappear. N-grams recover a little of it at the cost of a much larger vocabulary.',
            '**Meaning is gone** — "car" and "automobile" are as unrelated as "car" and "banana".',
            '**Vectors are huge and sparse** — tens of thousands of dimensions, almost all zeros.',
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'BM25 is TF-IDF grown up',
          body: 'BM25 adds term-frequency saturation and document-length normalisation. It is the lexical scorer inside Elasticsearch and OpenSearch, and the keyword half of hybrid retrieval — still the best tool for exact identifiers, error codes and product numbers that embeddings blur together.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'nlp-2',
            prompt: 'A user searches "error code E-4021". Which retriever handles this better?',
            options: [
              'Dense embeddings — they capture meaning',
              'BM25 / lexical search — exact rare tokens are its strength',
              'Neither',
              'Both identically',
            ],
            answer: 1,
            explanation:
              'Embeddings map rare identifiers to a fuzzy neighbourhood of similar-looking codes. Lexical scoring rewards exactly the rare token, which is why serious RAG systems run both and fuse the results.',
          },
        },
      ],
      resources: [
        { label: 'scikit-learn text feature extraction', url: 'https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction', kind: 'docs' },
      ],
      related: ['word-embeddings', 'vector-search-and-hybrid'],
    },
    {
      slug: 'word-embeddings',
      title: 'Word embeddings',
      module: 'nlp',
      level: 'intermediate',
      minutes: 8,
      summary: 'Word2Vec, GloVe and the idea that meaning is a direction in space.',
      why: 'Embeddings replaced sparse counts with dense vectors where distance means similarity. Everything in the modern stack — semantic search, RAG retrieval, recommendation — rests on this idea.',
      prerequisites: ['bag-of-words-and-tfidf', 'vectors-and-matrices'],
      outcomes: [
        'Explain the distributional hypothesis',
        'Describe skip-gram training in one paragraph',
        'State the limitation that contextual models fixed',
      ],
      tags: ['word2vec', 'glove', 'embeddings'],
      blocks: [
        {
          kind: 'text',
          body: 'The distributional hypothesis: words that appear in similar contexts have similar meanings. Word2Vec operationalises it by training a small network to predict a word’s neighbours (skip-gram) or a word from its neighbours (CBOW). The prediction task is thrown away; the hidden weights are the embeddings.',
        },
        {
          kind: 'text',
          body: 'Because similar contexts produce nearby vectors, relationships appear as consistent directions: `king − man + woman ≈ queen`. These analogies are a real property of the geometry, not a party trick — though they are noisier than the famous examples suggest.',
        },
        { kind: 'visual', id: 'embeddings', caption: 'A 2-D projection of an embedding space — search it by nearest neighbour.' },
        {
          kind: 'table',
          head: ['Model', 'Trained on', 'Character'],
          rows: [
            ['Word2Vec', 'Local context windows', 'Fast, strong analogies'],
            ['GloVe', 'Global co-occurrence counts', 'Similar quality, matrix-factorisation view'],
            ['FastText', 'Character n-grams', 'Handles misspellings and unseen words'],
            ['Sentence transformers', 'Contextual, sentence-level', 'The modern default for retrieval'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'One vector per word is the fatal limit',
          body: 'Word2Vec gives "bank" a single vector averaging riverbank and financial institution. Context cannot change it. That is precisely the problem contextual embeddings — and therefore transformers — exist to solve.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'nlp-3',
            prompt: 'Why can Word2Vec not distinguish "river bank" from "savings bank"?',
            options: [
              'It was trained on too little data',
              'It assigns one fixed vector per word, independent of context',
              'It ignores rare words',
              'Its vectors are too short',
            ],
            answer: 1,
            explanation:
              'The embedding is a static lookup table. Contextual models compute a different vector for the same word in each sentence, which is the central capability attention provides.',
          },
        },
      ],
      resources: [
        { label: 'Efficient Estimation of Word Representations (Word2Vec)', url: 'https://arxiv.org/abs/1301.3781', kind: 'paper' },
        { label: 'GloVe project page', url: 'https://nlp.stanford.edu/projects/glove/', kind: 'paper' },
        { label: 'Sentence Transformers documentation', url: 'https://sbert.net/', kind: 'docs' },
      ],
      related: ['sequence-models', 'embeddings-explained'],
    },
    {
      slug: 'sequence-models',
      title: 'RNNs, LSTMs and the road to attention',
      module: 'nlp',
      level: 'advanced',
      minutes: 9,
      summary: 'Recurrence, gating, the bottleneck it could not escape, and the fix that replaced it.',
      why: 'Attention was invented to patch a specific failure of recurrent encoder-decoders. Understanding that failure is the cleanest possible motivation for the transformer.',
      prerequisites: ['word-embeddings', 'backpropagation'],
      outcomes: [
        'Explain how an RNN carries state across time steps',
        'Say what LSTM gates fixed and what they did not',
        'Describe the two limits that made transformers inevitable',
      ],
      tags: ['rnn', 'lstm', 'gru', 'attention'],
      blocks: [
        {
          kind: 'text',
          body: 'An RNN processes a sequence one step at a time, carrying a hidden state forward: `h_t = f(h_{t-1}, x_t)`. In principle that state summarises everything so far. In practice, backpropagating through many steps multiplies the same weights repeatedly, so the gradient vanishes and dependencies beyond a dozen or so steps are not learned.',
        },
        {
          kind: 'visual',
          id: 'rnn-unroll',
          caption: 'Play it through: the state carries forward, then watch the gradient decay on the way back.',
        },
        {
          kind: 'text',
          body: '**LSTMs** add a cell state with input, forget and output gates, giving the network a learned choice about what to keep and what to discard. **GRUs** simplify this to two gates with similar performance. Both push the usable range out considerably — and neither removes the two structural problems.',
        },
        {
          kind: 'table',
          head: ['Limit', 'Consequence'],
          rows: [
            ['Sequential computation', 'Step t needs step t−1, so the sequence cannot be parallelised across time — training is slow and does not scale with GPUs'],
            ['Fixed-size bottleneck', 'An encoder compresses a whole sentence into one vector; long inputs lose detail'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Attention as the fix',
          body: 'Instead of forcing the decoder to read one summary vector, let it look back at every encoder state and weight them per output token. That is attention. Once you have it, recurrence turns out to be unnecessary — which is the entire argument of "Attention Is All You Need".',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'nlp-4',
            prompt: 'What made transformers train so much faster than LSTMs on the same hardware?',
            options: [
              'Fewer parameters',
              'All positions are processed in parallel instead of step by step',
              'They need no embeddings',
              'Smaller vocabularies',
            ],
            answer: 1,
            explanation:
              'Self-attention computes all pairwise interactions in one batched matrix multiplication, so a 512-token sequence is one parallel operation rather than 512 dependent ones. That is what let model and data scale together.',
          },
        },
      ],
      resources: [
        { label: 'Understanding LSTM Networks (Olah)', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/', kind: 'docs' },
        { label: 'Neural Machine Translation by Jointly Learning to Align and Translate', url: 'https://arxiv.org/abs/1409.0473', kind: 'paper' },
      ],
      related: ['self-attention', 'transformer-architecture'],
    },
    {
      slug: 'classical-nlp-tasks',
      title: 'Classical NLP tasks: tagging, entities and topics',
      module: 'nlp',
      level: 'intermediate',
      minutes: 9,
      summary:
        'Part-of-speech tagging, named-entity recognition, sentiment and topic modelling — the tasks still solved without a language model.',
      why: 'Not every text problem needs an LLM. Extracting company names from ten million filings, or discovering what a support backlog is about, is faster, cheaper and more predictable with a purpose-built pipeline — and these tasks are the vocabulary of most NLP job descriptions.',
      prerequisites: ['text-preprocessing', 'bag-of-words-and-tfidf'],
      outcomes: [
        'Run POS tagging and named-entity recognition over real text',
        'Choose between a classical pipeline and an LLM for a given task',
        'Discover themes in an unlabelled corpus with topic modelling',
      ],
      tags: ['spacy', 'ner', 'topic modelling', 'sentiment'],
      blocks: [
        {
          kind: 'table',
          head: ['Task', 'Output', 'Classical tool', 'When an LLM wins'],
          rows: [
            ['POS tagging', 'A grammatical tag per token', 'spaCy, NLTK', 'Almost never — this is solved'],
            ['Named-entity recognition', 'Spans labelled person, org, place, date', 'spaCy, Stanza', 'Rare or domain-specific entity types with no training data'],
            ['Sentiment', 'Polarity, or a label per aspect', 'Fine-tuned classifier, VADER', 'Sarcasm, mixed opinions, aspect-level nuance'],
            ['Topic modelling', 'Clusters of co-occurring terms', 'LDA, NMF, BERTopic', 'You need named themes rather than word clusters'],
            ['Summarisation', 'Shorter text', 'Extractive sentence scoring', 'Almost always — this is what LLMs are good at'],
          ],
        },
        {
          kind: 'text',
          body: 'The rule of thumb: **a task with a fixed, well-defined output space and high volume belongs to a classical pipeline**. A task needing world knowledge, tone or open-ended generation belongs to a language model. A tagger processes thousands of documents a second on a laptop; an LLM call takes a second and costs money.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Tagging and entity extraction with spaCy',
          code: `import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Priya joined Acme Systems in Bangalore in March 2024 to work on API tooling.")

for token in doc[:5]:
    print(f"{token.text:<12} {token.pos_:<6} {token.lemma_}")
# Priya        PROPN  Priya
# joined       VERB   join
# Acme         PROPN  Acme
# Systems      PROPN  Systems
# in           ADP    in

for ent in doc.ents:
    print(ent.text, "->", ent.label_)
# Priya -> PERSON
# Acme Systems -> ORG
# Bangalore -> GPE
# March 2024 -> DATE`,
        },
        { kind: 'heading', text: 'Topic modelling' },
        {
          kind: 'text',
          body: 'Topic modelling finds groups of words that co-occur across documents. **LDA** treats each document as a mixture of topics and each topic as a distribution over words. **BERTopic** clusters sentence embeddings instead, which usually produces more coherent topics on short text. Neither names the topics for you — you read the top terms and decide what they mean, which is where the work is.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Themes in a support backlog, without labels',
          code: `from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer(stop_words="english", min_df=5, max_df=0.4)
counts = vec.fit_transform(tickets)

lda = LatentDirichletAllocation(n_components=6, random_state=0).fit(counts)
terms = vec.get_feature_names_out()

for i, topic in enumerate(lda.components_):
    top = [terms[j] for j in topic.argsort()[-6:][::-1]]
    print(f"topic {i}: {', '.join(top)}")

# topic 0: refund, payment, card, declined, charge, failed
# topic 1: login, password, reset, email, locked, account`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Topic count is a judgement, not a result',
          body: 'LDA returns exactly the number of topics you ask for, on any corpus, including noise. Try several, read the top terms, and keep the one a domain expert recognises. Coherence scores help rank candidates but do not settle it.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'The hybrid that usually wins',
          body: 'Use a classical pipeline to filter and route at volume, then spend LLM calls only on what survives. Extract entities with spaCy, cluster with embeddings, and ask a model to name the clusters — one call instead of a million.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'nlp-5',
            prompt: 'You must extract organisation names from 40 million filings, nightly. Which approach?',
            options: [
              'An LLM call per document',
              'A named-entity recognition model, with an LLM only for the cases it flags as uncertain',
              'Regular expressions',
              'Topic modelling',
            ],
            answer: 1,
            explanation:
              'At that volume, per-document LLM calls are unaffordable and slow. NER is purpose-built, runs locally at thousands of documents a second, and reserves the expensive model for the hard remainder.',
          },
        },
      ],
      resources: [
        { label: 'spaCy linguistic features', url: 'https://spacy.io/usage/linguistic-features', kind: 'docs' },
        { label: 'scikit-learn topic extraction example', url: 'https://scikit-learn.org/stable/auto_examples/applications/plot_topics_extraction_with_nmf_lda.html', kind: 'docs' },
        { label: 'BERTopic documentation', url: 'https://maartengr.github.io/BERTopic/', kind: 'tool' },
      ],
      related: ['word-embeddings', 'hugging-face-ecosystem'],
    },
  ],
};
