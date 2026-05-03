import * as vscode from 'vscode';
import { DataProvider, SourceKey } from './dataProvider';

export type FileChangeListener = (event: { source: SourceKey | 'activity' | null; file: string }) => void;

export class FlowFileWatcher implements vscode.Disposable {
  private _watchers: vscode.FileSystemWatcher[] = [];
  private _listeners: FileChangeListener[] = [];
  private _debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(private dataProvider: DataProvider) {}

  start(): void {
    this.stop();

    const root = this.dataProvider.workspaceRoot;
    if (!root) return;

    const paths = this.dataProvider.getConfiguredPaths();
    const sourceByPath = new Map<string, SourceKey>();
    for (const [key, rel] of Object.entries(paths) as [SourceKey, string][]) {
      sourceByPath.set(rel.replace(/\\/g, '/'), key);
      this._watchPath(root, rel, key);
    }

    for (const rel of this.dataProvider.getActivityLogPaths()) {
      this._watchPath(root, rel, 'activity');
    }
  }

  private _watchPath(
    root: vscode.Uri,
    rel: string,
    source: SourceKey | 'activity'
  ): void {
    const pattern = new vscode.RelativePattern(root, rel);
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    const handler = (uri: vscode.Uri) => this._notify(source, uri.fsPath);
    watcher.onDidChange(handler);
    watcher.onDidCreate(handler);
    watcher.onDidDelete(handler);
    this._watchers.push(watcher);
  }

  private _notify(source: SourceKey | 'activity' | null, filePath: string): void {
    if (this._debounceTimers.has(filePath)) {
      clearTimeout(this._debounceTimers.get(filePath)!);
    }
    this._debounceTimers.set(
      filePath,
      setTimeout(() => {
        this._debounceTimers.delete(filePath);
        const file = filePath.split(/[\\/]/).pop() ?? filePath;
        for (const fn of this._listeners) {
          try {
            fn({ source, file });
          } catch (e) {
            console.error('FlowFileWatcher listener error:', e);
          }
        }
      }, 300)
    );
  }

  onChange(fn: FileChangeListener): vscode.Disposable {
    this._listeners.push(fn);
    return new vscode.Disposable(() => {
      this._listeners = this._listeners.filter((f) => f !== fn);
    });
  }

  stop(): void {
    for (const w of this._watchers) w.dispose();
    this._watchers = [];
    for (const t of this._debounceTimers.values()) clearTimeout(t);
    this._debounceTimers.clear();
  }

  dispose(): void {
    this.stop();
    this._listeners = [];
  }
}
