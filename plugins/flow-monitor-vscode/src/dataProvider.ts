import * as vscode from 'vscode';
import * as path from 'path';

export type SourceKey = 'design' | 'mockup' | 'feature' | 'qa';

export interface SourceData {
  design: any | null;
  mockup: any | null;
  feature: any | null;
  qa: any | null;
}

export interface SnapshotPayload {
  sources: SourceData;
  activity: any[];
  paths: Record<SourceKey, string>;
  workspaceName: string;
}

export class DataProvider {
  private _workspaceRoot: vscode.Uri | undefined;

  constructor() {
    this._workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
  }

  get workspaceRoot(): vscode.Uri | undefined {
    return this._workspaceRoot;
  }

  getConfiguredPaths(): Record<SourceKey, string> {
    const cfg = vscode.workspace.getConfiguration('flowMonitor');
    return {
      design: cfg.get<string>('paths.design', 'design_doc_list.json'),
      mockup: cfg.get<string>('paths.mockup', '.mockups/mockup_list.json'),
      feature: cfg.get<string>('paths.feature', 'feature_list.json'),
      qa: cfg.get<string>('paths.qa', 'qa-tracker.json'),
    };
  }

  getActivityLogPaths(): string[] {
    const cfg = vscode.workspace.getConfiguration('flowMonitor');
    return cfg.get<string[]>('activityLogs', []);
  }

  resolve(rel: string): vscode.Uri | null {
    if (!this._workspaceRoot) return null;
    return vscode.Uri.joinPath(this._workspaceRoot, rel);
  }

  async readJsonSafe(uri: vscode.Uri): Promise<any | null> {
    try {
      const buf = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(buf).toString('utf8');
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async readSource(key: SourceKey): Promise<any | null> {
    const rel = this.getConfiguredPaths()[key];
    const uri = this.resolve(rel);
    if (!uri) return null;
    return this.readJsonSafe(uri);
  }

  async writeSource(key: SourceKey, data: any): Promise<void> {
    const rel = this.getConfiguredPaths()[key];
    const uri = this.resolve(rel);
    if (!uri) throw new Error('No workspace folder open');
    const text = JSON.stringify(data, null, 2);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(text, 'utf8'));
  }

  async readActivityEntry(rel: string): Promise<any | null> {
    const uri = this.resolve(rel);
    if (!uri) return null;
    try {
      const buf = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(buf).toString('utf8');
      const ext = path.extname(rel).toLowerCase();
      if (ext === '.md') {
        return { type: 'markdown', file: path.basename(rel), content: text.slice(0, 2000) };
      }
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async loadSnapshot(): Promise<SnapshotPayload> {
    const paths = this.getConfiguredPaths();
    const sources: SourceData = {
      design: await this.readSource('design'),
      mockup: await this.readSource('mockup'),
      feature: await this.readSource('feature'),
      qa: await this.readSource('qa'),
    };

    const activity: any[] = [];
    for (const rel of this.getActivityLogPaths()) {
      const entry = await this.readActivityEntry(rel);
      if (entry === null) continue;
      if (Array.isArray(entry)) activity.push(...entry);
      else activity.push(entry);
    }
    activity.sort((a, b) => {
      const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    return {
      sources,
      activity,
      paths,
      workspaceName: vscode.workspace.workspaceFolders?.[0]?.name ?? 'Workspace',
    };
  }
}
