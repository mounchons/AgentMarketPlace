import * as vscode from 'vscode';

export interface AgentTaskRequest {
  action: string;
  prompt: string;
  nodeLabel?: string;
}

export class TaskBridge {
  /**
   * Find a terminal whose name contains the configured substring (default "Claude Code").
   * If none found and spawnIfMissing is true, create a new terminal and run "claude".
   */
  private findOrCreateTerminal(): vscode.Terminal {
    const cfg = vscode.workspace.getConfiguration('flowMonitor');
    const namePart = (cfg.get<string>('terminal.name', 'Claude Code') ?? 'Claude Code').toLowerCase();
    const spawn = cfg.get<boolean>('terminal.spawnIfMissing', true);

    for (const t of vscode.window.terminals) {
      if (t.name.toLowerCase().includes(namePart)) return t;
    }

    if (vscode.window.activeTerminal) {
      return vscode.window.activeTerminal;
    }

    const term = vscode.window.createTerminal({ name: 'Claude Code' });
    if (spawn) {
      term.sendText('claude', true);
    }
    return term;
  }

  async sendToAgent(req: AgentTaskRequest): Promise<void> {
    const term = this.findOrCreateTerminal();
    term.show(true);

    const header = req.nodeLabel ? `[${req.action}] ${req.nodeLabel}` : `[${req.action}]`;
    const text = `${header}\n${req.prompt}`;

    term.sendText(text, false);

    vscode.window.setStatusBarMessage(`Flow Monitor → ${req.action}`, 3000);
  }

  async copyToClipboard(req: AgentTaskRequest): Promise<void> {
    const header = req.nodeLabel ? `[${req.action}] ${req.nodeLabel}\n` : '';
    await vscode.env.clipboard.writeText(header + req.prompt);
    vscode.window.showInformationMessage(`Copied: ${req.action}`);
  }
}
