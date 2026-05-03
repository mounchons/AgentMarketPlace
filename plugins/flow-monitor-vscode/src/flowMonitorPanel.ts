import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DataProvider, SourceKey } from './dataProvider';
import { TaskBridge } from './taskBridge';
import { actionsForNode, NodeMeta, QUICK_ACTIONS } from './promptTemplates';

export class FlowMonitorPanel {
  public static currentPanel: FlowMonitorPanel | undefined;
  private static readonly viewType = 'flowMonitor.graph';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  static createOrShow(
    extensionUri: vscode.Uri,
    dataProvider: DataProvider,
    taskBridge: TaskBridge
  ): FlowMonitorPanel {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    if (FlowMonitorPanel.currentPanel) {
      FlowMonitorPanel.currentPanel._panel.reveal(column);
      return FlowMonitorPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      FlowMonitorPanel.viewType,
      'Flow Monitor',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    FlowMonitorPanel.currentPanel = new FlowMonitorPanel(
      panel,
      extensionUri,
      dataProvider,
      taskBridge
    );
    return FlowMonitorPanel.currentPanel;
  }

  constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    private dataProvider: DataProvider,
    private taskBridge: TaskBridge
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.webview.html = this._getHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (msg) => this._handleMessage(msg),
      null,
      this._disposables
    );

    // Push initial snapshot once webview signals "ready"
  }

  postFileChanged(source: string | null, file: string): void {
    this._panel.webview.postMessage({
      type: 'file-changed',
      source,
      file,
      timestamp: new Date().toISOString(),
    });
  }

  async pushSnapshot(): Promise<void> {
    const snapshot = await this.dataProvider.loadSnapshot();
    this._panel.webview.postMessage({
      type: 'snapshot',
      snapshot,
      quickActions: QUICK_ACTIONS.map((a) => ({
        id: a.id,
        label: a.label,
        icon: a.icon,
        description: a.description,
      })),
    });
  }

  private async _handleMessage(msg: any): Promise<void> {
    try {
      switch (msg.type) {
        case 'ready':
          await this.pushSnapshot();
          break;

        case 'request-snapshot':
          await this.pushSnapshot();
          break;

        case 'save-source': {
          const { source, data } = msg as { source: SourceKey; data: any };
          await this.dataProvider.writeSource(source, data);
          this._panel.webview.postMessage({ type: 'save-result', source, ok: true });
          vscode.window.setStatusBarMessage(`Flow Monitor: saved ${source}`, 2000);
          break;
        }

        case 'agent-action': {
          const { actionId, node, prompt } = msg as {
            actionId: string;
            node: NodeMeta;
            prompt: string;
          };
          const finalPrompt = prompt ?? this._buildPrompt(actionId, node);
          if (!finalPrompt) {
            vscode.window.showWarningMessage(`No prompt available for action ${actionId}`);
            break;
          }
          await this.taskBridge.sendToAgent({
            action: actionId,
            prompt: finalPrompt,
            nodeLabel: node?.label,
          });
          break;
        }

        case 'agent-action-clipboard': {
          const { actionId, node, prompt } = msg as any;
          const finalPrompt = prompt ?? this._buildPrompt(actionId, node);
          if (!finalPrompt) break;
          await this.taskBridge.copyToClipboard({
            action: actionId,
            prompt: finalPrompt,
            nodeLabel: node?.label,
          });
          break;
        }

        case 'open-file': {
          const rel = msg.path as string;
          const uri = this.dataProvider.resolve(rel);
          if (uri) {
            await vscode.window.showTextDocument(uri);
          }
          break;
        }

        case 'request-actions': {
          const { node } = msg as { node: NodeMeta };
          const actions = actionsForNode(node).map(({ action, prompt }) => ({
            id: action.id,
            label: action.label,
            icon: action.icon,
            description: action.description,
            prompt,
          }));
          this._panel.webview.postMessage({
            type: 'actions-for-node',
            uid: node.uid,
            actions,
          });
          break;
        }

        case 'log': {
          console.log('[Webview]', ...(msg.args ?? []));
          break;
        }
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Flow Monitor error: ${err?.message ?? err}`);
    }
  }

  private _buildPrompt(actionId: string, node: NodeMeta): string | null {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (!action) return null;
    return action.build(node);
  }

  private _getHtml(): string {
    const webview = this._panel.webview;
    const mediaUri = (file: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', file));

    const indexPath = path.join(this._extensionUri.fsPath, 'media', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const csp = [
      `default-src 'none'`,
      `img-src ${webview.cspSource} https: data:`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `font-src ${webview.cspSource} https:`,
      `script-src ${webview.cspSource} 'unsafe-inline'`,
      `connect-src ${webview.cspSource}`,
    ].join('; ');

    html = html
      .replace(/\{\{CSP\}\}/g, csp)
      .replace(/\{\{CSP_SOURCE\}\}/g, webview.cspSource)
      .replace(/\{\{NONCE\}\}/g, getNonce())
      .replace(/\{\{TRACKER_APP\}\}/g, mediaUri('tracker-app.js').toString())
      .replace(/\{\{TRACKER_VIEWS\}\}/g, mediaUri('tracker-views.js').toString())
      .replace(/\{\{TRACKER_EDITOR\}\}/g, mediaUri('tracker-editor.js').toString())
      .replace(/\{\{TRACKER_STYLE\}\}/g, mediaUri('tracker-style.css').toString())
      .replace(/\{\{FLOW_CSS\}\}/g, mediaUri('flow-monitor-vscode.css').toString())
      .replace(/\{\{FLOW_BRIDGE\}\}/g, mediaUri('vscode-bridge.js').toString())
      .replace(/\{\{FLOW_JS\}\}/g, mediaUri('flow-monitor-vscode.js').toString())
      .replace(/\{\{CYTOSCAPE\}\}/g, mediaUri('vendor/cytoscape.min.js').toString())
      .replace(/\{\{DAGRE\}\}/g, mediaUri('vendor/dagre.min.js').toString())
      .replace(/\{\{CYTOSCAPE_DAGRE\}\}/g, mediaUri('vendor/cytoscape-dagre.js').toString())
      .replace(/\{\{TAILWIND\}\}/g, mediaUri('vendor/tailwind.min.css').toString());

    return html;
  }

  dispose(): void {
    FlowMonitorPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += chars.charAt(Math.floor(Math.random() * chars.length));
  return text;
}
