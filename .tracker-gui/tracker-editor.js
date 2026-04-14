/* ===== Tracker Editor — Detail Panel, Edit, Add, Save + App Wiring ===== */

// ── Schema Registry for Edit Forms ──
const SCHEMA_REGISTRY = {
  entity: [
    { key: 'name', type: 'text', label: 'Entity Name', required: true },
    { key: 'name_th', type: 'text', label: 'Thai Name' },
    { key: 'table_name', type: 'text', label: 'Table Name' },
    { key: 'description', type: 'textarea', label: 'Description' },
    { key: 'status', type: 'select', label: 'Status', options: ['draft', 'defined', 'reviewed'] }
  ],
  api: [
    { key: 'method', type: 'select', label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    { key: 'path', type: 'text', label: 'Path', required: true },
    { key: 'description', type: 'textarea', label: 'Description' },
    { key: 'entity_ref', type: 'ref', label: 'Entity Ref', refType: 'entity', refSource: 'design' },
    { key: 'status', type: 'select', label: 'Status', options: ['draft', 'defined', 'reviewed'] }
  ],
  page: [
    { key: 'name', type: 'text', label: 'Page Name', required: true },
    { key: 'name_th', type: 'text', label: 'Thai Name' },
    { key: 'url', type: 'text', label: 'URL' },
    { key: 'category', type: 'select', label: 'Category', options: ['auth', 'main', 'list', 'form', 'detail', 'admin', 'reports'] },
    { key: 'crud_group', type: 'text', label: 'CRUD Group' },
    { key: 'crud_type', type: 'select', label: 'CRUD Type', options: ['', 'list', 'form', 'detail'] },
    { key: 'complexity', type: 'select', label: 'Complexity', options: ['', 'simple', 'complex'] },
    { key: 'status', type: 'select', label: 'Status', options: ['pending', 'in_progress', 'completed', 'approved'] }
  ],
  feature: [
    { key: 'description', type: 'text', label: 'Description', required: true },
    { key: 'epic', type: 'select', label: 'Epic', options: ['setup', 'domain', 'api', 'quality', 'cross-cutting'] },
    { key: 'layer', type: 'select', label: 'Layer', options: ['presentation', 'application', 'domain', 'infrastructure', 'cross-cutting'] },
    { key: 'priority', type: 'select', label: 'Priority', options: ['low', 'medium', 'high', 'critical'] },
    { key: 'complexity', type: 'select', label: 'Complexity', options: ['simple', 'medium', 'complex'] },
    { key: 'status', type: 'select', label: 'Status', options: ['pending', 'in_progress', 'passed', 'partial', 'incomplete'] }
  ],
  scenario: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'module', type: 'text', label: 'Module' },
    { key: 'url', type: 'text', label: 'URL' },
    { key: 'type', type: 'select', label: 'Type', options: ['form', 'master-data', 'master-detail', 'wizard', 'dashboard'] },
    { key: 'priority', type: 'select', label: 'Priority', options: ['low', 'medium', 'high', 'critical'] },
    { key: 'status', type: 'select', label: 'Status', options: ['pending', 'passed', 'failed', 'running'] }
  ],
  role: [
    { key: 'name', type: 'text', label: 'Role Name', required: true },
    { key: 'name_th', type: 'text', label: 'Thai Name' },
    { key: 'description', type: 'textarea', label: 'Description' }
  ]
};

// ── Detail Panel ──
class DetailPanel {
  constructor(appInstance) {
    this.app = appInstance;
    this.panelEl = document.getElementById('detail-panel');
    this.titleEl = document.getElementById('detail-title');
    this.bodyEl = document.getElementById('detail-body');
    this.isEditing = false;
    this.currentUid = null;
  }

  show(uid) {
    this.currentUid = uid;
    this.isEditing = false;
    const node = this.app.graph.getNode(uid);
    if (!node) { this.hide(); return; }

    this.titleEl.textContent = node.label;
    this.panelEl.classList.remove('hidden');
    this._renderDetail(node);
  }

  hide() {
    this.currentUid = null;
    this.isEditing = false;
    this.panelEl.classList.add('hidden');
    this.bodyEl.textContent = '';
  }

  edit(uid) {
    this.currentUid = uid;
    this.isEditing = true;
    const node = this.app.graph.getNode(uid);
    if (!node) return;
    this.titleEl.textContent = 'Edit: ' + node.label;
    this.panelEl.classList.remove('hidden');
    this._renderEditForm(node);
  }

  _renderDetail(node) {
    this.bodyEl.textContent = '';

    // Source + Status badges
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center gap-2 mb-4';
    headerDiv.appendChild(createSourceBadge(node.source));
    headerDiv.appendChild(createStatusBadge(node.status));
    if (node.nodeType) {
      const typeSpan = document.createElement('span');
      typeSpan.className = 'text-xs text-gray-500';
      typeSpan.textContent = node.nodeType;
      headerDiv.appendChild(typeSpan);
    }
    this.bodyEl.appendChild(headerDiv);

    // Metadata fields
    const metaSection = this._createSection('Metadata');
    const meta = node.metadata || {};
    const skipKeys = new Set(['crud_operations', 'crud_actions', 'subtasks', 'relationships', 'attributes', 'acceptance_criteria', 'verification_results', 'steps_legacy', 'model_config']);

    for (const [key, value] of Object.entries(meta)) {
      if (skipKeys.has(key)) continue;
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) continue;
      if (typeof value === 'object' && !Array.isArray(value)) continue;

      const field = document.createElement('div');
      field.className = 'detail-field';
      const keyEl = document.createElement('span');
      keyEl.className = 'detail-field-key';
      keyEl.textContent = key;
      const valEl = document.createElement('span');
      valEl.className = 'detail-field-value';
      valEl.textContent = Array.isArray(value) ? value.join(', ') : String(value);
      field.appendChild(keyEl);
      field.appendChild(valEl);
      metaSection.appendChild(field);
    }
    this.bodyEl.appendChild(metaSection);

    // CRUD operations (if entity)
    if (meta.crud_operations || meta.crud_actions) {
      const crudSection = this._createSection('CRUD Operations');
      const ops = meta.crud_operations || meta.crud_actions || {};
      for (const [op, config] of Object.entries(ops)) {
        const field = document.createElement('div');
        field.className = 'detail-field';
        const keyEl = document.createElement('span');
        keyEl.className = 'detail-field-key';
        keyEl.textContent = op;
        const valEl = document.createElement('span');
        valEl.className = 'detail-field-value';
        if (typeof config === 'object') {
          valEl.textContent = config.enabled ? 'Enabled' : 'Disabled';
          if (config.strategy) valEl.textContent += ` (${config.strategy})`;
          if (config.ui_type) valEl.textContent += ` [${config.ui_type}]`;
        } else {
          valEl.textContent = String(config);
        }
        field.appendChild(keyEl);
        field.appendChild(valEl);
        crudSection.appendChild(field);
      }
      this.bodyEl.appendChild(crudSection);
    }

    // Subtasks (if feature)
    if (meta.subtasks && meta.subtasks.length > 0) {
      const subSection = this._createSection('Subtasks');
      for (const sub of meta.subtasks) {
        const item = document.createElement('div');
        item.className = 'detail-field';
        const keyEl = document.createElement('span');
        keyEl.className = 'detail-field-key';
        keyEl.textContent = sub.id;
        const valEl = document.createElement('span');
        valEl.className = 'detail-field-value';
        valEl.textContent = (sub.done ? '\u2705 ' : '\u2B1C ') + sub.description;
        item.appendChild(keyEl);
        item.appendChild(valEl);
        subSection.appendChild(item);
      }
      this.bodyEl.appendChild(subSection);
    }

    // Connected nodes
    const connected = this.app.graph.getConnected(node.uid);
    if (connected.length > 0) {
      const connSection = this._createSection(`Connections (${connected.length})`);
      for (const c of connected) {
        if (!c.node) continue;
        const conn = document.createElement('div');
        conn.className = 'detail-connection';
        conn.appendChild(createDot(NODE_COLORS[c.node.nodeType] || '#94a3b8'));
        const label = document.createElement('span');
        label.textContent = c.node.label;
        conn.appendChild(label);
        const edgeType = document.createElement('span');
        edgeType.className = 'text-xs text-gray-400 ml-auto';
        edgeType.textContent = c.edge.label;
        conn.appendChild(edgeType);
        const arrow = document.createElement('span');
        arrow.className = 'text-xs text-gray-300';
        arrow.textContent = c.direction === 'out' ? ' \u2192' : ' \u2190';
        conn.appendChild(arrow);
        conn.addEventListener('click', () => this.app.state.select(c.node.uid));
        connSection.appendChild(conn);
      }
      this.bodyEl.appendChild(connSection);
    }
  }

  _renderEditForm(node) {
    this.bodyEl.textContent = '';
    const schema = SCHEMA_REGISTRY[node.nodeType] || SCHEMA_REGISTRY[node.source === 'mockup' && node.nodeType === 'mockup-entity' ? 'entity' : 'entity'] || [];
    const meta = node.metadata || {};

    const form = document.createElement('div');
    form.className = 'edit-form';

    for (const field of schema) {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'edit-field';
      const label = document.createElement('label');
      label.className = 'edit-label';
      label.textContent = field.label + (field.required ? ' *' : '');
      fieldDiv.appendChild(label);

      if (field.type === 'text') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = meta[field.key] || '';
        input.dataset.key = field.key;
        fieldDiv.appendChild(input);
      } else if (field.type === 'textarea') {
        const ta = document.createElement('textarea');
        ta.className = 'edit-textarea';
        ta.value = meta[field.key] || '';
        ta.dataset.key = field.key;
        fieldDiv.appendChild(ta);
      } else if (field.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'edit-select';
        sel.dataset.key = field.key;
        for (const opt of field.options) {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt || '(none)';
          if (meta[field.key] === opt) o.selected = true;
          sel.appendChild(o);
        }
        fieldDiv.appendChild(sel);
      } else if (field.type === 'ref') {
        const sel = document.createElement('select');
        sel.className = 'edit-select';
        sel.dataset.key = field.key;
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '(none)';
        sel.appendChild(emptyOpt);
        // Populate from graph nodes
        const candidates = app.graph.nodes.filter(n => n.source === field.refSource && n.nodeType === field.refType);
        for (const c of candidates) {
          const o = document.createElement('option');
          o.value = c.metadata.id || c.id;
          o.textContent = c.label;
          if (meta[field.key] === (c.metadata.id || c.id)) o.selected = true;
          sel.appendChild(o);
        }
        fieldDiv.appendChild(sel);
      }
      form.appendChild(fieldDiv);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'edit-actions';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'edit-btn edit-btn-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => this._saveEdit(node, form));
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'edit-btn edit-btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.show(node.uid));
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    form.appendChild(actions);

    this.bodyEl.appendChild(form);
  }

  _saveEdit(node, form) {
    const updates = {};
    form.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      const val = el.value;
      if (val !== (node.metadata[key] || '')) {
        updates[key] = val || null;
      }
    });

    if (Object.keys(updates).length > 0) {
      app.updateNodeInSource(node.uid, updates);
      // Rebuild graph
      const graphData = app.buildGraph();
      viewManager.refresh(graphData);
      // Re-select
      this.show(node.uid);
    } else {
      this.show(node.uid);
    }
  }

  _createSection(title) {
    const section = document.createElement('div');
    section.className = 'detail-section';
    const titleEl = document.createElement('div');
    titleEl.className = 'detail-section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);
    return section;
  }
}

// ── Add Node Modal ──
class AddNodeModal {
  constructor(appInstance) {
    this.app = appInstance;
  }

  show() {
    const overlay = document.createElement('div');
    overlay.className = 'add-node-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const modal = document.createElement('div');
    modal.className = 'add-node-modal';

    const title = document.createElement('h3');
    title.textContent = 'Add New Node';
    modal.appendChild(title);

    const options = [
      { source: 'design', nodeType: 'entity', label: 'Design Entity', color: '#6366f1', desc: 'Add a new entity to design doc' },
      { source: 'design', nodeType: 'api', label: 'API Endpoint', color: '#64748b', desc: 'Add a new API endpoint' },
      { source: 'mockup', nodeType: 'page', label: 'Mockup Page', color: '#10b981', desc: 'Add a new UI page' },
      { source: 'feature', nodeType: 'feature', label: 'Feature', color: '#f59e0b', desc: 'Add a new feature task' },
      { source: 'qa', nodeType: 'scenario', label: 'QA Scenario', color: '#f43f5e', desc: 'Add a new test scenario' }
    ];

    for (const opt of options) {
      const optDiv = document.createElement('div');
      optDiv.className = 'add-node-option';

      const icon = document.createElement('div');
      icon.className = 'add-node-option-icon';
      icon.style.background = opt.color + '20';
      icon.style.color = opt.color;
      icon.textContent = opt.label.charAt(0);
      optDiv.appendChild(icon);

      const info = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.className = 'font-medium text-sm';
      nameEl.textContent = opt.label;
      const descEl = document.createElement('div');
      descEl.className = 'text-xs text-gray-500';
      descEl.textContent = opt.desc;
      info.appendChild(nameEl);
      info.appendChild(descEl);
      optDiv.appendChild(info);

      optDiv.addEventListener('click', () => {
        overlay.remove();
        this._addAndEdit(opt.source, opt.nodeType);
      });

      modal.appendChild(optDiv);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'edit-btn edit-btn-cancel w-full mt-2';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.width = '100%';
    cancelBtn.addEventListener('click', () => overlay.remove());
    modal.appendChild(cancelBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  _addAndEdit(source, nodeType) {
    const entry = app.addNodeToSource(source, nodeType, {});
    if (!entry) return;
    // Rebuild graph
    const graphData = app.buildGraph();
    viewManager.refresh(graphData);
    // Find the new node and edit it
    const uid = this._findNewNodeUid(source, nodeType, entry);
    if (uid) {
      app.state.select(uid);
      detailPanel.edit(uid);
    }
  }

  _findNewNodeUid(source, nodeType, entry) {
    for (const node of app.graph.nodes) {
      if (node.source === source && node.nodeType === nodeType) {
        if (nodeType === 'entity' && node.metadata.id === entry.id) return node.uid;
        if (nodeType === 'api' && node.metadata.id === entry.id) return node.uid;
        if (nodeType === 'page' && node.metadata.id === entry.id) return node.uid;
        if (nodeType === 'feature' && node.metadata.id === entry.id) return node.uid;
        if (nodeType === 'scenario' && node.metadata.id === entry.id) return node.uid;
      }
    }
    return null;
  }
}

// ── Save Manager ──
class SaveManager {
  constructor(appInstance) {
    this.app = appInstance;
  }

  saveAll() {
    const dirty = this.app.state.dirty;
    if (dirty.size === 0) { this._notify('No unsaved changes'); return; }
    for (const source of dirty) {
      this.app.loader.downloadJSON(source);
    }
    dirty.clear();
    this.app.bus.emit('dirty-changed', dirty);
    this._notify('Files downloaded');
  }

  _notify(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// ══════════════════════════════════════════════
//  APP WIRING — Initialize everything
// ══════════════════════════════════════════════

let viewManager;
let detailPanel;
let addNodeModal;
let saveManager;

document.addEventListener('DOMContentLoaded', () => {
  viewManager = new ViewManager(app);
  detailPanel = new DetailPanel(app);
  addNodeModal = new AddNodeModal(app);
  saveManager = new SaveManager(app);

  // ── Landing screen: drag & drop ──
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      for (const file of files) {
        try {
          await app.loader.loadFromFile(file);
        } catch (err) { console.error('Load error:', err); }
      }
      checkAllLoaded();
    });
    zone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', async () => {
        if (input.files.length > 0) {
          try {
            await app.loader.loadFromFile(input.files[0]);
          } catch (err) { console.error('Load error:', err); }
          checkAllLoaded();
        }
      });
      input.click();
    });
  });

  // ── File input (Load All) ──
  const fileInputAll = document.getElementById('file-input-all');
  if (fileInputAll) {
    fileInputAll.addEventListener('change', async () => {
      await app.loader.loadMultipleFiles(fileInputAll.files);
      checkAllLoaded();
    });
  }

  // ── Demo data button ──
  document.getElementById('btn-demo').addEventListener('click', () => {
    app.loader.loadDemoData();
    launchApp();
  });

  // ── File loaded feedback ──
  app.bus.on('file-loaded', ({ type }) => {
    const statusEl = document.getElementById(`status-${type}`);
    if (statusEl) statusEl.textContent = '\u2713 Loaded';
    const zone = document.getElementById(`drop-${type}`);
    if (zone) zone.classList.add('loaded');
  });

  function checkAllLoaded() {
    const hasAny = Object.values(app.loader.rawSources).some(v => v !== null);
    if (hasAny) launchApp();
  }

  function launchApp() {
    // Hide landing, show app
    document.getElementById('landing').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Set project name
    document.getElementById('project-name').textContent = app.loader.getProjectName();

    // Build graph
    const graphData = app.buildGraph();
    viewManager.init(graphData);
  }

  // ── Selection → detail panel ──
  app.bus.on('selection-changed', ({ selected }) => {
    if (selected) detailPanel.show(selected);
    else detailPanel.hide();
  });

  // ── Edit node event ──
  app.bus.on('edit-node', (uid) => {
    detailPanel.edit(uid);
  });

  // ── Topbar controls ──
  document.getElementById('search-input').addEventListener('input', (e) => {
    app.state.setFilter('search', e.target.value);
  });

  document.getElementById('filter-status').addEventListener('change', (e) => {
    app.state.setFilter('status', e.target.value);
  });

  document.getElementById('filter-layer').addEventListener('change', (e) => {
    app.state.setFilter('layer', e.target.value);
  });

  // Source filter checkboxes
  document.querySelectorAll('[data-source-filter]').forEach(cb => {
    cb.addEventListener('change', () => {
      app.state.toggleSource(cb.dataset.sourceFilter);
    });
  });

  // Layout toggle
  document.getElementById('btn-layout-toggle').addEventListener('click', () => {
    app.state.toggleLayout();
    document.getElementById('layout-dir-label').textContent = app.state.layoutDirection;
  });

  // Fit graph
  document.getElementById('btn-fit').addEventListener('click', () => {
    if (viewManager.graphView) viewManager.graphView.fit();
  });

  // Add node
  document.getElementById('btn-add-node').addEventListener('click', () => {
    addNodeModal.show();
  });

  // Save all
  document.getElementById('btn-save-all').addEventListener('click', () => {
    saveManager.saveAll();
  });

  // Edit button in detail panel
  document.getElementById('btn-edit-node').addEventListener('click', () => {
    if (detailPanel.currentUid) {
      if (detailPanel.isEditing) detailPanel.show(detailPanel.currentUid);
      else detailPanel.edit(detailPanel.currentUid);
    }
  });

  // Close panel
  document.getElementById('btn-close-panel').addEventListener('click', () => {
    detailPanel.hide();
    app.state.select(null);
  });

  // Reload button
  document.getElementById('btn-reload').addEventListener('click', () => {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('landing').classList.remove('hidden');
    // Reset
    app.loader.rawSources = { design: null, mockup: null, feature: null, qa: null };
    dropZones.forEach(zone => {
      zone.classList.remove('loaded');
      const status = zone.querySelector('.drop-zone-status');
      if (status) status.textContent = '';
    });
  });

  // Dirty state indicator
  app.bus.on('dirty-changed', (dirty) => {
    const indicator = document.getElementById('dirty-indicator');
    if (dirty.size > 0) indicator.classList.remove('hidden');
    else indicator.classList.add('hidden');
  });
});
