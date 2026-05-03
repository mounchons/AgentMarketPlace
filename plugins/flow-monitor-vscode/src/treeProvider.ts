import * as vscode from 'vscode';
import { DataProvider, SourceKey } from './dataProvider';

const SOURCE_LABELS: Record<SourceKey, string> = {
  design: 'Design Doc',
  mockup: 'Mockup',
  feature: 'Feature',
  qa: 'QA',
};

const SOURCE_ICONS: Record<SourceKey, string> = {
  design: 'file-code',
  mockup: 'browser',
  feature: 'list-tree',
  qa: 'beaker',
};

class FlowTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly nodeKind: string,
    public readonly payload?: any
  ) {
    super(label, collapsibleState);
  }
}

export class FlowSourcesProvider implements vscode.TreeDataProvider<FlowTreeItem> {
  private _onDidChange = new vscode.EventEmitter<FlowTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(private dataProvider: DataProvider) {}

  refresh(): void {
    this._onDidChange.fire(undefined);
  }

  getTreeItem(el: FlowTreeItem): vscode.TreeItem {
    return el;
  }

  async getChildren(element?: FlowTreeItem): Promise<FlowTreeItem[]> {
    if (!this.dataProvider.workspaceRoot) {
      const item = new FlowTreeItem('No workspace open', vscode.TreeItemCollapsibleState.None, 'empty');
      return [item];
    }

    if (!element) {
      // Top level — list 4 sources + Open Graph shortcut
      const items: FlowTreeItem[] = [];
      const open = new FlowTreeItem(
        'Open Flow Graph',
        vscode.TreeItemCollapsibleState.None,
        'openGraph'
      );
      open.iconPath = new vscode.ThemeIcon('graph');
      open.command = { command: 'flowMonitor.openGraph', title: 'Open Flow Graph' };
      items.push(open);

      const paths = this.dataProvider.getConfiguredPaths();
      for (const key of Object.keys(paths) as SourceKey[]) {
        const data = await this.dataProvider.readSource(key);
        const count = this.countItems(key, data);
        const label = `${SOURCE_LABELS[key]}${count !== null ? ` (${count})` : ''}`;
        const item = new FlowTreeItem(
          label,
          data ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'source',
          { key, data }
        );
        item.contextValue = 'sourceFile';
        item.iconPath = new vscode.ThemeIcon(SOURCE_ICONS[key]);
        item.description = data ? paths[key] : 'not found';
        item.tooltip = paths[key];
        if (!data) {
          item.iconPath = new vscode.ThemeIcon('warning');
        }
        items.push(item);
      }
      return items;
    }

    if (element.nodeKind === 'source' && element.payload?.data) {
      return this.getSourceChildren(element.payload.key, element.payload.data);
    }

    if (element.nodeKind === 'group') {
      return element.payload?.items ?? [];
    }

    return [];
  }

  private countItems(key: SourceKey, data: any): number | null {
    if (!data) return null;
    switch (key) {
      case 'design':
        return (data.entities?.length ?? 0) + (data.api_endpoints?.length ?? 0);
      case 'mockup':
        return data.pages?.length ?? 0;
      case 'feature':
        return data.features?.length ?? 0;
      case 'qa':
        return data.scenarios?.length ?? 0;
    }
  }

  private getSourceChildren(key: SourceKey, data: any): FlowTreeItem[] {
    if (key === 'design') {
      return [
        this.makeGroup(
          `Entities (${data.entities?.length ?? 0})`,
          (data.entities ?? []).map((e: any) =>
            this.makeLeaf(`${e.id} • ${e.name}`, 'symbol-class', e.status)
          )
        ),
        this.makeGroup(
          `APIs (${data.api_endpoints?.length ?? 0})`,
          (data.api_endpoints ?? []).map((a: any) =>
            this.makeLeaf(`${a.id} • ${a.method} ${a.path}`, 'symbol-method', a.status)
          )
        ),
      ];
    }
    if (key === 'mockup') {
      return [
        this.makeGroup(
          `Pages (${data.pages?.length ?? 0})`,
          (data.pages ?? []).map((p: any) => this.makeLeaf(`${p.id} • ${p.name}`, 'browser', p.status))
        ),
      ];
    }
    if (key === 'feature') {
      const epicMap = new Map<string, any[]>();
      for (const f of data.features ?? []) {
        const e = f.epic ?? 'misc';
        if (!epicMap.has(e)) epicMap.set(e, []);
        epicMap.get(e)!.push(f);
      }
      const groups: FlowTreeItem[] = [];
      for (const [epic, feats] of epicMap) {
        groups.push(
          this.makeGroup(
            `${epic} (${feats.length})`,
            feats.map((f) => this.makeLeaf(`#${f.id} ${f.description}`, 'symbol-event', f.status))
          )
        );
      }
      return groups;
    }
    if (key === 'qa') {
      const modMap = new Map<string, any[]>();
      for (const sc of data.scenarios ?? []) {
        const m = sc.module ?? 'unassigned';
        if (!modMap.has(m)) modMap.set(m, []);
        modMap.get(m)!.push(sc);
      }
      const groups: FlowTreeItem[] = [];
      for (const [mod, scs] of modMap) {
        groups.push(
          this.makeGroup(
            `${mod} (${scs.length})`,
            scs.map((s) => this.makeLeaf(`${s.id} • ${s.title}`, 'beaker', s.status))
          )
        );
      }
      return groups;
    }
    return [];
  }

  private makeGroup(label: string, items: FlowTreeItem[]): FlowTreeItem {
    const it = new FlowTreeItem(
      label,
      vscode.TreeItemCollapsibleState.Collapsed,
      'group',
      { items }
    );
    it.iconPath = new vscode.ThemeIcon('folder');
    return it;
  }

  private makeLeaf(label: string, icon: string, status?: string): FlowTreeItem {
    const it = new FlowTreeItem(label, vscode.TreeItemCollapsibleState.None, 'item');
    it.iconPath = new vscode.ThemeIcon(icon);
    if (status) {
      it.description = status;
    }
    return it;
  }
}

export class ActivityProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(private dataProvider: DataProvider) {}

  refresh(): void {
    this._onDidChange.fire(undefined);
  }

  getTreeItem(el: vscode.TreeItem): vscode.TreeItem {
    return el;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const snap = await this.dataProvider.loadSnapshot();
    return snap.activity.slice(0, 30).map((entry: any) => {
      const ts = entry?.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
      const text = entry?.command || entry?.event || entry?.message || entry?.file || JSON.stringify(entry).slice(0, 60);
      const it = new vscode.TreeItem(text, vscode.TreeItemCollapsibleState.None);
      it.description = ts;
      it.iconPath = new vscode.ThemeIcon('history');
      it.tooltip = JSON.stringify(entry, null, 2);
      return it;
    });
  }
}
