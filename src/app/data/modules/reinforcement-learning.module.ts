import { Module } from '../../core/models/content.models';

export const reinforcementLearningModule: Module = {
  slug: 'reinforcement-learning',
  title: 'Reinforcement Learning',
  short: 'RL',
  stage: 14,
  level: 'advanced',
  tagline: 'Learning from consequences rather than from labelled answers.',
  description:
    'The third paradigm. Supervised learning needs the right answer for every example and ' +
    'unsupervised learning needs no answer at all; reinforcement learning has neither, only a ' +
    'reward that arrives late and says how well things went. This stage covers the formalism, the ' +
    'deep methods built on it, and RLHF — the reason a chat model answers the way it does.',
  topics: [
    {
      slug: 'rl-foundations',
      title: 'Agents, rewards and the Markov decision process',
      module: 'reinforcement-learning',
      level: 'advanced',
      minutes: 13,
      summary:
        'States, actions, rewards and policies — the formalism underneath every RL method, and Q-learning as the first algorithm that uses it.',
      why: 'Some problems have no labelled right answer, only outcomes you can score after the fact: a game you win or lose, a recommendation someone clicks or ignores, a robot that stays upright or falls. Supervised learning cannot express that, because there is nothing to put in the label column.',
      prerequisites: ['ml-fundamentals', 'probability-and-statistics'],
      outcomes: [
        'State a problem as an MDP: states, actions, rewards, transitions and discount',
        'Explain the difference between a value function and a policy',
        'Implement tabular Q-learning and say why it needs exploration',
        'Say why a delayed reward makes credit assignment the hard part',
      ],
      tags: ['reinforcement learning', 'q-learning', 'mdp', 'exploration'],
      blocks: [
        {
          kind: 'text',
          body: 'An **agent** observes a **state**, takes an **action**, and the environment returns a **reward** and a new state. That loop is the whole setting. What makes it hard is that the reward is usually late: the move that lost you the game happened twenty moves before the loss.',
        },
        {
          kind: 'table',
          head: ['Paradigm', 'What it is given', 'What it optimises'],
          rows: [
            ['Supervised', 'The correct output for each input', 'Error against the label'],
            ['Unsupervised', 'Inputs only', 'Structure in the data'],
            ['Reinforcement', 'A reward signal after acting', 'Total reward over time'],
          ],
          caption: 'RL is not a kind of supervised learning with extra steps; it has no labels to imitate.',
        },
        { kind: 'heading', text: 'The Markov decision process' },
        {
          kind: 'text',
          body: 'An MDP is the formal statement of that loop: a set of states, a set of actions, a transition function giving the probability of the next state, a reward function, and a discount factor. **Markov** means the next state depends only on the current state and action — history adds nothing once you know where you are.',
        },
        {
          kind: 'math',
          expr: 'G_t = r_t + γ·r_(t+1) + γ²·r_(t+2) + ...',
          note: 'The return is the discounted sum of all future rewards. γ near 0 makes the agent greedy for immediate reward; γ near 1 makes it patient. γ also keeps the sum finite when the task never ends.',
        },
        {
          kind: 'text',
          body: 'A **policy** is what the agent does — a mapping from state to action. A **value function** is what a state is worth — the return you expect from it if you follow the policy. Every RL method either learns values and derives a policy from them, learns the policy directly, or does both.',
        },
        { kind: 'heading', text: 'Q-learning' },
        {
          kind: 'text',
          body: 'The **action-value** Q(s, a) is the return you expect from taking action *a* in state *s* and behaving well afterwards. If you knew Q exactly, the best policy would be trivial: in each state, take the action with the highest Q.',
        },
        {
          kind: 'math',
          expr: 'Q(s,a) ← Q(s,a) + α·[ r + γ·max_a′ Q(s′,a′) − Q(s,a) ]',
          note: 'The bracket is the temporal-difference error: what the reward plus the next state was actually worth, minus what you predicted. Learning is nudging the prediction towards the observation.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'Tabular Q-learning. The whole algorithm is the update line.',
          code: `import numpy as np

q = np.zeros((n_states, n_actions))
alpha, gamma, epsilon = 0.1, 0.99, 0.1

for episode in range(episodes):
    state, done = env.reset(), False
    while not done:
        # Explore sometimes, otherwise take the current best guess.
        if np.random.rand() < epsilon:
            action = np.random.randint(n_actions)
        else:
            action = int(np.argmax(q[state]))

        next_state, reward, done = env.step(action)

        target = reward + gamma * np.max(q[next_state]) * (not done)
        q[state, action] += alpha * (target - q[state, action])

        state = next_state`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Exploration is not optional',
          body: 'An agent that always takes its current best action never discovers that a different one is better — it converges confidently onto a mediocre policy. ε-greedy is the crude fix: act randomly a small fraction of the time. The same trade-off appears without any states at all in the **multi-armed bandit** problem, which is where to start if the full MDP feels abstract.',
        },
        { kind: 'heading', text: 'On-policy and off-policy' },
        {
          kind: 'text',
          body: '**SARSA** updates towards the action the agent actually took next; **Q-learning** updates towards the best available action, whether or not it took it. So Q-learning learns the optimal policy while behaving exploratively — it is *off-policy*. That distinction decides whether you can learn from logged data someone else generated, which in production is usually the only data you have.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rl-1',
            prompt: 'Why does a discount factor γ < 1 appear in the return?',
            options: [
              'To make the model train faster',
              'To keep the sum finite and express a preference for sooner rewards',
              'To normalise the rewards to the range 0–1',
              'To prevent overfitting to the training episodes',
            ],
            answer: 1,
            explanation:
              'In a task that never terminates, an undiscounted sum of rewards diverges and every policy looks equally infinite. Discounting makes the return finite and encodes how much a reward now is worth against a reward later.',
          },
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rl-2',
            prompt: 'Your agent reaches a decent score quickly and then never improves. What do you check first?',
            options: [
              'The learning rate is too low',
              'The exploration rate has collapsed, so it stopped trying alternatives',
              'The network is too small',
              'The discount factor is too high',
            ],
            answer: 1,
            explanation:
              'Plateauing early at a mediocre policy is the signature of too little exploration: the agent keeps exploiting the first workable strategy it found and never samples the actions that would reveal a better one.',
          },
        },
      ],
      resources: [
        {
          label: 'Sutton and Barto, Reinforcement Learning: An Introduction',
          url: 'https://www.andrew.cmu.edu/course/10-703/textbook/BartoSutton.pdf',
          kind: 'book',
        },
        {
          label: 'Gymnasium — the standard RL environment API',
          url: 'https://gymnasium.farama.org/',
          kind: 'docs',
        },
      ],
      related: ['what-is-an-agent', 'deep-rl-and-policy-methods'],
    },

    {
      slug: 'deep-rl-and-policy-methods',
      title: 'Deep Q-networks, policy gradients and PPO',
      module: 'reinforcement-learning',
      level: 'expert',
      minutes: 12,
      summary:
        'What changes when the state space is too large for a table: function approximation, and learning a policy directly instead of a value.',
      why: 'A Q-table needs one row per state. A video frame or a sentence has more states than there are atoms in the universe, so the table has to become a network — and almost every guarantee that made tabular Q-learning stable disappears at the same moment.',
      prerequisites: ['rl-foundations', 'backpropagation'],
      outcomes: [
        'Explain why replacing the Q-table with a network destabilises training',
        'Describe what replay buffers and target networks each fix',
        'Contrast value-based and policy-gradient methods',
        'Say what PPO clips, and why unconstrained policy updates collapse',
      ],
      tags: ['dqn', 'policy gradient', 'ppo', 'actor-critic'],
      blocks: [
        {
          kind: 'text',
          body: 'Replace Q(s, a) with a network Q(s, a; θ) and the update becomes a regression: predict the temporal-difference target, take a gradient step. That is a **deep Q-network**. It also breaks two assumptions supervised learning relies on.',
        },
        {
          kind: 'list',
          items: [
            '**The data is not independent.** Consecutive frames are nearly identical, so a batch carries almost no new information and the network overfits whatever it is currently doing.',
            '**The target moves.** You regress towards a value computed by the same network you are updating, so the thing you are chasing shifts every step.',
          ],
        },
        {
          kind: 'table',
          head: ['Problem', 'Fix', 'What it does'],
          rows: [
            ['Correlated samples', 'Replay buffer', 'Store transitions, sample batches at random'],
            ['Moving target', 'Target network', 'A frozen copy of the weights, refreshed occasionally'],
            ['Overestimated values', 'Double DQN', 'Choose the action with one network, value it with the other'],
          ],
        },
        { kind: 'heading', text: 'Learning the policy directly' },
        {
          kind: 'text',
          body: 'Value methods learn what states are worth and act greedily. **Policy-gradient** methods skip the middle step and adjust the policy parameters in the direction that raises expected return. That matters when actions are continuous — a steering angle has no `argmax` over a finite set — and when the best policy is genuinely stochastic.',
        },
        {
          kind: 'math',
          expr: '∇J(θ) = E[ ∇log π(a|s; θ) · A(s,a) ]',
          note: 'Push up the log-probability of actions that did better than expected, push down the ones that did worse. A is the advantage: how much better the action was than the state average.',
        },
        {
          kind: 'text',
          body: '**Actor-critic** runs both: the *actor* is the policy, the *critic* estimates the value used to compute the advantage. The critic reduces the variance that makes plain policy gradients so noisy.',
        },
        { kind: 'heading', text: 'Why PPO exists' },
        {
          kind: 'text',
          body: 'A policy gradient step that is too large can move the policy somewhere much worse, and unlike supervised learning there is no fixed dataset to recover from — the next batch is collected *by the damaged policy*. Failure compounds. **PPO** prevents it by clipping the update so the new policy cannot move far from the old one in a single step.',
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Why PPO turns up in LLM training',
          body: 'PPO is the algorithm in classic RLHF. The reason is exactly the property above: a language model being tuned against a reward model is generating its own next batch, so an over-large update poisons the data it will learn from next. Clipping is what keeps the thing from collapsing into gibberish that happens to score well.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'drl-1',
            prompt: 'What is a replay buffer for?',
            options: [
              'To save memory during training',
              'To break the correlation between consecutive samples',
              'To store the best episodes for later imitation',
              'To keep a copy of the weights for the target network',
            ],
            answer: 1,
            explanation:
              'Consecutive transitions are highly correlated, which violates the independence that stochastic gradient descent assumes. Sampling randomly from a buffer of past transitions restores something closer to i.i.d. batches.',
          },
        },
      ],
      resources: [
        {
          label: 'Proximal Policy Optimization Algorithms (Schulman et al., 2017)',
          url: 'https://arxiv.org/abs/1707.06347',
          kind: 'paper',
        },
        {
          label: 'Spinning Up in Deep RL — OpenAI',
          url: 'https://spinningup.openai.com/en/latest/',
          kind: 'docs',
        },
      ],
      related: ['rl-foundations', 'rlhf-and-preference-tuning'],
    },

    {
      slug: 'rlhf-and-preference-tuning',
      title: 'RLHF, reward models and DPO',
      module: 'reinforcement-learning',
      level: 'expert',
      minutes: 12,
      summary:
        'How a model that merely predicts text becomes one that answers helpfully — and what preference tuning optimises that pretraining cannot.',
      why: 'A pretrained language model completes text; it has no notion of being helpful, and asking it a question may simply produce more questions. Supervised fine-tuning teaches the shape of an answer, but "which of these two answers is better" is a judgement nobody can write down as a single target string.',
      prerequisites: ['rl-foundations', 'supervised-fine-tuning'],
      outcomes: [
        'Describe the three stages of the classic RLHF pipeline',
        'Explain what a reward model is trained on and why it is comparative',
        'Contrast RLHF with DPO and say why DPO became the default',
        'Recognise reward hacking and the reason a KL penalty is applied',
      ],
      tags: ['rlhf', 'dpo', 'reward model', 'alignment'],
      blocks: [
        {
          kind: 'text',
          body: 'Preferences are easy to *compare* and hard to *write*. Nobody can author the single ideal reply to a question, but almost anyone can look at two replies and say which is better. RLHF is built entirely on that asymmetry.',
        },
        {
          kind: 'steps',
          items: [
            {
              title: 'Supervised fine-tuning',
              body: 'Train on demonstrations of the behaviour you want, so the model produces answers rather than continuations. This sets the format; it does not set the quality bar.',
            },
            {
              title: 'Train a reward model',
              body: 'Collect pairs of responses ranked by humans, and train a model to score a response so that the preferred one always scores higher. The reward model is a learned stand-in for human judgement.',
            },
            {
              title: 'Optimise the policy against it',
              body: 'Use PPO to adjust the language model so its responses score highly under the reward model, with a KL penalty pulling it back towards the supervised model.',
            },
          ],
        },
        {
          kind: 'math',
          expr: 'objective = E[ r(x, y) ] − β · KL( π(y|x) ‖ π_ref(y|x) )',
          note: 'Maximise reward, but stay close to the reference model. β controls the leash. Without it the policy drifts into degenerate text that scores well and reads like nothing a person would write.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Reward hacking',
          body: 'The reward model is an approximation of human preference, and any approximation can be exploited. Optimise hard enough and the policy finds inputs where the reward model is wrong — answers that are long, hedged and confident-sounding because those correlated with quality in the training pairs. High reward, worse model. This is why the KL term is not a detail.',
        },
        { kind: 'heading', text: 'Direct preference optimisation' },
        {
          kind: 'text',
          body: 'RLHF is three models and an RL loop, and it is fragile. **DPO** shows the same objective can be optimised directly on the preference pairs, with no separate reward model and no sampling loop — the ranking loss itself carries the signal.',
        },
        {
          kind: 'table',
          head: ['', 'RLHF (PPO)', 'DPO'],
          rows: [
            ['Models in play', 'Policy, reference, reward, value', 'Policy and reference'],
            ['Training loop', 'Generate, score, update', 'Standard supervised loop'],
            ['Stability', 'Sensitive to hyperparameters', 'Markedly more forgiving'],
            ['Still useful because', 'An explicit reward model can be reused and inspected', 'Simpler to run and reproduce'],
          ],
        },
        {
          kind: 'text',
          body: 'DPO and its relatives are now the default for most teams, precisely because they collapse an RL problem back into a supervised one. RLHF remains worth understanding: the reward model is a reusable artefact, and every failure mode of preference tuning is easier to see in its explicit form.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rlhf-1',
            prompt: 'Why is a reward model trained on comparisons rather than absolute scores?',
            options: [
              'Comparisons are cheaper to collect at scale',
              'People rank two options consistently, but their absolute scores drift',
              'Absolute scores cannot be used as a training target',
              'It makes the reward model smaller',
            ],
            answer: 1,
            explanation:
              'Ask ten annotators to score a response out of ten and you get ten different scales that also shift over a session. Ask which of two is better and agreement is far higher, so the comparative signal is the one worth training on.',
          },
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rlhf-2',
            prompt: 'After preference tuning, your model produces long, hedged answers that score well but read poorly. What is happening?',
            options: [
              'The learning rate is too high',
              'The policy is exploiting the reward model — reward hacking',
              'The supervised fine-tuning stage was skipped',
              'The KL penalty is too strong',
            ],
            answer: 1,
            explanation:
              'The policy has found a region where the reward model over-scores: length and hedging correlated with quality in the preference data, so maximising the proxy diverges from the goal. Raising β or stopping earlier keeps it nearer the reference model.',
          },
        },
      ],
      resources: [
        {
          label: 'Training language models to follow instructions with human feedback (Ouyang et al., 2022)',
          url: 'https://arxiv.org/abs/2203.02155',
          kind: 'paper',
        },
        {
          label: 'Direct Preference Optimization (Rafailov et al., 2023)',
          url: 'https://arxiv.org/abs/2305.18290',
          kind: 'paper',
        },
        {
          label: 'TRL — preference tuning in the Hugging Face stack',
          url: 'https://huggingface.co/docs/trl/index',
          kind: 'docs',
        },
      ],
      related: ['supervised-fine-tuning', 'peft-lora-and-qlora', 'genai-evaluation'],
    },
  ],
};