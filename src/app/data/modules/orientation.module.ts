import { Module } from '../../core/models/content.models';

export const orientationModule: Module = {
  slug: 'orientation',
  title: 'Start Here: What AI Actually Is',
  short: 'Start Here',
  stage: 0,
  level: 'beginner',
  tagline: 'No code, no mathematics — just what these words mean and what the machines can do.',
  description:
    'Everything after this stage assumes you know roughly what machine learning is and why ' +
    'anyone bothers. This stage assumes nothing at all. If the words AI, machine learning, deep ' +
    'learning and generative AI blur together, or you have never written a line of code, start ' +
    'here and read it in order. There is nothing to install.',
  topics: [
    {
      slug: 'what-is-ai',
      title: 'AI, machine learning, deep learning: what the words mean',
      module: 'orientation',
      level: 'beginner',
      minutes: 7,
      summary:
        'Four terms that get used interchangeably, what each one actually refers to, and how they nest inside each other.',
      why: 'These words are used loosely in news articles and job adverts, which leaves beginners unsure whether they are four things or one. They are nested categories, and once you see the nesting the rest of the field stops looking like a wall of jargon.',
      outcomes: [
        'Explain the difference between AI, machine learning, deep learning and generative AI',
        'Say what "a model" is in one sentence',
        'Tell which category a given product belongs to',
      ],
      tags: ['basics', 'orientation', 'definitions'],
      blocks: [
        {
          kind: 'text',
          body: 'Think of four circles, each inside the last.',
        },
        {
          kind: 'table',
          head: ['Term', 'What it means', 'Example'],
          rows: [
            [
              '**Artificial intelligence**',
              'The whole field: getting computers to do things that normally need human judgement. Includes approaches that involve no learning at all.',
              'A chess program following hand-written rules',
            ],
            [
              '**Machine learning**',
              'A part of AI where the computer works out the rules *from examples* instead of being told them.',
              'A spam filter that learned from a million emails marked spam or not',
            ],
            [
              '**Deep learning**',
              'A part of machine learning that uses neural networks with many layers. Good at messy input — images, audio, language.',
              'Face unlock on a phone',
            ],
            [
              '**Generative AI**',
              'A part of deep learning where the output is new content rather than a label or a number.',
              'A chatbot writing an email, or a tool generating an image',
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'So what is a "model"?',
          body: 'A model is the thing that comes out of the learning process — a file full of numbers that turns an input into an output. That is genuinely all it is. "Training a model" means adjusting those numbers until the outputs are good. "Running a model" means feeding it a new input and reading the output.',
        },
        { kind: 'heading', text: 'The one real difference from ordinary software' },
        {
          kind: 'text',
          body: 'In ordinary software, a person writes the rules: *if the email contains "free money", mark it as spam.* That breaks the moment someone writes "fr33 money".',
        },
        {
          kind: 'text',
          body: 'In machine learning, nobody writes that rule. You show the computer a large pile of emails already labelled spam or not spam, and it finds the patterns itself. Those patterns are usually too subtle and too numerous for a person to have written down — which is the entire point, and also why a model can be wrong in ways nobody can fully explain.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'What these systems cannot do',
          body: 'They do not understand anything the way a person does, they have no goals of their own, and they are confidently wrong on a regular basis. A language model produces text that *looks like* correct text — which is usually the same thing, and sometimes is not. Keeping that distinction in mind is most of what separates a careful engineer from a disappointed one.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ori-1',
            prompt: 'A tool that writes a product description from a photo. Which categories does it belong to?',
            options: [
              'Only generative AI',
              'Generative AI, and therefore also deep learning, machine learning and AI',
              'Machine learning but not AI',
              'Deep learning but not machine learning',
            ],
            answer: 1,
            explanation:
              'The four are nested. Anything that is generative AI is also deep learning, which is also machine learning, which is also AI. The narrowest accurate label is the useful one, but the wider ones are still true.',
          },
        },
      ],
      resources: [
        { label: 'Google: introduction to machine learning', url: 'https://developers.google.com/machine-learning/intro-to-ml', kind: 'course' },
        { label: 'Elements of AI (free introductory course)', url: 'https://www.elementsofai.com/', kind: 'course' },
      ],
      related: ['how-machines-learn', 'ai-in-the-wild'],
    },
    {
      slug: 'how-machines-learn',
      title: 'How a machine actually learns',
      module: 'orientation',
      level: 'beginner',
      minutes: 8,
      summary:
        'Examples in, pattern out, prediction on something new — the whole idea, without a single equation.',
      why: 'Every technique in this curriculum is a variation on one loop: guess, measure how wrong the guess was, adjust, repeat. Seeing that loop once, in plain language, makes everything later feel like detail rather than magic.',
      prerequisites: ['what-is-ai'],
      outcomes: [
        'Describe the guess-measure-adjust loop in your own words',
        'Explain what training data is and why its quality decides everything',
        'Say why a model that is perfect on its examples may still be useless',
      ],
      tags: ['basics', 'training', 'intuition'],
      blocks: [
        {
          kind: 'text',
          body: 'Suppose you want to predict the price of a flat from its size. You have a list of flats that have already sold: size, and what it sold for. That list is your **training data**.',
        },
        {
          kind: 'steps',
          items: [
            {
              title: 'Guess',
              body: 'The computer starts with a rule pulled out of thin air — say, "price = size x 100". It is almost certainly wrong.',
            },
            {
              title: 'Measure the error',
              body: 'It applies that rule to every flat in the list and compares the guess with the real price. The total gap is the **loss** — one number saying how wrong the rule is overall.',
            },
            {
              title: 'Adjust',
              body: 'It nudges the rule in whichever direction makes that number smaller. Perhaps 100 becomes 112.',
            },
            {
              title: 'Repeat',
              body: 'Thousands of times, until nudging further stops helping. What remains is the **trained model**.',
            },
            {
              title: 'Predict',
              body: 'Now give it a flat that was never in the list. It applies the rule it worked out and produces a price. That is the only part users ever see.',
            },
          ],
        },
        { kind: 'visual', id: 'gradient-descent', caption: 'That loop, drawn. The ball rolls downhill towards the least-wrong rule — press play and move the step size.' },
        {
          kind: 'text',
          body: 'Real models do this with millions of numbers instead of one, and the inputs can be pixels or words rather than a single size. The loop does not change. When you later read about gradient descent, loss functions and backpropagation, they are the precise machinery of these five steps.',
        },
        { kind: 'heading', text: 'Why a perfect score can mean nothing' },
        {
          kind: 'text',
          body: 'A model could memorise every flat in your list and score perfectly on it, while being useless on a flat it has not seen — the same way memorising past exam answers does not mean you understand the subject. This is called **overfitting**, and guarding against it is why you always hold some examples back and test on those instead.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'The data matters more than the algorithm',
          body: 'Beginners assume the clever part is the algorithm. In practice, teams spend most of their time on the examples: collecting them, correcting them, and checking they represent the real situation. A simple method on good data beats a sophisticated one on bad data, essentially always.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ori-2',
            prompt: 'A model predicts every flat in its training list perfectly, but is wildly wrong on new flats. What happened?',
            options: [
              'It needs more training',
              'It memorised the examples instead of learning the pattern',
              'The prices were too high',
              'It needs a faster computer',
            ],
            answer: 1,
            explanation:
              'That is overfitting. More training makes it worse, not better. The fixes are more varied examples, a simpler model, or stopping the training earlier — all covered later in the curriculum.',
          },
        },
      ],
      resources: [
        { label: '3Blue1Brown — but what is a neural network?', url: 'https://www.3blue1brown.com/topics/neural-networks', kind: 'video' },
        { label: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', kind: 'course' },
      ],
      related: ['what-is-ai', 'ml-fundamentals'],
    },
    {
      slug: 'ai-in-the-wild',
      title: 'Where AI is actually used, and who builds it',
      module: 'orientation',
      level: 'beginner',
      minutes: 7,
      summary:
        'The applications you already use, the shape of a real AI project, and the roles that do the work.',
      why: 'It is much easier to learn a subject when you can see where it ends up. This also tells you which parts of the curriculum matter most for the job you actually want.',
      prerequisites: ['how-machines-learn'],
      outcomes: [
        'Name the common application shapes and what each one predicts',
        'Describe the stages of a real AI project beyond the model',
        'Pick which role you are aiming at, so you know what to read closely',
      ],
      tags: ['orientation', 'careers', 'applications'],
      blocks: [
        {
          kind: 'table',
          head: ['Shape', 'What it predicts', 'You have used it as'],
          rows: [
            ['Classification', 'Which category something belongs to', 'Spam filtering, fraud alerts, medical screening'],
            ['Regression', 'A number', 'Delivery time estimates, price predictions'],
            ['Ranking / recommendation', 'What to show first', 'Search results, a video feed, "you may also like"'],
            ['Generation', 'New text, images, audio or code', 'Chat assistants, image tools, code completion'],
            ['Extraction', 'Structured facts out of messy input', 'Scanning an invoice, pulling dates out of an email'],
            ['Clustering', 'Groups nobody labelled in advance', 'Customer segments, grouping support tickets'],
          ],
        },
        {
          kind: 'note',
          tone: 'info',
          title: 'The model is the small part',
          body: 'A working AI product is mostly other things: getting the data, cleaning it, deciding what "correct" even means, serving predictions fast enough, watching for the day it quietly stops working, and handling the cases it gets wrong. If you enjoy that engineering, this field has a great deal of work for you.',
        },
        { kind: 'heading', text: 'Who does what' },
        {
          kind: 'list',
          items: [
            '**Data scientist** — investigates, runs experiments, and answers questions with data. Heaviest on statistics.',
            '**ML engineer** — takes models into production and keeps them working. Software engineering plus ML depth.',
            '**AI engineer** — builds products on top of existing models, with APIs, retrieval and agents. The widest door for someone who can already code.',
            '**LLM engineer** — adapts and serves language models: fine-tuning, quantisation, inference cost.',
            '**Data engineer / ML platform engineer** — builds the pipelines and infrastructure everyone else depends on.',
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'You do not have to choose now',
          body: 'The first eight stages are shared ground for all of these roles. Read them in order, build a couple of the projects, and the choice will make itself once you find which part you enjoy. The [roles topic](https://vivekkumarq.github.io/neuralpath/learn/mlops/ai-roles) covers the differences in detail once you have the context to care.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ori-3',
            prompt: 'A system that reads a scanned invoice and fills in supplier, amount and due date. Which shape is that?',
            options: ['Clustering', 'Extraction', 'Ranking', 'Regression'],
            answer: 1,
            explanation:
              'It pulls structured fields out of messy input, which is extraction. It is one of the most common commercial uses of AI, and one where modern models changed what is possible.',
          },
        },
      ],
      resources: [
        { label: 'Google: rules of machine learning', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml', kind: 'docs' },
        { label: 'Made With ML', url: 'https://madewithml.com/', kind: 'course' },
      ],
      related: ['ai-roles', 'programming-from-zero'],
    },
  ],
};
