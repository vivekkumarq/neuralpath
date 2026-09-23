import { Module } from '../../core/models/content.models';

export const aiAgentsModule: Module = {
  slug: 'ai-agents',
  title: 'AI Agents',
  short: 'Agents',
  stage: 13,
  level: 'advanced',
  tagline: 'Loops, tools, memory, orchestration and the reliability problem.',
  description:
    'An agent is a model in a loop with tools and a goal. The concepts are simple; making one ' +
    'dependable is not. This stage covers the engineering — state, error handling, limits, ' +
    'evaluation and guardrails — rather than promoting any particular framework.',
  topics: [
    {
      slug: 'what-is-an-agent',
      title: 'What an agent actually is',
      module: 'ai-agents',
      level: 'advanced',
      minutes: 9,
      summary: 'The agent loop, the workflow/agent distinction, and when to use which.',
      why: 'Much of what is marketed as an agent is a fixed pipeline with an LLM in it — which is often the better design. Knowing the difference keeps you from adding non-determinism you did not need.',
      prerequisites: ['structured-output-and-tools'],
      outcomes: [
        'Describe the perceive–decide–act loop',
        'Choose between a fixed workflow and an autonomous loop',
        'Set the limits every loop needs before it runs',
      ],
      tags: ['agents', 'loops', 'workflows'],
      blocks: [
        { kind: 'visual', id: 'agent-loop', caption: 'The loop: observe, decide, act, observe again.' },
        {
          kind: 'text',
          body: 'An agent receives a goal, decides on an action, executes it through a tool, observes the result, and repeats until it believes the goal is met or a limit stops it. The model provides the decision; your code provides everything else — and everything else is where reliability comes from.',
        },
        {
          kind: 'table',
          head: ['', 'Workflow', 'Agent'],
          rows: [
            ['Control flow', 'You write it', 'The model chooses it'],
            ['Predictability', 'High', 'Low'],
            ['Debugging', 'Straightforward', 'Hard — the path differs per run'],
            ['Cost per request', 'Known', 'Variable'],
            ['Fits', 'Known task shapes', 'Open-ended tasks where the steps are not knowable in advance'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Prefer the most constrained design that solves the problem',
          body: 'Classify, then retrieve, then answer is a workflow, and it will be cheaper, faster and more debuggable than an agent given three tools and asked to work it out. Reach for an autonomous loop when the number of steps genuinely depends on what is discovered along the way.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A loop with the limits that make it safe to run',
          code: `MAX_STEPS = 8
MAX_TOKENS_BUDGET = 60_000


def run(goal: str) -> str:
    messages = [{"role": "user", "content": goal}]
    spent = 0

    for step in range(MAX_STEPS):
        reply = llm(messages, tools=TOOLS)
        spent += reply.usage.total_tokens

        if spent > MAX_TOKENS_BUDGET:
            return "Stopped: token budget exhausted."
        if not reply.tool_calls:
            return reply.text

        messages.append(reply.as_message())
        for call in reply.tool_calls:
            # Every tool result, including failures, goes back as an observation.
            result = execute(call)          # validates args and authorisation
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

    return "Stopped: step limit reached without a final answer."`,
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'ag-1',
            prompt: 'An agent repeats the same failing tool call until it times out. What is missing?',
            options: [
              'A larger model',
              'A step limit, plus feeding the error back as an observation the model must respond to differently',
              'A higher temperature',
              'More tools',
            ],
            answer: 1,
            explanation:
              'Loops need hard stops and informative failures. A bare "error" invites a retry; the error text plus a visible attempt count gives the model something to act on, and the limit guarantees termination either way.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic: building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents', kind: 'docs' },
        { label: 'ReAct paper', url: 'https://arxiv.org/abs/2210.03629', kind: 'paper' },
      ],
      related: ['tool-calling', 'agent-reliability'],
    },
    {
      slug: 'tool-calling',
      title: 'Tools: design, execution and errors',
      module: 'ai-agents',
      level: 'advanced',
      minutes: 9,
      summary: 'What makes a tool usable by a model, and how to handle failures inside a loop.',
      why: 'Tools are the agent’s only way to affect anything. Their design determines whether the agent succeeds, and their implementation determines whether a mistake is recoverable.',
      prerequisites: ['what-is-an-agent'],
      outcomes: [
        'Write tool definitions a model selects correctly',
        'Return errors that lead to recovery rather than retries',
        'Decide which actions require human approval',
      ],
      tags: ['tools', 'function calling', 'errors'],
      blocks: [
        {
          kind: 'list',
          items: [
            '**One clear purpose each.** `search_orders` and `refund_order` beat one `manage_orders(action)`.',
            '**Descriptions written for a new colleague.** What it does, when to use it, what it returns, what it will not do.',
            '**Typed, constrained parameters.** Enums over free strings; explicit formats for dates and ids.',
            '**Few of them.** Twenty tools in one prompt degrades selection accuracy; group them by phase and register only what the current step needs.',
            '**Idempotent where possible.** A retry must not create a second refund.',
          ],
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A tool definition and an error worth returning',
          code: `TOOL = {
    "name": "get_order_status",
    "description": (
        "Look up the current status of a customer order. "
        "Use when the user asks where an order is or whether it shipped. "
        "Returns status, carrier and estimated delivery date. "
        "Does not modify the order."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "pattern": "^ORD-[0-9]{6}$"},
        },
        "required": ["order_id"],
    },
}


def get_order_status(order_id: str, user_id: str) -> dict:
    order = db.orders.find(order_id)
    if order is None:
        # Actionable: tells the model what to do next, not just that it failed.
        return {"error": "not_found",
                "message": f"No order {order_id}. Ask the user to confirm the id, "
                           f"or use search_orders with their email."}
    if order.user_id != user_id:
        # Authorisation is enforced here, never in the prompt.
        return {"error": "forbidden", "message": "This order belongs to another account."}
    return {"status": order.status, "carrier": order.carrier, "eta": order.eta}`,
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Draw the line at irreversible actions',
          body: 'Reads can be autonomous. Writes that move money, send messages, delete data or change permissions should require explicit confirmation, or be staged as a proposal a human approves. An agent that can email customers unsupervised is one prompt injection away from an incident.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'tool-2',
            prompt: 'Which tool set will an agent use most accurately?',
            options: [
              'One `execute(command)` tool that can do anything',
              'Four narrow tools with typed parameters and clear descriptions',
              'Twenty-five tools covering every endpoint',
              'Tools with no descriptions, named after the endpoints',
            ],
            answer: 1,
            explanation:
              'Selection accuracy falls as the choice grows and as descriptions get vaguer. A small set of unambiguous, well-documented tools is the most reliable configuration — and the easiest to secure.',
          },
        },
      ],
      resources: [
        { label: 'Anthropic tool use', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', kind: 'docs' },
        { label: 'Model Context Protocol', url: 'https://modelcontextprotocol.io/', kind: 'docs' },
      ],
      related: ['agent-memory-and-state', 'security-and-privacy'],
    },
    {
      slug: 'agent-memory-and-state',
      title: 'Memory, state and orchestration',
      module: 'ai-agents',
      level: 'advanced',
      minutes: 9,
      summary: 'What an agent remembers, where that lives, and how multi-step work is coordinated.',
      why: 'Context windows are finite and loops are long. Where state lives decides whether an agent can be resumed, audited and debugged — or whether a crash loses everything.',
      prerequisites: ['what-is-an-agent'],
      outcomes: [
        'Separate working memory, session memory and long-term memory',
        'Keep durable state outside the context window',
        'Choose between single-agent and multi-agent orchestration',
      ],
      tags: ['memory', 'state', 'multi-agent', 'orchestration'],
      blocks: [
        {
          kind: 'table',
          head: ['Kind', 'Holds', 'Lives in', 'Lifetime'],
          rows: [
            ['Working', 'The current loop’s messages and tool results', 'The context window', 'One request'],
            ['Session', 'Conversation history', 'A database, windowed or summarised', 'One conversation'],
            ['Long-term', 'Facts and preferences worth recalling', 'A store, retrieved when relevant', 'Indefinite'],
            ['Task state', 'Progress, artefacts, what has already run', 'Your database', 'Until the task completes'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'The context window is not a database',
          body: 'Anything that must survive a crash, a resume or an audit belongs in persistent storage, with the context window holding only what the current decision needs. This is also what makes a long-running agent inspectable while it runs.',
        },
        { kind: 'heading', text: 'Orchestration patterns' },
        {
          kind: 'list',
          items: [
            '**Single agent, many tools** — the simplest thing that works. Start here.',
            '**Chain** — fixed sequence of specialised calls. Predictable and easy to test.',
            '**Router** — one classifier call dispatches to a specialised handler. Cheap and very effective.',
            '**Orchestrator and workers** — a planner splits work, workers execute in parallel, results are merged. Good for research and multi-document tasks.',
            '**Reflection** — a second pass critiques the first. Improves quality on writing and code; roughly doubles cost.',
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Multi-agent multiplies failure modes',
          body: 'Every handoff is a place for context to be lost and for cost to double. Add a second agent when a single one demonstrably cannot do the job — not because the architecture diagram looks better with more boxes.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'mem-1',
            prompt: 'A long-running agent crashes at step 40 of 60 and restarts from scratch. What was missing?',
            options: [
              'A larger context window',
              'Task state persisted outside the context, so completed steps and artefacts can be resumed',
              'More tools',
              'A different model',
            ],
            answer: 1,
            explanation:
              'Progress kept only in the message history dies with the process. Checkpointing each completed step to durable storage makes the run resumable and auditable.',
          },
        },
      ],
      resources: [
        { label: 'LangGraph documentation', url: 'https://langchain-ai.github.io/langgraph/', kind: 'docs' },
        { label: 'LlamaIndex agents', url: 'https://docs.llamaindex.ai/en/stable/use_cases/agents/', kind: 'docs' },
      ],
      related: ['agent-reliability', 'observability-and-evals'],
    },
    {
      slug: 'agent-reliability',
      title: 'Reliability, guardrails and evaluation',
      module: 'ai-agents',
      level: 'expert',
      minutes: 10,
      summary: 'Making a non-deterministic loop safe to run in front of real users.',
      why: 'The gap between an agent demo and an agent product is entirely reliability engineering. A 90% success rate per step is a 35% success rate over ten steps.',
      prerequisites: ['agent-memory-and-state', 'tool-calling'],
      outcomes: [
        'Reason about compounding step failure',
        'Place guardrails at the right layer',
        'Evaluate an agent on trajectories, not just final answers',
      ],
      tags: ['reliability', 'guardrails', 'evaluation', 'agents'],
      blocks: [
        {
          kind: 'math',
          expr: '0.95¹⁰ ≈ 0.60',
          note: 'A 95% reliable step, ten times, is a 60% reliable task. Long agent chains need per-step reliability far above what feels acceptable.',
        },
        {
          kind: 'list',
          items: [
            '**Shorten the chain.** Fewer steps is the most effective reliability measure available.',
            '**Validate every tool result** before it re-enters the loop, rather than trusting it downstream.',
            '**Make actions idempotent** and carry an idempotency key, so a retry cannot double-charge.',
            '**Cap everything** — steps, tokens, wall-clock time, spend per task.',
            '**Checkpoint** after each successful step.',
            '**Fail loudly.** A clear "I could not complete this" beats a confident fabricated result.',
          ],
        },
        {
          kind: 'table',
          head: ['Guardrail', 'Placement', 'Catches'],
          rows: [
            ['Input validation', 'Before the model', 'Injection attempts, oversized input, wrong language'],
            ['Schema validation', 'On every tool call', 'Malformed or out-of-range arguments'],
            ['Authorisation', 'Inside the tool', 'Access the current user does not have'],
            ['Output filtering', 'After generation', 'Leaked secrets, PII, unsafe content'],
            ['Human approval', 'Before irreversible actions', 'Everything else that got through'],
            ['Budget limits', 'Around the loop', 'Runaway cost'],
          ],
        },
        { kind: 'heading', text: 'Evaluating an agent' },
        {
          kind: 'text',
          body: 'Final-answer accuracy hides how the answer was reached. Evaluate the **trajectory** too: did it choose the right tools, in a sensible order, without unnecessary steps, and did it recover from errors? Log every run as a replayable trace, and turn each production failure into a test case.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'rel-1',
            prompt: 'An agent completes 12 tool steps with 92% per-step reliability. Rough end-to-end success rate?',
            options: ['About 92%', 'About 37%', 'About 80%', 'About 60%'],
            answer: 1,
            explanation:
              '0.92¹² ≈ 0.37. Compounding is why production agents are short, checkpointed, and validated at every step rather than long and trusting.',
          },
        },
      ],
      resources: [
        { label: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', kind: 'docs' },
        { label: 'LangSmith tracing and evaluation', url: 'https://docs.smith.langchain.com/', kind: 'tool' },
      ],
      related: ['security-and-privacy', 'observability-and-evals'],
    },
    {
      slug: 'orchestration-frameworks',
      title: 'Orchestration frameworks: LangChain, LangGraph and MCP',
      module: 'ai-agents',
      level: 'advanced',
      minutes: 9,
      summary:
        'What the frameworks actually give you — composition, state, persistence and a tool protocol — and when plain code is better.',
      why: 'Frameworks save real time on plumbing and cost real time when you fight them. Knowing which problem each one solves is what lets you pick deliberately instead of by tutorial.',
      prerequisites: ['agent-memory-and-state', 'structured-output-and-tools'],
      outcomes: [
        'Explain what LCEL composition buys over calling an API directly',
        'Model an agent as a graph with explicit state and persistence',
        'Decide when a framework is the wrong answer',
      ],
      tags: ['langchain', 'langgraph', 'mcp', 'orchestration'],
      blocks: [
        {
          kind: 'table',
          head: ['Layer', 'Problem it solves', 'What you give up'],
          rows: [
            ['LangChain (LCEL)', 'Composing prompt → model → parser as one runnable, with streaming and batching for free', 'A layer of indirection over a call you could write yourself'],
            ['LangGraph', 'Explicit state, branching, cycles and checkpointed persistence for multi-step work', 'You model your agent as a graph, whether or not it is one'],
            ['LlamaIndex', 'Ingestion, node parsing and retrieval strategies', 'Opinionated document model'],
            ['MCP', 'One tool interface many clients can use, written once', 'A server to run and version'],
            ['Plain code', 'Total control, no abstraction to debug through', 'You write the retries, streaming and state yourself'],
          ],
        },
        { kind: 'heading', text: 'Composition' },
        {
          kind: 'text',
          body: 'LCEL turns a chain into a single object with `invoke`, `batch` and `stream`. The value is not the syntax — it is that batching and streaming come for free at every step, and that a chain is swappable as a unit in tests.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'A composed chain, then the same thing as a graph node',
          code: `from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "Classify this ticket. Return JSON with category and severity.\\n\\n{ticket}"
)
chain = prompt | model | JsonOutputParser()

chain.invoke({"ticket": "checkout 502s on mobile"})
chain.batch([{"ticket": t} for t in backlog])     # batching, unchanged code
for piece in chain.stream({"ticket": text}):      # streaming, unchanged code
    ...`,
        },
        { kind: 'heading', text: 'State and persistence' },
        {
          kind: 'text',
          body: 'LangGraph makes the thing that matters explicit: a typed state object, nodes that update it, edges that decide what runs next, and a checkpointer that writes state after every node. That last part is what makes a long run resumable and auditable — the property that separates an agent you can operate from one you can only demo.',
        },
        {
          kind: 'code',
          lang: 'python',
          caption: 'State, nodes, a conditional edge and a checkpointer',
          code: `from typing import Annotated, TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages


class State(TypedDict):
    messages: Annotated[list, add_messages]   # reducer: append, do not replace
    attempts: int


builder = StateGraph(State)
builder.add_node("decide", decide)
builder.add_node("act", run_tools)
builder.set_entry_point("decide")
builder.add_conditional_edges("decide", lambda s: "act" if pending(s) else END)
builder.add_edge("act", "decide")

# Every node transition is checkpointed against a thread id, so a crash
# resumes where it stopped instead of restarting the task.
graph = builder.compile(checkpointer=SqliteSaver.from_conn_string("runs.db"))
graph.invoke({"messages": [("user", goal)], "attempts": 0},
             config={"configurable": {"thread_id": "ticket-4821"}})`,
        },
        {
          kind: 'note',
          tone: 'tip',
          title: 'Write it plainly first',
          body: 'Build the loop with the provider SDK and a dictionary of state. When the plumbing — streaming, retries, persistence, branching — starts to dominate the file, adopt the framework that solves that specific problem. Adopting first means debugging your logic through someone else’s abstraction from day one.',
        },
        {
          kind: 'note',
          tone: 'warn',
          title: 'Frameworks move faster than your code',
          body: 'These libraries make breaking changes often. Pin versions, keep the model calls behind your own thin interface, and make sure a framework swap does not mean rewriting the application.',
        },
        {
          kind: 'quiz',
          quiz: {
            id: 'orch-1',
            prompt: 'Your agent must survive a process restart mid-task and be auditable afterwards. What does that require?',
            options: [
              'A larger context window',
              'Checkpointed state keyed by a thread id, written after each step',
              'A faster model',
              'More tools',
            ],
            answer: 1,
            explanation:
              'Durability is a storage property, not a model property. Checkpointing after each node gives you both resumption and a step-by-step record of what happened.',
          },
        },
      ],
      resources: [
        { label: 'LangGraph documentation', url: 'https://langchain-ai.github.io/langgraph/', kind: 'docs' },
        { label: 'LangChain Expression Language', url: 'https://python.langchain.com/docs/concepts/lcel/', kind: 'docs' },
        { label: 'Model Context Protocol', url: 'https://modelcontextprotocol.io/', kind: 'docs' },
      ],
      related: ['agent-memory-and-state', 'tool-calling'],
    },
  ],
};
