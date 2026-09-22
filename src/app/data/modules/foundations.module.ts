import { Module } from '../../core/models/content.models';

export const foundationsModule: Module = {
  slug: 'foundations',
  title: 'Engineering Foundations',
  short: 'Foundations',
  stage: 0,
  level: 'beginner',
  tagline: 'The programming and tooling floor every AI role stands on.',
  description:
    'Before any model, you need to be able to write Python that other people can run, keep an ' +
    'environment reproducible, move data in and out of APIs, and use version control without ' +
    'fear. Skipping this stage is the single most common reason people stall three weeks into ' +
    'machine learning.',
  topics: [
    {
      slug: 'python-for-ml',
      title: 'Python for machine learning',
      module: 'foundations',
      level: 'beginner',
      minutes: 9,
      summary:
        'The subset of Python that ML work actually uses: data structures, comprehensions, functions, classes and typing.',
      why: 'Almost every ML library, training script and inference server you will touch is Python. You do not need all of the language — you need a narrow slice of it, used fluently.',
      outcomes: [
        'Choose between a list, dict, set and tuple without thinking about it',
        'Write comprehensions and generator expressions that stay readable',
        'Read a library signature and know what it wants',
      ],
      tags: ['python', 'programming', 'basics'],
      blocks: [
        {
          kind: 'text',
          body: 'Machine learning code is mostly **data plumbing**: load records, reshape them, hand them to a library, inspect what comes back. Four built-in structures cover almost all of it.',
        },
        {
          kind: 'table',
          head: ['Structure', 'Use it for', 'Cost of a lookup'],
          rows: [
            ['`list`', 'Ordered records, batches, sequences of tokens', 'O(n) by value, O(1) by index'],
            ['`dict`', 'Label → value maps, config, counting, JSON payloads', 'O(1) average'],
            ['`set`', 'Membership tests, deduplicating ids, vocabularies', 'O(1) average'],
            ['`tuple`', 'Fixed-shape records, dictionary keys, array shapes', 'O(1) by index'],
          ],
        },
        { kind: 'heading', text: 'Comprehensions are the ML idiom' },
        {
          kind: 'text',
          body: 'Nearly every preprocessing step is "transform each element, keep some". A comprehension says that in one line and stays faster than an append loop.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Preprocessing a batch of raw records',
          code: `raw = [
    {"text": "  Great value for money ", "stars": 5},
    {"text": "broke after a week", "stars": 1},
    {"text": "", "stars": 3},
]

# Clean, filter and label in one pass.
examples = [
    {"text": row["text"].strip().lower(), "label": int(row["stars"] >= 4)}
    for row in raw
    if row["text"].strip()
]

print(examples)
# [{'text': 'great value for money', 'label': 1},
#  {'text': 'broke after a week', 'label': 0}]`,
        },
        {
          kind: 'heading',
          text: 'Type hints are documentation the tooling can check',
        },
        {
          kind: 'text',
          body: 'You are not required to annotate anything, but annotations are how an editor tells you that `model.predict` wants a 2-D array before you wait ten minutes for a crash.',
        },
        {
          kind: 'code',
          lang: 'python',
          code: `from dataclasses import dataclass


@dataclass
class Example:
    text: str
    label: int


def batch(items: list[Example], size: int) -> list[list[Example]]:
    """Split a dataset into fixed-size batches; the last batch may be short."""
    return [items[i : i + size] for i in range(0, len(items), size)]


data = [Example(f"review {i}", i % 2) for i in range(5)]
print([len(b) for b in batch(data, 2)])  # [2, 2, 1]`,
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'What to skip for now',
          body: 'Metaclasses, descriptors, async, and multiple inheritance are not part of day-to-day ML work. Learn generators, context managers (`with`) and decorators instead — those three show up constantly in training loops and library APIs.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'py-1',
            prompt: 'You need to check 50,000 times whether a document id has already been seen. Which structure?',
            options: ['A list, with `in`', 'A set', 'A sorted list with bisect', 'A tuple'],
            answer: 1,
            explanation:
              'Membership in a list is a linear scan — 50,000 checks against a growing list is quadratic work. A set hashes the id and answers in constant time on average.',
          },
        },
      ],
      resources: [
        { label: 'Python official tutorial', url: 'https://docs.python.org/3/tutorial/', kind: 'docs' },
        { label: 'Python standard library reference', url: 'https://docs.python.org/3/library/', kind: 'docs' },
      ],
      related: ['numpy-arrays', 'environments-and-packaging'],
    },
    {
      slug: 'environments-and-packaging',
      title: 'Environments, packaging and reproducibility',
      module: 'foundations',
      level: 'beginner',
      minutes: 7,
      summary:
        'Virtual environments, pinned dependencies and the discipline that makes a result reproducible next month.',
      why: 'ML results are only meaningful if someone can rerun them. Almost all "it worked on my machine" failures in ML are a different library version, a different random seed, or a package installed globally by accident.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Create an isolated environment per project, by reflex',
        'Pin dependencies so a rerun installs the same versions',
        'Seed randomness so a training run can be repeated',
      ],
      tags: ['tooling', 'reproducibility', 'python'],
      blocks: [
        {
          kind: 'text',
          body: 'A virtual environment is a directory holding its own interpreter and packages. One per project means upgrading PyTorch for a new experiment cannot silently break last month’s.',
        },
        {
          kind: 'code',
          lang: 'bash',
          caption: 'The whole workflow',
          code: `python -m venv .venv
source .venv/bin/activate        # Windows: .venv\\Scripts\\activate

pip install numpy pandas scikit-learn
pip freeze > requirements.txt    # exact versions, committed to git

# Later, on any machine:
pip install -r requirements.txt`,
        },
        {
          kind: 'text',
          body: 'Tools such as `uv`, `poetry` and `conda` layer resolution and lock files on top of the same idea. Pick one and stay with it; the failure mode is mixing two in one project.',
        },
        { kind: 'heading', text: 'Reproducibility is more than package versions' },
        {
          kind: 'list',
          items: [
            '**Seeds** — set them for Python, NumPy and your framework, and record the value with the result.',
            '**Data version** — a model is a function of its training data; note which snapshot you used.',
            '**Hardware** — GPU kernels can differ from CPU at the last decimal, and non-deterministic kernels differ run to run.',
            '**Configuration** — keep hyperparameters in a file you commit, not in the notebook cell you edited nine times.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Seeding every source of randomness you control',
          code: `import os
import random

import numpy as np


def set_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import torch

        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    except ImportError:
        pass


set_seed(42)`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Seeds do not guarantee bit-identical results',
          body: 'Multi-threaded floating point addition is not associative, so GPU runs can differ slightly even with a fixed seed. Seed anyway — it removes the largest source of variance — but judge changes by whether they survive several seeds, not by a fourth decimal place.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'env-1',
            prompt: 'A colleague cannot reproduce your accuracy number. What do you check first?',
            options: [
              'Their GPU model',
              'The library versions and the data snapshot they used',
              'Their Python indentation',
              'The learning rate schedule',
            ],
            answer: 1,
            explanation:
              'Version drift and a different data snapshot explain the overwhelming majority of reproduction failures, and both are cheap to verify before anything else.',
          },
        },
      ],
      resources: [
        { label: 'Python venv documentation', url: 'https://docs.python.org/3/library/venv.html', kind: 'docs' },
        { label: 'pip user guide', url: 'https://pip.pypa.io/en/stable/user_guide/', kind: 'docs' },
      ],
      related: ['python-for-ml', 'experiment-tracking'],
    },
    {
      slug: 'git-and-collaboration',
      title: 'Git, GitHub and working in the open',
      module: 'foundations',
      level: 'beginner',
      minutes: 6,
      summary: 'Version control as an experiment log, not just a backup.',
      why: 'An ML project is a sequence of experiments. Git is what lets you answer "what exactly produced this number?" three weeks later, and it is how every team you will join moves code.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Branch, commit and merge without anxiety',
        'Write a commit history that explains an experiment',
        'Keep data and secrets out of the repository',
      ],
      tags: ['git', 'tooling', 'collaboration'],
      blocks: [
        {
          kind: 'text',
          body: 'The commands you need daily fit on one card. Everything else can be looked up when you hit it.',
        },
        {
          kind: 'code',
          lang: 'bash',
          code: `git switch -c feature/baseline-model   # new branch
git add src/train.py                   # stage specific files, not -A
git commit -m "Add logistic baseline: 0.81 F1 on validation"
git push -u origin feature/baseline-model

git log --oneline --graph              # what happened
git diff main..HEAD                    # what this branch changes
git restore --source=HEAD~1 src/train.py   # undo one file`,
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Commit messages are experiment notes',
          body: '"Fix" tells you nothing in six weeks. "Swap TF-IDF for sentence embeddings: +4 F1, 3x slower" tells you what you tried and what it bought.',
        },
        { kind: 'heading', text: 'What does not belong in a repository' },
        {
          kind: 'list',
          items: [
            'Datasets and model weights — they blow up clone size and git stores them badly. Use releases, a bucket, or a data-versioning tool.',
            'API keys and tokens — use environment variables; a key pushed once is a key to rotate.',
            'Notebook outputs with customer data — clear them, or strip them with a pre-commit hook.',
            'The virtual environment directory — that is what `requirements.txt` is for.',
          ],
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'git-1',
            prompt: 'You accidentally committed an API key and pushed it. What is the correct response?',
            options: [
              'Delete the line and commit again',
              'Rotate the key immediately, then clean the history',
              'Make the repository private',
              'Rename the variable',
            ],
            answer: 1,
            explanation:
              'The key is in the history and may already be scraped; removing the line changes nothing. Rotation is the fix, history cleanup is housekeeping afterwards.',
          },
        },
      ],
      resources: [
        { label: 'Pro Git (free book)', url: 'https://git-scm.com/book/en/v2', kind: 'book' },
        { label: 'GitHub documentation', url: 'https://docs.github.com/en', kind: 'docs' },
      ],
      related: ['environments-and-packaging', 'ci-cd-for-ml'],
    },
    {
      slug: 'shell-and-remote-machines',
      title: 'Shell, Linux and remote machines',
      module: 'foundations',
      level: 'beginner',
      minutes: 6,
      summary: 'Enough command line to drive a GPU box you do not own and keep a long job alive.',
      why: 'Training runs and inference servers live on Linux machines you reach over SSH. The terminal is the only interface you are guaranteed to have.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Navigate, inspect and move files from the shell',
        'Keep a long-running job alive after disconnecting',
        'Read logs and monitor resources while a job runs',
      ],
      tags: ['linux', 'tooling', 'infrastructure'],
      blocks: [
        {
          kind: 'code',
          lang: 'bash',
          caption: 'The everyday set',
          code: `ls -lh data/             # what is here and how big
du -sh data/*            # which directory is eating the disk
head -3 train.csv        # look before you load
wc -l train.csv          # how many rows
grep -c "ERROR" train.log
tail -f train.log        # watch a run as it goes

nvidia-smi               # GPU memory and utilisation
htop                     # CPU and RAM`,
        },
        {
          kind: 'text',
          body: 'A training run that outlives your SSH session needs a terminal multiplexer. `tmux new -s train`, start the job, then `Ctrl-b d` to detach; `tmux attach -t train` picks it back up from anywhere.',
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'Pipes are a data tool',
          body: 'Counting label distribution in a 4 GB CSV does not need pandas: `cut -d, -f3 train.csv | sort | uniq -c | sort -rn` answers it in seconds without loading the file into memory.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'shell-1',
            prompt: 'Your training job dies every time your laptop sleeps. The fix?',
            options: [
              'Increase the SSH timeout',
              'Run the job inside tmux or screen on the remote machine',
              'Train with a smaller batch size',
              'Use a faster network',
            ],
            answer: 1,
            explanation:
              'The job is a child of your SSH session, so it dies with it. A multiplexer session on the remote host owns the process instead, and survives the disconnect.',
          },
        },
      ],
      resources: [
        { label: 'The Missing Semester of Your CS Education (MIT)', url: 'https://missing.csail.mit.edu/', kind: 'course' },
        { label: 'tmux documentation', url: 'https://github.com/tmux/tmux/wiki', kind: 'docs' },
      ],
      related: ['git-and-collaboration', 'serving-and-inference'],
    },
    {
      slug: 'apis-json-and-http',
      title: 'APIs, JSON and HTTP',
      module: 'foundations',
      level: 'beginner',
      minutes: 7,
      summary: 'How data and models are actually exchanged: requests, status codes, JSON payloads and retries.',
      why: 'Every hosted model is an HTTP API, every dataset you fetch comes over one, and every model you deploy becomes one. This is the interface layer of the entire field.',
      prerequisites: ['python-for-ml'],
      outcomes: [
        'Call a JSON API and handle its failure modes',
        'Read an API reference and construct a request from it',
        'Retry safely without hammering a rate-limited service',
      ],
      tags: ['api', 'http', 'json'],
      blocks: [
        {
          kind: 'text',
          body: 'An HTTP request is a method, a URL, headers and an optional body. A response is a status code, headers and a body. Model APIs are that, with JSON in both directions.',
        },
        {
          kind: 'table',
          head: ['Status', 'Meaning', 'What to do'],
          rows: [
            ['200', 'Success', 'Parse the body'],
            ['400', 'Your request is malformed', 'Fix the payload — retrying will not help'],
            ['401 / 403', 'Bad or missing credentials', 'Check the key and its permissions'],
            ['404', 'Wrong URL or missing record', 'Check the path and the id'],
            ['429', 'Rate limited', 'Back off exponentially and retry'],
            ['5xx', 'The server failed', 'Retry with backoff; alert if it persists'],
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A request with a timeout, retries and backoff',
          code: `import time

import requests


def post_json(url: str, payload: dict, attempts: int = 4) -> dict:
    for attempt in range(attempts):
        response = requests.post(url, json=payload, timeout=30)

        if response.status_code < 400:
            return response.json()
        if response.status_code in (429, 500, 502, 503, 504):
            # Exponential backoff: 1s, 2s, 4s — do not hammer a struggling service.
            time.sleep(2**attempt)
            continue
        response.raise_for_status()

    raise RuntimeError(f"{url} failed after {attempts} attempts")`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Always set a timeout',
          body: 'Without one, a hung connection blocks your process indefinitely. This is the most common way a batch job silently stops making progress.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'api-1',
            prompt: 'A model API returns 429 on a third of your requests. What is the right fix?',
            options: [
              'Retry immediately in a tight loop',
              'Add exponential backoff with jitter, and batch requests where the API supports it',
              'Switch to a different model',
              'Increase the timeout',
            ],
            answer: 1,
            explanation:
              '429 means you are exceeding a rate limit. Immediate retries make it worse; backoff with jitter spreads the load, and batching reduces the number of calls.',
          },
        },
      ],
      resources: [
        { label: 'MDN HTTP reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', kind: 'docs' },
        { label: 'Requests library documentation', url: 'https://requests.readthedocs.io/', kind: 'docs' },
      ],
      related: ['serving-and-inference', 'llm-apis-and-parameters'],
    },
  ],
};
