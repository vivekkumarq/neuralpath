import { Module } from '../../core/models/content.models';

export const fineTuningModule: Module = {
  slug: 'fine-tuning',
  title: 'Fine-Tuning and Adaptation',
  short: 'Fine-Tuning',
  stage: 13,
  level: 'advanced',
  tagline: 'When to adapt weights, how LoRA works, and what fine-tuning cannot fix.',
  description:
    'Fine-tuning is the most over-reached-for tool in the LLM toolbox. It is excellent at teaching ' +
    'a model a format, a style or a narrow skill, and poor at teaching it facts. This stage covers ' +
    'the decision first, then the mechanics.',
  topics: [
    {
      slug: 'when-to-fine-tune',
      title: 'Prompting vs RAG vs fine-tuning',
      module: 'fine-tuning',
      level: 'advanced',
      minutes: 10,
      summary: 'The decision framework, and why the order of attempts matters.',
      why: 'Choosing wrongly here costs weeks. Most problems presented as "we need to fine-tune" are retrieval or prompt problems, and the two cheaper options can be tested in an afternoon.',
      prerequisites: ['prompt-engineering', 'rag-pipeline'],
      outcomes: [
        'Match a problem to the right adaptation method',
        'State what fine-tuning is genuinely good at',
        'Explain why fine-tuning is a poor way to add knowledge',
      ],
      tags: ['fine-tuning', 'rag', 'decision'],
      blocks: [

        {
          kind: 'text',
          body: 'Fine-tuning is the most over-reached-for technique in applied AI. It is expensive, it dates immediately, and it is usually attempted to fix problems it cannot fix. Knowing when *not* to do it is worth more than knowing how.',
        },
        {
          kind: 'text',
          body: 'The single most useful rule: **fine-tuning teaches behaviour, not facts.** If the model does not know something, fine-tuning is the wrong tool — you want retrieval, which puts the fact in the context where the model can read it. If the model knows plenty but does not respond in the shape you need, that is behaviour, and that is what fine-tuning is for.',
        },
        {
          kind: 'heading',
          text: 'Try these first, in order',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            '**A better prompt.** A clear instruction with an explicit output format solves more cases than most people expect.',
            '**Few-shot examples.** Five examples in the context often match what a fine-tune on a few hundred would achieve, and you can change them in seconds.',
            '**Retrieval.** If the gap is knowledge, this is the answer, and it updates the moment the source does.',
            '**A larger model.** Frequently cheaper in total than fine-tuning a small one, once your engineering time is counted.',
            '**Then fine-tune** — when the above are exhausted and you have the data.',
          ],
        },
        {
          kind: 'heading',
          text: 'What it is genuinely good at',
        },
        {
          kind: 'text',
          body: 'A consistent format or style that is tedious to describe but easy to demonstrate. A specialised vocabulary the base model handles awkwardly. Latency and cost, by moving a task onto a small model that only has to do one thing. And removing a long system prompt you would otherwise pay for on every request.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'The cost nobody budgets for',
          body: 'A fine-tuned model is frozen against a base that keeps improving. In six months the general model may beat your specialised one outright, and you now maintain a dataset, a training pipeline and an evaluation suite to keep that from being true. Budget for the maintenance, not just the training run.',
        },
        { kind: 'visual', id: 'adaptation-compare', caption: 'Compare the three approaches across cost, latency, freshness and effort.' },
        {
          kind: 'table',
          head: ['', 'Prompting', 'RAG', 'Fine-tuning'],
          rows: [
            ['Adds knowledge', 'A little, per call', 'Yes — and it stays current', 'Poorly and expensively'],
            ['Changes style / format', 'Yes', 'No', 'Yes, most reliably'],
            ['Setup time', 'Minutes', 'Days', 'Weeks'],
            ['Per-call cost', 'Low', 'Moderate (more input tokens)', 'Low (shorter prompts)'],
            ['Updating it', 'Edit text', 'Re-index documents', 'Retrain'],
            ['Citations', 'No', 'Yes', 'No'],
            ['Needs labelled data', 'A few examples', 'No', 'Hundreds to thousands'],
          ],
        },
        {
          kind: 'steps',
          items: [
            { title: 'Start with prompting', body: 'A clear instruction, a few examples, a schema. This resolves a surprising share of problems for the cost of an afternoon.' },
            { title: 'Add retrieval if the gap is knowledge', body: 'Private, changing or too-large-to-prompt information belongs in an index, not in weights.' },
            { title: 'Fine-tune if the gap is behaviour', body: 'A consistent output format, a domain tone, a narrow classification, or shorter prompts at very high volume.' },
            { title: 'Combine', body: 'A fine-tuned model that follows your format, retrieving current facts at query time, is the strongest configuration — and the most work.' },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Fine-tuning does not install facts reliably',
          body: 'Training on documents teaches the model the *style* of those documents far more strongly than their content, and any fact that changes requires another training run. If someone asks whether you can "fine-tune the model on our documentation so it knows our product", the answer is RAG.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ft-1',
            prompt: 'You need answers in a strict internal report format, every time, at high volume. Best tool?',
            options: [
              'RAG',
              'Fine-tuning — format consistency is exactly its strength, and it shortens every prompt',
              'A larger model',
              'Higher temperature',
            ],
            answer: 1,
            explanation:
              'Format and style are behavioural, which is what weight updates capture well. It also removes long format instructions from every request, which pays for itself at volume.',
          },
        },
      ],
      resources: [
        { label: 'Hugging Face PEFT documentation', url: 'https://huggingface.co/docs/peft/index', kind: 'docs' },
        { label: 'OpenAI fine-tuning guide', url: 'https://platform.openai.com/docs/guides/fine-tuning', kind: 'docs' },
      ],
      related: ['peft-lora-and-qlora', 'rag-pipeline'],
    },
    {
      slug: 'supervised-fine-tuning',
      title: 'Supervised fine-tuning and instruction tuning',
      module: 'fine-tuning',
      level: 'advanced',
      minutes: 11,
      summary: 'Dataset format, quality over quantity, and the hyperparameters that matter.',
      why: 'SFT is the workhorse of adaptation. Its outcome is determined almost entirely by dataset quality, which is where the work actually is.',
      prerequisites: ['when-to-fine-tune', 'optimisers-and-schedules'],
      outcomes: [
        'Build a correctly formatted SFT dataset',
        'Judge whether you have enough data',
        'Set learning rate and epochs without destroying the model',
      ],
      tags: ['sft', 'instruction tuning', 'datasets'],
      blocks: [

        {
          kind: 'text',
          body: 'Supervised fine-tuning continues training a pretrained model on your own examples of input and desired output. Mechanically it is ordinary training — the same loss, the same gradients — but at a far smaller learning rate, because the aim is to adjust behaviour rather than rebuild knowledge.',
        },
        {
          kind: 'text',
          body: 'The work is almost entirely the dataset. A few hundred genuinely good examples beat tens of thousands of mediocre ones, and the reason is that the model copies what it is shown with no ability to tell intent from accident. If a tenth of your examples hedge, the tuned model hedges. If they are inconsistently formatted, it formats inconsistently. The dataset is the specification.',
        },
        {
          kind: 'heading',
          text: 'What the data has to look like',
        },
        {
          kind: 'list',
          items: [
            '**Consistent.** One format, one voice, one way of refusing. Inconsistency is learned as randomness.',
            '**Representative.** Including the awkward inputs, not only the clean ones you would like users to send.',
            '**Correct.** Every example is an instruction. A wrong answer in the training set is a wrong answer taught deliberately.',
            '**Held out.** Keep an evaluation split from the same distribution before you start, or you cannot tell whether tuning helped.',
          ],
        },
        {
          kind: 'heading',
          text: 'Reading the run',
        },
        {
          kind: 'text',
          body: 'Training loss falling while validation loss rises is overfitting, and with small datasets it arrives within one or two epochs — far sooner than people expect. One to three epochs is typical; more usually memorises. The subtler risk is **catastrophic forgetting**: tune hard on a narrow task and general ability degrades, so the model gets better at your format and worse at everything around it. Evaluating only on your task hides this completely, which is why a general benchmark belongs in the loop too.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Tune a small model, not a large one',
          body: 'The usual winning configuration is a small model fine-tuned for one job, not a large one tuned to be slightly better at everything. It is cheaper to train, cheaper to serve, faster, and the narrower the task the smaller the model can be.',
        },
        {
          kind: 'code',
          lang: 'json',
          caption: 'The standard chat format — one JSON object per line',
          code: `{"messages": [
  {"role": "system", "content": "You classify support tickets."},
  {"role": "user", "content": "The checkout page returns a 502 on mobile."},
  {"role": "assistant", "content": "{\\"category\\": \\"bug\\", \\"severity\\": \\"high\\", \\"area\\": \\"checkout\\"}"}
]}
{"messages": [
  {"role": "system", "content": "You classify support tickets."},
  {"role": "user", "content": "Can I change my billing address?"},
  {"role": "assistant", "content": "{\\"category\\": \\"question\\", \\"severity\\": \\"low\\", \\"area\\": \\"billing\\"}"}
]}`,
        },
        {
          kind: 'list',
          items: [
            '**Quality decides the outcome.** A thousand carefully reviewed examples beat fifty thousand scraped ones. Every error in the data is a behaviour you are teaching.',
            '**Consistency matters more than volume.** If two examples format the same case differently, the model learns to be inconsistent.',
            '**Cover the edge cases.** Include the refusals, the ambiguous inputs and the empty inputs, or the model will improvise on them.',
            '**Hold out a real test set** before training, and never train on it.',
            '**Loss is masked to the response.** The model is trained to produce the assistant turn, not to reproduce your prompts.',
          ],
        },
        {
          kind: 'table',
          head: ['Setting', 'Typical', 'If wrong'],
          rows: [
            ['Learning rate', '1e-5 to 5e-5 (full), 1e-4 to 3e-4 (LoRA)', 'Too high destroys general ability'],
            ['Epochs', '1–3', 'More usually overfits and degrades everything else'],
            ['Batch size', 'As large as memory allows, with accumulation', 'Tiny batches give noisy updates'],
            ['Max sequence length', 'The longest example you actually need', 'Too long wastes memory, too short truncates labels'],
            ['Warmup', '3–10% of steps', 'Early instability'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Catastrophic forgetting',
          body: 'Training hard on a narrow task degrades everything else the model could do. Mitigations: fewer epochs, a lower learning rate, parameter-efficient methods, mixing in some general instruction data, and evaluating on general benchmarks as well as your own task.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'sft-1',
            prompt: 'After fine-tuning, your model is excellent at your task and now poor at everything else. Cause?',
            options: [
              'Too little training data',
              'Catastrophic forgetting from over-training on a narrow distribution',
              'The learning rate was too low',
              'Wrong tokenizer',
            ],
            answer: 1,
            explanation:
              'Narrow, aggressive training overwrites general capability. LoRA, fewer epochs and a mixed dataset all reduce it — and only a general eval alongside your task eval will catch it.',
          },
        },
      ],
      resources: [
        { label: 'Hugging Face TRL (SFTTrainer)', url: 'https://huggingface.co/docs/trl/index', kind: 'docs' },
        { label: 'LIMA: Less Is More for Alignment', url: 'https://arxiv.org/abs/2305.11206', kind: 'paper' },
      ],
      related: ['peft-lora-and-qlora', 'genai-evaluation'],
    },
    {
      slug: 'peft-lora-and-qlora',
      title: 'LoRA, QLoRA and parameter-efficient tuning',
      module: 'fine-tuning',
      level: 'expert',
      minutes: 10,
      summary: 'Training a low-rank update instead of the whole model, and quantising to fit on one GPU.',
      why: 'PEFT is what makes fine-tuning accessible: a 7B model on a single consumer GPU, adapters measured in megabytes, and one base model serving many tasks.',
      prerequisites: ['supervised-fine-tuning'],
      outcomes: [
        'Explain the low-rank decomposition LoRA trains',
        'Choose rank, alpha and target modules',
        'Say what QLoRA adds and what it costs',
      ],
      tags: ['lora', 'qlora', 'peft', 'quantisation'],
      blocks: [
        {
          kind: 'text',
          body: 'Full fine-tuning updates every weight, which needs memory for the parameters, their gradients and the optimiser state — roughly a dozen bytes per parameter. LoRA freezes the base model and learns a small additive update, factorised into two thin matrices.',
        },
        {
          kind: 'math',
          expr: 'W_effective = W_frozen + (B · A) · (α / r)',
          note: 'For a 4096x4096 layer at rank 8, A and B hold 65,536 trainable values instead of 16.7 million — about 0.4%.',
        },
        {
          kind: 'visual',
          id: 'lora',
          caption: 'Move the rank and watch the trainable share against the frozen matrix.',
        },
        {
          kind: 'table',
          head: ['Knob', 'Meaning', 'Guidance'],
          rows: [
            ['r (rank)', 'Capacity of the update', '8–16 for style and format; 32–64 for harder skills'],
            ['alpha', 'Scaling of the update', 'Commonly 2x r'],
            ['target_modules', 'Which layers get adapters', 'Attention projections first; adding the MLP helps on harder tasks'],
            ['dropout', 'Regularisation on the adapter', '0.05–0.1'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'QLoRA: a 4-bit base model with LoRA adapters on top',
          code: `from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

quant = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype="bfloat16",   # compute in bf16, store in 4-bit
)

base = AutoModelForCausalLM.from_pretrained(MODEL_ID, quantization_config=quant)

model = get_peft_model(base, LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    task_type="CAUSAL_LM",
))

model.print_trainable_parameters()
# trainable params: 8,388,608 || all params: 6,746,804,224 || trainable%: 0.1243`,
        },
        {
          kind: 'list',
          items: [
            '**Adapters are small and swappable** — tens of megabytes, so one served base model can host many task adapters.',
            '**Merging** — a LoRA can be folded into the base weights for inference, removing any adapter overhead.',
            '**QLoRA** — quantise the frozen base to 4-bit and train adapters in higher precision. Fits far larger models on one GPU, at some cost in throughput and a little quality.',
            '**Quantisation for serving** is a separate decision: 8-bit is usually nearly lossless, 4-bit is a measurable trade you should benchmark on your own task.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'lora-1',
            prompt: 'Why can LoRA train a 7B model on a 16 GB GPU when full fine-tuning cannot?',
            options: [
              'It uses a smaller model',
              'The base weights are frozen, so gradients and optimiser state exist only for the tiny adapters',
              'It trains for fewer epochs',
              'It skips backpropagation',
            ],
            answer: 1,
            explanation:
              'Optimiser state and gradients dominate training memory. Freezing the base removes them for 99%+ of parameters; the frozen weights themselves can be quantised further.',
          },
        },
      ],
      resources: [
        { label: 'LoRA paper', url: 'https://arxiv.org/abs/2106.09685', kind: 'paper' },
        { label: 'QLoRA paper', url: 'https://arxiv.org/abs/2305.14314', kind: 'paper' },
        { label: 'PEFT LoRA guide', url: 'https://huggingface.co/docs/peft/developer_guides/lora', kind: 'docs' },
      ],
      related: ['supervised-fine-tuning', 'serving-and-inference'],
    },
  ],
};
