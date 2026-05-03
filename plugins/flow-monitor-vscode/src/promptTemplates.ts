/**
 * Prompt templates for AI agent quick actions.
 * Each template gets the selected node's metadata and produces a slash-command-friendly prompt.
 *
 * The templates are intentionally short — they trigger the existing AgentMarketPlace
 * plugin commands (/continue, /qa-create-scenario, /create-mockup, /system-design-doc, etc.)
 * rather than reimplementing AI logic here.
 */

export interface NodeMeta {
  uid: string;
  source: 'design' | 'mockup' | 'feature' | 'qa';
  nodeType: string;
  id: string | number;
  label: string;
  name?: string;
  status?: string;
  metadata?: any;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Returns null if action does not apply to this node type. */
  build: (node: NodeMeta) => string | null;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'implement',
    label: 'Implement this feature',
    icon: '⚙️',
    description: 'Run /continue (long-running plugin) to implement this feature',
    build: (n) => {
      if (n.source !== 'feature' || n.nodeType !== 'feature') return null;
      return `/continue feature ${n.id}`;
    },
  },
  {
    id: 'review',
    label: 'Opus review',
    icon: '🧠',
    description: 'Run /review to have Opus check this feature',
    build: (n) => {
      if (n.source !== 'feature') return null;
      return `/review feature ${n.id}`;
    },
  },
  {
    id: 'qa-create',
    label: 'Generate QA scenarios',
    icon: '🧪',
    description: 'Create QA test scenarios for this page/feature',
    build: (n) => {
      if (n.source === 'mockup' && n.nodeType === 'page') {
        return `/qa-create-scenario page ${n.id} (${n.name ?? ''})`;
      }
      if (n.source === 'feature') {
        return `/qa-create-scenario feature ${n.id} (${n.name ?? ''})`;
      }
      return null;
    },
  },
  {
    id: 'qa-run',
    label: 'Run QA test',
    icon: '▶️',
    description: 'Execute this QA scenario via /qa-run',
    build: (n) => {
      if (n.source === 'qa' && n.nodeType === 'scenario') {
        return `/qa-run scenario ${n.id}`;
      }
      return null;
    },
  },
  {
    id: 'qa-bug-export',
    label: 'Export bug → feature',
    icon: '🐛',
    description: 'If failed, export to long-running feature_list as bug-fix epic',
    build: (n) => {
      if (n.source === 'qa' && n.nodeType === 'scenario' && n.status === 'failed') {
        return `/qa-bug-export ${n.id}`;
      }
      return null;
    },
  },
  {
    id: 'create-mockup',
    label: 'Create UI mockup',
    icon: '🎨',
    description: 'Generate HTML mockup for this page',
    build: (n) => {
      if (n.source === 'mockup' && n.nodeType === 'page') {
        return `/create-html-mockup ${n.id} (${n.name ?? ''})`;
      }
      return null;
    },
  },
  {
    id: 'edit-design-section',
    label: 'Edit design section',
    icon: '📐',
    description: 'Open system-design-doc editor for the related section',
    build: (n) => {
      if (n.source === 'design') {
        return `/system-design-doc:edit-section ${n.id}`;
      }
      return null;
    },
  },
  {
    id: 'free-prompt',
    label: 'Custom prompt…',
    icon: '💬',
    description: 'Send a free-form instruction about this node',
    build: (n) =>
      `Please look at ${n.source} node ${n.id} (${n.label}). Status: ${n.status ?? 'n/a'}. \n\n[Add your instruction here]`,
  },
];

export function actionsForNode(node: NodeMeta): { action: QuickAction; prompt: string }[] {
  const result: { action: QuickAction; prompt: string }[] = [];
  for (const action of QUICK_ACTIONS) {
    const prompt = action.build(node);
    if (prompt) result.push({ action, prompt });
  }
  return result;
}
