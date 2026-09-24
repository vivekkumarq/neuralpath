import { Module } from '../../core/models/content.models';

export const generativeAiModule: Module = {
  slug: 'generative-ai',
  title: 'Generative AI',
  short: 'GenAI',
  stage: 10,
  level: 'intermediate',
  tagline: 'Foundation models, prompting, structured output, tool use and evaluation.',
  description:
    'Generative AI is where most engineering roles now sit: you are rarely training the model and ' +
    'almost always designing the system around it. This stage covers what a foundation model is, ' +
    'how to instruct it reliably, how to get machine-readable output, and how to tell whether any ' +
    'of it works.',
  topics: [
    {
      slug: 'foundation-models',
      title: 'Foundation models and how they are trained',
      module: 'generative-ai',
      level: 'intermediate',
      minutes: 9,
      summary: 'Pretraining, instruction tuning and preference alignment — the three stages behind an assistant.',
      why: 'Model behaviour makes sense once you know which training stage produced it. Refusals, formatting habits, sycophancy and knowledge cutoffs are all artefacts of a specific stage.',
      prerequisites: ['transformer-architecture'],
      outcomes: [
        'Distinguish a base model from an instruction-tuned one',
        'Explain what RLHF and preference optimisation do',
        'Reason about what "emergent capability" does and does not mean',
      ],
      tags: ['foundation models', 'rlhf', 'pretraining'],
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Pretraining', body: 'Next-token prediction over a very large text corpus. This is where the vast majority of compute goes and where knowledge and language competence come from. The output is a base model: a strong text continuer, not an assistant.' },
            { title: 'Supervised fine-tuning', body: 'Training on curated instruction/response pairs. This teaches the format of being helpful — answering rather than continuing.' },
            { title: 'Preference alignment', body: 'Humans (or a model standing in for them) rank candidate responses; RLHF or a direct method such as DPO pushes the model towards the preferred ones. This is where tone, refusals and safety behaviour are shaped.' },
          ],
        },
        {
          kind: 'table',
          head: ['Property', 'Consequence for you'],
          rows: [
            ['Trained on a snapshot of text', 'A knowledge cutoff; anything later must be retrieved or supplied'],
            ['Predicts likely continuations', 'Fluent wrong answers are on-distribution behaviour, not a bug'],
            ['Instruction tuned', 'Format instructions work; the model has a default style to override'],
            ['Preference aligned', 'Tends to agree with the user; leading questions get leading answers'],
            ['Fixed context window', 'Long inputs must be chunked, retrieved or summarised'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Model size is not the only axis',
          body: 'Capability comes from parameters, data quality, training compute and post-training. A smaller, well-post-trained model frequently beats a larger, older one on real tasks — and costs a fraction to serve. Benchmark on your own task before assuming bigger is better.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'gen-1',
            prompt: 'Why does a base (non-instruction-tuned) model respond oddly to a question?',
            options: [
              'It has fewer parameters',
              'It was trained to continue text, not to answer — so it may continue with more questions',
              'Its context window is smaller',
              'It has no tokenizer',
            ],
            answer: 1,
            explanation:
              'Given "What is the capital of France?" a base model might plausibly continue with another quiz question. Instruction tuning is what converts a text continuer into something that answers.',
          },
        },
      ],
      resources: [
        { label: 'Training language models to follow instructions (InstructGPT)', url: 'https://arxiv.org/abs/2203.02155', kind: 'paper' },
        { label: 'Direct Preference Optimization (DPO)', url: 'https://arxiv.org/abs/2305.18290', kind: 'paper' },
        { label: 'Hugging Face open LLM leaderboards', url: 'https://huggingface.co/open-llm-leaderboard', kind: 'tool' },
      ],
      related: ['prompt-engineering', 'tokens-and-context'],
    },
    {
      slug: 'prompt-engineering',
      title: 'Prompt engineering that survives contact with production',
      module: 'generative-ai',
      level: 'intermediate',
      minutes: 11,
      summary: 'Instruction structure, few-shot examples, reasoning prompts and the failure modes of each.',
      why: 'Prompting is the cheapest and fastest way to change model behaviour, and the first thing to exhaust before considering retrieval or fine-tuning. Done carelessly it is also the least reliable.',
      prerequisites: ['foundation-models'],
      outcomes: [
        'Write a prompt with a clear role, task, constraints and output format',
        'Choose between zero-shot, few-shot and reasoning prompts',
        'Version and test prompts instead of editing them by feel',
      ],
      tags: ['prompting', 'few-shot', 'chain of thought'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**Role** — the perspective to answer from. Short and concrete; a paragraph of persona rarely helps.',
            '**Task** — one unambiguous instruction. Two tasks in one prompt means one of them gets done badly.',
            '**Context** — the material to use, clearly delimited from the instruction.',
            '**Constraints** — length, tone, what to do when the answer is not in the context.',
            '**Output format** — the exact shape expected, with an example if it is non-trivial.',
          ],
        },
        {
          kind: 'code',
          lang: 'text',
          caption: 'A prompt with each part doing one job',
          code: `You are a support engineer for a payments API.

Answer the question using only the documentation excerpts below.
If the excerpts do not contain the answer, reply exactly: NOT_IN_DOCS

Documentation:
---
{context}
---

Question: {question}

Respond as JSON:
{"answer": "<two sentences maximum>", "doc_ids": ["<id>", ...]}`,
        },
        {
          kind: 'table',
          head: ['Technique', 'What it is', 'When it earns its tokens'],
          rows: [
            ['Zero-shot', 'Instruction only', 'Common tasks the model already knows'],
            ['Few-shot', '2–5 input/output examples', 'Idiosyncratic formats, domain labels, tone matching'],
            ['Chain-of-thought', 'Asking for reasoning before the answer', 'Multi-step arithmetic and logic; costs latency and tokens'],
            ['Decomposition', 'Splitting into several smaller calls', 'Long pipelines where one call does too much'],
            ['Self-check', 'A second pass to verify the first', 'High-stakes extraction; roughly doubles cost'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Few-shot examples teach more than format',
          body: 'If all your examples have short answers, answers will be short. If they share a bias, the output inherits it. Examples are training data at inference time — choose them as carefully as you would a labelled set.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Treat prompts as code',
          body: 'Keep them in version control, not in a string literal buried in a handler. Give each a version, keep a set of test cases with expected properties, and re-run that set before changing one in production. "It looked better in the playground" is not a regression test.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'pe-1',
            prompt: 'A classifier prompt returns prose instead of one of your five labels. Best first fix?',
            options: [
              'Switch to a larger model',
              'State the allowed labels explicitly, add two examples, and constrain the output format',
              'Fine-tune the model',
              'Raise the temperature',
            ],
            answer: 1,
            explanation:
              'Format drift is almost always an under-specified prompt. Enumerating the labels with a couple of examples fixes it at zero marginal cost — and where the API supports it, a schema removes the failure entirely.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic prompt engineering guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', kind: 'docs' },
        { label: 'OpenAI prompt engineering guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', kind: 'docs' },
        { label: 'Chain-of-Thought Prompting paper', url: 'https://arxiv.org/abs/2201.11903', kind: 'paper' },
      ],
      related: ['structured-output-and-tools', 'llm-apis-and-parameters'],
    },
    {
      slug: 'structured-output-and-tools',
      title: 'Structured output and tool calling',
      module: 'generative-ai',
      level: 'intermediate',
      minutes: 9,
      summary: 'Getting JSON you can parse, and letting the model call your functions.',
      why: 'An LLM inside software has to produce something a program can consume. Schema-constrained output and tool calling are what turn a chat interface into a component.',
      prerequisites: ['prompt-engineering', 'apis-json-and-http'],
      outcomes: [
        'Define a schema and validate model output against it',
        'Describe the tool-calling loop precisely',
        'Write tool descriptions a model can actually use',
      ],
      tags: ['json', 'function calling', 'tools', 'schema'],
      blocks: [
        {
          kind: 'text',
          body: 'Asking politely for JSON gets JSON most of the time, and "most of the time" is a production incident. Prefer the provider’s structured-output or schema mode, which constrains decoding so invalid output cannot be produced. Where that is unavailable, validate and retry.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Validate, then repair once — never trust the first parse',
          code: `import json

from pydantic import BaseModel, ValidationError


class Extraction(BaseModel):
    company: str
    amount_inr: float
    due_date: str          # ISO 8601
    confidence: float


def extract(text: str, attempts: int = 2) -> Extraction:
    prompt = build_prompt(text, schema=Extraction.model_json_schema())

    for attempt in range(attempts):
        raw = call_model(prompt)
        try:
            return Extraction.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError) as error:
            # Hand the model its own error; one repair round fixes most cases.
            prompt = f"{prompt}\\n\\nYour last reply was invalid: {error}\\nReturn valid JSON only."

    raise ValueError("model could not produce valid output")`,
        },
        { kind: 'heading', text: 'The tool-calling loop' },
        {
          kind: 'steps',
          items: [
            { title: 'Declare', body: 'Send tool definitions — name, description, JSON schema for arguments — with the request.' },
            { title: 'Model decides', body: 'It replies either with an answer or with a request to call a tool, arguments filled in.' },
            { title: 'You execute', body: 'Your code runs the function. The model never touches your systems directly; this boundary is where authorisation and validation belong.' },
            { title: 'Return the result', body: 'Append the tool result to the conversation and call the model again.' },
            { title: 'Repeat', body: 'Until the model answers, or a step limit is reached. That limit is not optional.' },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'The description is the interface',
          body: 'A model selects a tool from its name, description and parameter docs. `get_data(x)` will be called wrongly; `get_invoice_status(invoice_id: str)` with a one-line description of what it returns and when to use it will not. Write them for a competent new colleague with no access to your codebase.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Tool arguments are untrusted input',
          body: 'They were produced by a model that may have read attacker-controlled text. Validate types and ranges, enforce authorisation for the current user, and never interpolate them into SQL, shell commands or file paths.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'tool-1',
            prompt: 'Who executes a tool call?',
            options: [
              'The model, in a sandbox',
              'Your application — the model only requests a call and receives the result',
              'The API provider',
              'The tool registry',
            ],
            answer: 1,
            explanation:
              'The model emits a structured request; your code decides whether and how to run it. That separation is the whole security boundary of agentic systems.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic tool use documentation', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', kind: 'docs' },
        { label: 'OpenAI structured outputs', url: 'https://platform.openai.com/docs/guides/structured-outputs', kind: 'docs' },
        { label: 'Pydantic documentation', url: 'https://docs.pydantic.dev/latest/', kind: 'docs' },
      ],
      related: ['tool-calling', 'security-and-privacy'],
    },
    {
      slug: 'genai-evaluation',
      title: 'Evaluating generative systems',
      module: 'generative-ai',
      level: 'advanced',
      minutes: 10,
      summary: 'Building an eval set, using a model as judge, and measuring hallucination honestly.',
      why: 'Without evaluation you are shipping vibes. Generative output has no single correct answer, so you need a deliberate measurement strategy — and it is the main thing that separates a demo from a product.',
      prerequisites: ['prompt-engineering'],
      outcomes: [
        'Assemble a small, high-signal evaluation set',
        'Use an LLM judge without fooling yourself',
        'Separate retrieval failures from generation failures',
      ],
      tags: ['evaluation', 'hallucination', 'llm judge'],
      blocks: [
        {
          kind: 'table',
          head: ['Method', 'Good for', 'Watch out for'],
          rows: [
            ['Exact match / regex', 'Classification, extraction, routing', 'Too brittle for free text'],
            ['Reference overlap (BLEU, ROUGE)', 'Translation, summarisation, historically', 'Barely correlates with quality'],
            ['Embedding similarity', 'Semantic closeness to a reference', 'Rewards paraphrase, ignores factual errors'],
            ['LLM as judge', 'Free-form quality at scale', 'Position and verbosity bias; needs its own validation'],
            ['Human review', 'Ground truth', 'Slow and expensive — spend it on a sample'],
            ['Task success', 'Agents and pipelines', 'Needs a checkable end state'],
          ],
        },
        {
          kind: 'steps',
          items: [
            { title: 'Collect real inputs', body: 'Twenty to fifty genuine cases beat a thousand invented ones. Include the awkward ones that caused complaints.' },
            { title: 'Define what good means per case', body: 'Not a golden string — a property. "Cites a real document id", "declines when the answer is absent", "returns valid JSON".' },
            { title: 'Automate the check', body: 'Assertions where possible, a judge prompt where not.' },
            { title: 'Validate the judge', body: 'Have a human grade a sample of the judge’s verdicts. If they disagree often, fix the rubric before trusting any number.' },
            { title: 'Run it in CI', body: 'Every prompt or model change runs the suite. This is the only thing that catches a silent regression.' },
          ],
        },
        { kind: 'heading', text: 'Hallucination' },
        {
          kind: 'text',
          body: 'A hallucination is a fluent, confident, unsupported statement. It is a direct consequence of the training objective: the model is optimised to produce likely text, not verified text. It cannot be eliminated, only constrained.',
        },
        {
          kind: 'list',
          items: [
            '**Ground the answer** — supply the source material and require citations to it.',
            '**Allow refusal** — explicitly permit "not in the provided context" and reward it in evaluation, or the model will invent something rather than decline.',
            '**Verify mechanically** — check that quoted ids, numbers and dates exist in the source.',
            '**Constrain scope** — a narrow task has fewer opportunities to drift than an open one.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'eval-1',
            prompt: 'Your LLM judge rates every long answer highly. What is happening?',
            options: [
              'Long answers are genuinely better',
              'Verbosity bias — the judge rubric needs explicit criteria and a human-validated sample',
              'The judge model is too small',
              'The temperature is too low',
            ],
            answer: 1,
            explanation:
              'Judges systematically prefer longer, more confident text. A rubric naming the specific properties to score — with a human check on a sample — is what makes the numbers mean anything.',
          },
        },
      ],
      resources: [
        { label: 'Ragas — RAG evaluation framework', url: 'https://docs.ragas.io/', kind: 'tool' },
        { label: 'Judging LLM-as-a-Judge (MT-Bench paper)', url: 'https://arxiv.org/abs/2306.05685', kind: 'paper' },
        { label: 'OpenAI Evals', url: 'https://github.com/openai/evals', kind: 'repo' },
      ],
      related: ['rag-evaluation', 'observability-and-evals'],
    },
    {
      slug: 'multimodal-and-speech',
      title: 'Beyond text: vision, speech and image generation',
      module: 'generative-ai',
      level: 'intermediate',
      minutes: 10,
      summary:
        'Images as model input, speech to text and back, and how diffusion models generate pictures.',
      why: 'Most real documents are not plain text — they are scans, screenshots, recordings and photographs. Handling them is often the difference between a demo on clean data and a system that works on what the business actually has.',
      prerequisites: ['foundation-models', 'transfer-learning-and-vits'],
      outcomes: [
        'Send an image to a vision-language model and know what it can and cannot read',
        'Build a transcription pipeline and judge its errors',
        'Explain diffusion in terms of noise added and removed',
      ],
      tags: ['multimodal', 'whisper', 'diffusion', 'speech'],
      blocks: [
        { kind: 'heading', text: 'Images as input' },
        {
          kind: 'text',
          body: 'A vision-language model encodes an image into the same token space as text, so a picture and a question about it sit in one context. That makes document understanding, screenshot debugging and chart reading possible without a bespoke pipeline — and it is the practical replacement for a lot of traditional OCR work.',
        },
        {
          kind: 'table',
          head: ['Task', 'Handled well', 'Still fragile'],
          rows: [
            ['Reading a document scan', 'Layout, headings, paragraphs, tables', 'Dense small print, handwriting, stamps'],
            ['Charts and diagrams', 'Trend and label extraction', 'Precise values without gridlines'],
            ['Screenshots', 'UI description, error text', 'Pixel-exact coordinates'],
            ['Photographs', 'Objects, scene, text in the image', 'Counting many similar objects'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Images are untrusted input too',
          body: 'Text inside an image reaches the model as instructions just as readily as text in the prompt. A screenshot containing "ignore previous instructions" is an injection vector, so the same tool-permission rules apply.',
        },
        { kind: 'heading', text: 'Speech' },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Transcription with Whisper, then a summary of the transcript',
          code: `from transformers import pipeline

transcribe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-small",
    chunk_length_s=30,             # long audio is processed in windows
    return_timestamps=True,
)

result = transcribe("standup-2026-09-21.m4a")

for chunk in result["chunks"][:3]:
    start, end = chunk["timestamp"]
    print(f"[{start:6.1f}-{end:6.1f}] {chunk['text'].strip()}")

summary = llm(f"Summarise the decisions in this transcript:\\n{result['text']}")`,
        },
        {
          kind: 'list',
          items: [
            '**Word error rate** is the metric — substitutions, insertions and deletions over reference words. Below about 10% is usable for summarising; below 5% for quoting.',
            '**Domain vocabulary** is where it fails: product names, drug names, acronyms. Bias the decoder with a prompt containing the expected terms.',
            '**Diarisation** — who spoke when — is a separate model, not a Whisper feature.',
            '**Text to speech** is the return path, and the same rule applies: the voice you clone needs consent.',
          ],
        },
        { kind: 'heading', text: 'Image generation' },
        {
          kind: 'text',
          body: 'A diffusion model is trained by adding noise to images in small steps until they are pure static, then learning to reverse one step at a time. To generate, it starts from noise and denoises repeatedly, guided by a text embedding. Latent diffusion does this in a compressed space rather than on pixels, which is why it runs on consumer hardware.',
        },
        {
          kind: 'math',
          expr: 'noise → denoise ×N, guided by the prompt embedding → image',
          note: 'More steps means more refinement and more time. Guidance scale trades prompt adherence against variety.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'mm-1',
            prompt: 'A transcript gets your product name wrong every time. Cheapest effective fix?',
            options: [
              'Fine-tune the speech model',
              'Prompt the decoder with the expected vocabulary, and correct known terms in post-processing',
              'Record at a higher bitrate',
              'Switch to a larger model and accept the cost',
            ],
            answer: 1,
            explanation:
              'Rare proper nouns are the standard failure of a general speech model. Biasing the decoder and applying a domain term list fixes most of it for almost nothing, before any retraining is justified.',
          },
        },
      ],
      resources: [
        { label: 'Whisper paper', url: 'https://arxiv.org/abs/2212.04356', kind: 'paper' },
        { label: 'Hugging Face Diffusers', url: 'https://huggingface.co/docs/diffusers/index', kind: 'docs' },
        { label: 'High-Resolution Image Synthesis with Latent Diffusion Models', url: 'https://arxiv.org/abs/2112.10752', kind: 'paper' },
      ],
      related: ['transfer-learning-and-vits', 'hugging-face-ecosystem'],
    },
    {
      slug: 'speech-and-audio',
      title: 'Speech and audio, from waveform to transcript',
      module: 'generative-ai',
      level: 'intermediate',
      minutes: 10,
      summary:
        'How sound becomes numbers, what a spectrogram is, and how to build a transcription pipeline that survives real recordings.',
      why: 'Audio is the one modality where the fundamentals still matter in practice. Sample rate, channels and background noise decide whether a transcript is usable, and none of it is visible from the API call.',
      prerequisites: ['multimodal-and-speech'],
      outcomes: [
        'Explain sampling, bit depth and why 16kHz mono is the usual target',
        'Read a spectrogram and say what a model sees in it',
        'Build a transcription pipeline and judge its errors properly',
      ],
      tags: ['speech', 'audio', 'whisper', 'spectrogram'],
      blocks: [
        { kind: 'heading', text: 'Sound into numbers' },
        {
          kind: 'text',
          body: 'A microphone turns air pressure into a voltage; an analogue-to-digital converter measures that voltage many thousands of times a second. **Sample rate** is how often it measures, **bit depth** how precisely.',
        },
        {
          kind: 'table',
          head: ['Property', 'Typical', 'Why it matters'],
          rows: [
            ['Sample rate', '16kHz for speech, 44.1kHz for music', 'Nyquist: you can only represent frequencies up to half the sample rate. Speech lives below 8kHz, so 16kHz is enough'],
            ['Bit depth', '16-bit', 'Sets the noise floor. Lower quantises quiet detail away'],
            ['Channels', 'Mono for speech', 'Speech models expect one channel; stereo is downmixed anyway'],
            ['Format', 'WAV (raw) or FLAC', 'Heavy MP3 compression discards detail the model could have used'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Resampling is the most common silent bug',
          body: 'A model trained at 16kHz fed 44.1kHz audio produces confident nonsense, because everything it hears is pitched and paced wrongly. Resample explicitly rather than assuming the library did it.',
        },
        { kind: 'heading', text: 'The spectrogram' },
        {
          kind: 'text',
          body: 'A raw waveform is a long, unhelpful sequence — 30 seconds at 16kHz is 480,000 numbers, and the information is in the *frequencies*, not the individual samples. So the signal is cut into short overlapping windows (20–25ms) and each is passed through a Fourier transform, giving the energy at each frequency in that instant.',
        },
        {
          kind: 'text',
          body: 'Stack those windows side by side and you have a **spectrogram**: time along one axis, frequency along the other, loudness as intensity. A **mel** spectrogram warps the frequency axis to match human hearing, which is finer at low frequencies. This is what a speech model actually consumes — an image, effectively, which is why convolutional and transformer architectures transferred to audio so readily.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Load, resample, and look at what the model will see',
          code: `import librosa
import numpy as np

# Resample to 16kHz mono on load — do not leave this to chance.
audio, sr = librosa.load("standup.m4a", sr=16_000, mono=True)
print(audio.shape, sr, f"{len(audio) / sr:.1f}s")
# (480000,) 16000 30.0s

mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=80,
                                     n_fft=400,      # 25ms window
                                     hop_length=160) # 10ms step
log_mel = librosa.power_to_db(mel, ref=np.max)

print(log_mel.shape)   # (80, 3001) — 80 frequency bands x ~3000 time steps
# 480,000 samples became a 80x3001 picture. That is the model's input.`,
        },
        { kind: 'heading', text: 'The pipeline in practice' },
        {
          kind: 'steps',
          items: [
            { title: 'Normalise the input', body: 'Resample to 16kHz mono, and trim leading silence. Loudness-normalise if recordings vary.' },
            { title: 'Segment long audio', body: 'Models have a fixed window — 30 seconds for Whisper. Split on silence rather than a fixed clock so words are not cut in half.' },
            { title: 'Transcribe with timestamps', body: 'Keep them. They are what lets you link a claim back to the moment it was said.' },
            { title: 'Bias the vocabulary', body: 'Pass expected product names and acronyms in the decoder prompt. This fixes the single most common class of error.' },
            { title: 'Diarise if you need speakers', body: '"Who spoke when" is a separate model, not a Whisper feature. Run it alongside and merge on the timestamps.' },
            { title: 'Post-process', body: 'Correct domain terms against a glossary, then hand the transcript to an LLM for whatever the actual task is.' },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Judge it with word error rate, on your own audio',
          body: 'WER counts substitutions, insertions and deletions against a reference transcript. Below ~10% is fine for summarising, below ~5% before you quote anyone. Benchmark numbers come from clean read speech — a meeting recorded on a laptop in a room with air conditioning will be far worse, and that is the number you need.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'aud-1',
            prompt: 'Why do speech models take a mel spectrogram rather than the raw waveform?',
            options: [
              'Spectrograms are smaller files',
              'The information is in how frequencies change over time, and a spectrogram presents that compactly — like an image',
              'Waveforms cannot be loaded in Python',
              'It removes all background noise',
            ],
            answer: 1,
            explanation:
              '30 seconds of 16kHz audio is 480,000 samples; the mel spectrogram is roughly 80x3000 and puts the linguistically meaningful structure — frequency against time — directly in front of the model.',
          },
        },
      ],
      resources: [
        { label: 'librosa documentation', url: 'https://librosa.org/doc/latest/index.html', kind: 'docs' },
        { label: 'Hugging Face Audio Course', url: 'https://huggingface.co/learn/audio-course', kind: 'course' },
        { label: 'Whisper paper', url: 'https://arxiv.org/abs/2212.04356', kind: 'paper' },
      ],
      related: ['multimodal-and-speech', 'hugging-face-ecosystem'],
    },
  ],
};
