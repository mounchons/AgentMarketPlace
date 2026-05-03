import * as vscode from 'vscode';
import { DataProvider } from './dataProvider';
import { FlowFileWatcher } from './fileWatcher';
import { TaskBridge } from './taskBridge';
import { FlowSourcesProvider, ActivityProvider } from './treeProvider';
import { FlowMonitorPanel } from './flowMonitorPanel';

export function activate(context: vscode.ExtensionContext): void {
  const dataProvider = new DataProvider();
  const watcher = new FlowFileWatcher(dataProvider);
  const taskBridge = new TaskBridge();

  const sourcesProvider = new FlowSourcesProvider(dataProvider);
  const activityProvider = new ActivityProvider(dataProvider);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('flowMonitor.sources', sourcesProvider),
    vscode.window.registerTreeDataProvider('flowMonitor.activity', activityProvider),
    watcher
  );

  watcher.start();
  watcher.onChange(({ source, file }) => {
    sourcesProvider.refresh();
    activityProvider.refresh();
    if (FlowMonitorPanel.currentPanel) {
      FlowMonitorPanel.currentPanel.postFileChanged(source ?? null, file);
      // Also push a fresh snapshot so the graph rebuilds
      FlowMonitorPanel.currentPanel.pushSnapshot();
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('flowMonitor.openGraph', () => {
      FlowMonitorPanel.createOrShow(context.extensionUri, dataProvider, taskBridge);
    }),

    vscode.commands.registerCommand('flowMonitor.refresh', () => {
      sourcesProvider.refresh();
      activityProvider.refresh();
      if (FlowMonitorPanel.currentPanel) {
        FlowMonitorPanel.currentPanel.pushSnapshot();
      }
    }),

    vscode.commands.registerCommand('flowMonitor.openSourceFile', async (item: any) => {
      const key = item?.payload?.key as 'design' | 'mockup' | 'feature' | 'qa' | undefined;
      if (!key) return;
      const rel = dataProvider.getConfiguredPaths()[key];
      const uri = dataProvider.resolve(rel);
      if (uri) {
        try {
          await vscode.window.showTextDocument(uri);
        } catch {
          vscode.window.showWarningMessage(`Cannot open ${rel} — file may not exist`);
        }
      }
    }),

    vscode.commands.registerCommand('flowMonitor.sendToAgent', async () => {
      vscode.window.showInformationMessage(
        'Open the Flow Graph and right-click a node to send tasks to Claude Code'
      );
      FlowMonitorPanel.createOrShow(context.extensionUri, dataProvider, taskBridge);
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('flowMonitor')) {
        watcher.stop();
        watcher.start();
        sourcesProvider.refresh();
        if (FlowMonitorPanel.currentPanel) {
          FlowMonitorPanel.currentPanel.pushSnapshot();
        }
      }
    })
  );
}

export function deactivate(): void {}
