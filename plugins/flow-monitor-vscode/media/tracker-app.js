/* ===== Tracker App — Core Data Layer ===== */

// ── Event Bus ──
class EventBus {
  constructor() { this._listeners = {}; }
  on(event, fn) { if (!this._listeners[event]) this._listeners[event] = []; this._listeners[event].push(fn); }
  off(event, fn) { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn); }
  emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); }
}

// ── State Manager ──
class StateManager {
  constructor(bus) {
    this.bus = bus;
    this.selection = new Set();
    this.activeView = 'graph';
    this.filters = { sources: { design: true, mockup: true, feature: true, qa: true }, status: '', layer: '', search: '' };
    this.dirty = new Set(); // source names with unsaved changes
    this.layoutDirection = 'FISH';
  }

  select(uid) {
    this.selection.clear();
    if (uid) this.selection.add(uid);
    this.bus.emit('selection-changed', { selected: uid });
  }

  toggleSource(source) {
    this.filters.sources[source] = !this.filters.sources[source];
    this.bus.emit('filters-changed', this.filters);
  }

  setFilter(key, value) {
    this.filters[key] = value;
    this.bus.emit('filters-changed', this.filters);
  }

  setView(view) {
    this.activeView = view;
    this.bus.emit('view-changed', view);
  }

  markDirty(source) {
    this.dirty.add(source);
    this.bus.emit('dirty-changed', this.dirty);
  }

  clearDirty(source) {
    this.dirty.delete(source);
    this.bus.emit('dirty-changed', this.dirty);
  }

  toggleLayout() {
    this.layoutDirection = this.layoutDirection === 'FISH' ? 'TREE' : 'FISH';
    this.bus.emit('layout-changed', this.layoutDirection);
  }
}

// ── Unified Graph Builder ──
class UnifiedGraphBuilder {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this._nodeMap = new Map(); // uid → node
    this._edgeSet = new Set(); // dedup key
  }

  build(sources) {
    this.nodes = [];
    this.edges = [];
    this._nodeMap = new Map();
    this._edgeSet = new Set();

    if (sources.design) this._extractDesign(sources.design);
    if (sources.mockup) this._extractMockup(sources.mockup);
    if (sources.feature) this._extractFeature(sources.feature);
    if (sources.qa) this._extractQA(sources.qa);

    // Build cross-reference edges
    if (sources.design) this._extractDesignEdges(sources.design);
    if (sources.mockup) this._extractMockupEdges(sources.mockup);
    if (sources.feature) this._extractFeatureEdges(sources.feature);
    if (sources.qa) this._extractQAEdges(sources.qa, sources.mockup, sources.design);

    return { nodes: this.nodes, edges: this.edges };
  }

  _addNode(node) {
    if (this._nodeMap.has(node.uid)) return;
    this._nodeMap.set(node.uid, node);
    this.nodes.push(node);
  }

  _addEdge(source, target, type, label) {
    if (!this._nodeMap.has(source) || !this._nodeMap.has(target)) return;
    if (source === target) return;
    const key = [source, target, type].sort().join('|');
    if (this._edgeSet.has(key)) return;
    this._edgeSet.add(key);
    this.edges.push({ source, target, type, label: label || type });
  }

  getNode(uid) { return this._nodeMap.get(uid); }

  getConnected(uid) {
    const connected = [];
    for (const e of this.edges) {
      if (e.source === uid) connected.push({ edge: e, node: this._nodeMap.get(e.target), direction: 'out' });
      if (e.target === uid) connected.push({ edge: e, node: this._nodeMap.get(e.source), direction: 'in' });
    }
    return connected;
  }

  getOrphans() {
    const connected = new Set();
    for (const e of this.edges) { connected.add(e.source); connected.add(e.target); }
    return this.nodes.filter(n => !connected.has(n.uid) && !n.parentUid && n.nodeType !== 'epic' && n.nodeType !== 'qa-module');
  }

  // ── Design Doc Extraction ──
  _extractDesign(data) {
    for (const ent of data.entities || []) {
      this._addNode({
        uid: `design:${ent.id}`, source: 'design', nodeType: 'entity', id: ent.id,
        label: `${ent.id}: ${ent.name}`, name: ent.name, nameTh: ent.name_th,
        status: ent.status || 'draft', metadata: ent, parentUid: null,
        layer: 'domain', complexity: null
      });
    }
    for (const api of data.api_endpoints || []) {
      this._addNode({
        uid: `design:${api.id}`, source: 'design', nodeType: 'api', id: api.id,
        label: `${api.id}: ${api.method} ${api.path}`, name: `${api.method} ${api.path}`,
        status: api.status || 'draft', metadata: api, parentUid: null,
        layer: 'presentation', complexity: null
      });
    }
    for (const role of data.user_roles || []) {
      this._addNode({
        uid: `design:${role.id}`, source: 'design', nodeType: 'role', id: role.id,
        label: `${role.id}: ${role.name}`, name: role.name, nameTh: role.name_th,
        status: 'defined', metadata: role, parentUid: null,
        layer: 'cross-cutting', complexity: null
      });
    }
  }

  _extractDesignEdges(data) {
    for (const ent of data.entities || []) {
      const fromUid = `design:${ent.id}`;
      // mockup_entity_ref → mockup entity
      if (ent.mockup_entity_ref) {
        this._addEdge(fromUid, `mockup:entity:${ent.mockup_entity_ref}`, 'entity_ref', 'maps to UI');
      }
      // feature_ids
      for (const fid of ent.feature_ids || []) {
        this._addEdge(fromUid, `feature:${fid}`, 'implements', 'implemented by');
      }
    }
    for (const api of data.api_endpoints || []) {
      const fromUid = `design:${api.id}`;
      if (api.entity_ref) {
        this._addEdge(fromUid, `design:${api.entity_ref}`, 'entity_ref', 'serves entity');
      }
      if (api.feature_id) {
        this._addEdge(fromUid, `feature:${api.feature_id}`, 'implements', 'implemented by');
      }
      for (const pageId of api.page_refs || []) {
        this._addEdge(fromUid, `mockup:page:${pageId}`, 'page_ref', 'used on page');
      }
    }
  }

  // ── Mockup Extraction ──
  _extractMockup(data) {
    for (const ent of data.entities || []) {
      this._addNode({
        uid: `mockup:entity:${ent.name}`, source: 'mockup', nodeType: 'mockup-entity', id: ent.name,
        label: `UI: ${ent.name}`, name: ent.name, nameTh: ent.name_th,
        status: ent.sync_status || 'pending', metadata: ent, parentUid: null,
        layer: 'presentation', complexity: ent.complexity
      });
    }
    for (const page of data.pages || []) {
      const parentUid = page.crud_group ? `mockup:entity:${page.crud_group}` : null;
      this._addNode({
        uid: `mockup:page:${page.id}`, source: 'mockup', nodeType: 'page', id: page.id,
        label: `${page.id}: ${page.name}`, name: page.name, nameTh: page.name_th,
        status: page.status || 'pending', metadata: page, parentUid,
        layer: 'presentation', complexity: page.complexity
      });
    }
  }

  _extractMockupEdges(data) {
    for (const ent of data.entities || []) {
      const fromUid = `mockup:entity:${ent.name}`;
      if (ent.design_doc_entity_ref) {
        this._addEdge(fromUid, `design:${ent.design_doc_entity_ref}`, 'entity_ref', 'from design');
      }
    }
    for (const page of data.pages || []) {
      const fromUid = `mockup:page:${page.id}`;
      for (const apiRef of page.design_doc_api_refs || []) {
        this._addEdge(fromUid, `design:${apiRef}`, 'api_ref', 'calls API');
      }
      for (const fid of page.implemented_by_features || []) {
        this._addEdge(fromUid, `feature:${fid}`, 'implements', 'built by feature');
      }
    }
  }

  // ── Feature Extraction ──
  _extractFeature(data) {
    for (const epic of data.epics || []) {
      this._addNode({
        uid: `epic:${epic.id}`, source: 'feature', nodeType: 'epic', id: epic.id,
        label: `Epic: ${epic.name}`, name: epic.name,
        status: 'defined', metadata: epic, parentUid: null,
        layer: null, complexity: null
      });
    }
    for (const feat of data.features || []) {
      const parentUid = feat.epic ? `epic:${feat.epic}` : null;
      this._addNode({
        uid: `feature:${feat.id}`, source: 'feature', nodeType: 'feature', id: String(feat.id),
        label: `#${feat.id}: ${feat.description}`, name: feat.description,
        status: feat.status || 'pending', metadata: feat, parentUid,
        layer: feat.layer, complexity: feat.complexity
      });
      // Subtasks
      for (const sub of feat.subtasks || []) {
        this._addNode({
          uid: `feature:${feat.id}:sub:${sub.id}`, source: 'feature', nodeType: 'subtask', id: sub.id,
          label: `${sub.id}: ${sub.description}`, name: sub.description,
          status: sub.done ? 'completed' : 'pending', metadata: sub,
          parentUid: `feature:${feat.id}`, layer: feat.layer, complexity: null
        });
      }
    }
  }

  _extractFeatureEdges(data) {
    for (const epic of data.epics || []) {
      for (const fid of epic.features || []) {
        this._addEdge(`epic:${epic.id}`, `feature:${fid}`, 'contains', 'contains');
      }
    }
    for (const feat of data.features || []) {
      const fromUid = `feature:${feat.id}`;
      // design_doc_refs
      const refs = feat.design_doc_refs || {};
      if (refs.entity_ref) {
        this._addEdge(fromUid, `design:${refs.entity_ref}`, 'entity_ref', 'implements entity');
      }
      if (refs.api_ref) {
        this._addEdge(fromUid, `design:${refs.api_ref}`, 'api_ref', 'implements API');
      }
      // mockup_page_refs
      for (const pageId of feat.mockup_page_refs || []) {
        this._addEdge(fromUid, `mockup:page:${pageId}`, 'mockup_ref', 'builds page');
      }
      // dependencies
      for (const dep of feat.dependencies || []) {
        this._addEdge(fromUid, `feature:${dep}`, 'depends_on', 'depends on');
      }
      // subtask depends_on
      for (const sub of feat.subtasks || []) {
        for (const depId of sub.depends_on || []) {
          this._addEdge(`feature:${feat.id}:sub:${sub.id}`, `feature:${feat.id}:sub:${depId}`, 'depends_on', 'after');
        }
      }
    }
  }

  // ── QA Extraction ──
  _extractQA(data) {
    // Auto-create modules from scenario.module if modules[] is empty
    const moduleNames = new Set();
    if (data.modules && data.modules.length > 0) {
      for (const mod of data.modules) {
        moduleNames.add(mod.name || mod.id || mod);
        this._addNode({
          uid: `qa:module:${mod.name || mod.id || mod}`, source: 'qa', nodeType: 'qa-module',
          id: mod.name || mod.id || mod,
          label: `QA: ${mod.name || mod.id || mod}`, name: mod.name || mod.id || mod,
          status: 'defined', metadata: mod, parentUid: null,
          layer: null, complexity: null
        });
      }
    }
    for (const sc of data.scenarios || []) {
      const modName = sc.module || 'unassigned';
      // Auto-create module node
      if (!moduleNames.has(modName)) {
        moduleNames.add(modName);
        this._addNode({
          uid: `qa:module:${modName}`, source: 'qa', nodeType: 'qa-module', id: modName,
          label: `QA: ${modName}`, name: modName,
          status: 'defined', metadata: { name: modName }, parentUid: null,
          layer: null, complexity: null
        });
      }
      const scId = sc.id || `${modName}-${sc.title || 'unknown'}`;
      this._addNode({
        uid: `qa:${scId}`, source: 'qa', nodeType: 'scenario', id: scId,
        label: `${scId}: ${sc.title || sc.name || sc.description || ''}`,
        name: sc.title || sc.name || sc.description || scId,
        status: sc.status || 'pending', metadata: sc,
        parentUid: `qa:module:${modName}`, layer: null, complexity: null
      });
    }
  }

  _extractQAEdges(qaData, mockupData, designData) {
    if (!qaData) return;

    // Build lookup maps for heuristic matching
    const pageByUrl = new Map();
    if (mockupData) {
      for (const page of mockupData.pages || []) {
        if (page.url) pageByUrl.set(page.url.toLowerCase(), `mockup:page:${page.id}`);
      }
    }
    const entityByName = new Map();
    if (designData) {
      for (const ent of designData.entities || []) {
        if (ent.name) entityByName.set(ent.name.toLowerCase(), `design:${ent.id}`);
      }
    }

    for (const sc of qaData.scenarios || []) {
      const scId = sc.id || `${sc.module || 'unassigned'}-${sc.title || 'unknown'}`;
      const scUid = `qa:${scId}`;

      // Heuristic: url match
      if (sc.url && pageByUrl.has(sc.url.toLowerCase())) {
        this._addEdge(scUid, pageByUrl.get(sc.url.toLowerCase()), 'url_match', 'tests page');
      }

      // Heuristic: module name ↔ entity name
      if (sc.module) {
        const modLower = sc.module.toLowerCase();
        if (entityByName.has(modLower)) {
          this._addEdge(`qa:module:${sc.module}`, entityByName.get(modLower), 'inferred_ref', 'tests entity');
        }
      }
    }
  }
}

// ── File Loader ──
class FileLoader {
  constructor(bus) {
    this.bus = bus;
    this.rawSources = { design: null, mockup: null, feature: null, qa: null };
    this.originalClones = { design: null, mockup: null, feature: null, qa: null };
    this.activityLogs = [];
  }

  detectSourceType(data) {
    if (data.api_endpoints && data.entities && data.diagrams) return 'design';
    if (data.pages && data.entities && data.categories) return 'mockup';
    if (data.features && data.epics) return 'feature';
    if (data.scenarios !== undefined || data.page_types) return 'qa';
    // Fallback: check schema_version patterns
    if (data.schema_version) {
      const v = data.schema_version;
      if (v.startsWith('2.1')) return 'design';
      if (v.startsWith('1.7')) return 'mockup';
      if (v.startsWith('2.3')) return 'feature';
      if (v.startsWith('1.4')) return 'qa';
    }
    return null;
  }

  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const type = this.detectSourceType(data);
          if (!type) { reject(new Error(`Cannot detect file type for ${file.name}`)); return; }
          this.rawSources[type] = data;
          this.originalClones[type] = JSON.parse(JSON.stringify(data));
          this.bus.emit('file-loaded', { type, fileName: file.name, data });
          resolve(type);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async loadMultipleFiles(files) {
    const results = [];
    for (const file of files) {
      try {
        const type = await this.loadFromFile(file);
        results.push({ type, success: true });
      } catch (err) {
        results.push({ error: err.message, success: false });
      }
    }
    return results;
  }

  loadDemoData() {
    // Demo data embedded as minimal examples
    this.rawSources.design = this._demoDesign();
    this.rawSources.mockup = this._demoMockup();
    this.rawSources.feature = this._demoFeature();
    this.rawSources.qa = this._demoQA();

    for (const type of ['design', 'mockup', 'feature', 'qa']) {
      this.originalClones[type] = JSON.parse(JSON.stringify(this.rawSources[type]));
      this.bus.emit('file-loaded', { type, fileName: `demo-${type}.json`, data: this.rawSources[type] });
    }
  }

  async loadFromAPI() {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      for (const type of ['design', 'mockup', 'feature', 'qa']) {
        if (data[type]) {
          this.rawSources[type] = data[type];
          this.originalClones[type] = JSON.parse(JSON.stringify(data[type]));
          this.bus.emit('file-loaded', { type, fileName: type + ' (server)', data: data[type] });
        }
      }
      if (data.activity) {
        this.activityLogs = data.activity;
        this.bus.emit('activity-loaded', data.activity);
      }
      return true;
    } catch (e) {
      console.error('API load failed:', e);
      return false;
    }
  }

  async saveToAPI(sourceType) {
    const json = JSON.stringify(this.rawSources[sourceType], null, 2);
    try {
      const res = await fetch('/api/data/' + sourceType, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: json });
      const result = await res.json();
      if (result.ok) this.bus.emit('save-success', sourceType);
      return result.ok;
    } catch (e) {
      console.error('API save failed:', e);
      return false;
    }
  }

  async postTask(task) {
    try {
      const res = await fetch('/api/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
      return await res.json();
    } catch (e) {
      console.error('Task post failed:', e);
      return null;
    }
  }

  getProjectName() {
    for (const src of [this.rawSources.feature, this.rawSources.design, this.rawSources.mockup]) {
      if (src) {
        const name = src.project || src.project_name;
        if (name && !name.includes('PROJECT_NAME') && !name.includes('[')) return name;
      }
    }
    return 'Demo Project';
  }

  getModifiedJSON(sourceType) {
    const original = this.originalClones[sourceType];
    const current = this.rawSources[sourceType];
    if (!original || !current) return null;
    return JSON.stringify(current, null, 2);
  }

  downloadJSON(sourceType) {
    const json = this.getModifiedJSON(sourceType);
    if (!json) return;
    const fileNames = { design: 'design_doc_list.json', mockup: 'mockup_list.json', feature: 'feature_list.json', qa: 'qa-tracker.json' };
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNames[sourceType] || `${sourceType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Demo Data ──
  _demoDesign() {
    return {
      schema_version: "2.1.0", project_name: "Demo Project", description: "Demo system design",
      technology_stack: { backend: ".NET 8", frontend: "React", database: "PostgreSQL" },
      integration: { mockup_list_path: ".mockups/mockup_list.json", feature_list_path: "feature_list.json" },
      layers: [
        { id: "presentation", name: "Presentation Layer", design_sections: ["sitemap", "flow_diagrams", "ui_mockups"] },
        { id: "application", name: "Application Layer", design_sections: ["dfd", "sequence_diagrams"] },
        { id: "domain", name: "Domain Layer", design_sections: ["er_diagram", "data_dictionary"] },
        { id: "infrastructure", name: "Infrastructure Layer", design_sections: ["data_model", "modules"] },
        { id: "cross-cutting", name: "Cross-Cutting Layer", design_sections: ["security", "logging"] }
      ],
      entities: [
        { id: "ENT-001", name: "User", name_th: "ผู้ใช้", table_name: "users", description: "User entity", mockup_entity_ref: "User", feature_ids: [3, 5, 6, 7, 8, 9], pages: ["004", "005", "006"], crud_operations: { create: { enabled: true }, read: { enabled: true }, update: { enabled: true }, delete: { enabled: true, strategy: "soft" }, list: { enabled: true } }, relationships: [], attributes: [], status: "defined" },
        { id: "ENT-002", name: "Department", name_th: "แผนก", table_name: "departments", description: "Department entity", mockup_entity_ref: "Department", feature_ids: [], pages: ["007"], crud_operations: { create: { enabled: true }, read: { enabled: true }, update: { enabled: true }, delete: { enabled: true, strategy: "soft" }, list: { enabled: true } }, relationships: [], attributes: [], status: "draft" }
      ],
      api_endpoints: [
        { id: "API-001", method: "GET", path: "/api/users", description: "List all users", entity_ref: "ENT-001", feature_id: 5, page_refs: ["004"], auth_required: true, status: "defined" },
        { id: "API-002", method: "GET", path: "/api/users/:id", description: "Get user by ID", entity_ref: "ENT-001", feature_id: 6, page_refs: ["006"], auth_required: true, status: "defined" },
        { id: "API-003", method: "POST", path: "/api/users", description: "Create user", entity_ref: "ENT-001", feature_id: 7, page_refs: ["005"], auth_required: true, status: "defined" },
        { id: "API-004", method: "PUT", path: "/api/users/:id", description: "Update user", entity_ref: "ENT-001", feature_id: 8, page_refs: ["005"], auth_required: true, status: "draft" },
        { id: "API-005", method: "DELETE", path: "/api/users/:id", description: "Delete user", entity_ref: "ENT-001", feature_id: 9, page_refs: [], auth_required: true, status: "draft" }
      ],
      user_roles: [
        { id: "ROLE-001", name: "Admin", name_th: "ผู้ดูแลระบบ", description: "Full access", permissions: ["all"], accessible_pages: ["001","002","003","004","005","006","007"] },
        { id: "ROLE-002", name: "User", name_th: "ผู้ใช้ทั่วไป", description: "Basic access", permissions: ["read"], accessible_pages: ["001","002","003"] }
      ],
      diagrams: { er_diagram: { exists: true }, flow_diagrams: [], sequence_diagrams: [], sitemap: { exists: true } },
      documents: [], validation_rules: {}, sync_status: { mockups: {}, features: {} }, summary: {}, metadata: { schema_version: "2.1.0" }
    };
  }

  _demoMockup() {
    return {
      schema_version: "1.7.0", project: "Demo Project", description: "Demo mockup list",
      integration: { design_doc_path: "design_doc_list.json", feature_list_path: "feature_list.json" },
      entities: [
        { name: "User", name_th: "ผู้ใช้", complexity: "complex", ui_pattern: "page", pages: ["004","005","006"], design_doc_entity_ref: "ENT-001", crud_actions: { list: { enabled: true, ui_type: "page" }, view: { enabled: true, ui_type: "page" }, create: { enabled: true, ui_type: "page" }, edit: { enabled: true, ui_type: "page" }, delete: { enabled: true, ui_type: "sweetalert2", strategy: "soft" } }, sync_status: "pending" },
        { name: "Department", name_th: "แผนก", complexity: "simple", ui_pattern: "modal", pages: ["007"], design_doc_entity_ref: "ENT-002", crud_actions: { list: { enabled: true }, view: { enabled: true, ui_type: "modal" }, create: { enabled: true, ui_type: "modal" }, edit: { enabled: true, ui_type: "modal" }, delete: { enabled: true, ui_type: "sweetalert2", strategy: "soft" } }, sync_status: "pending" }
      ],
      pages: [
        { id: "001", name: "Login", name_th: "เข้าสู่ระบบ", url: "/auth/login", access: "Public", category: "auth", priority: "high", crud_group: null, crud_type: null, design_doc_section: "authentication", design_doc_api_refs: [], implemented_by_features: [], status: "pending", related_pages: ["002"] },
        { id: "002", name: "Register", name_th: "ลงทะเบียน", url: "/auth/register", access: "Public", category: "auth", priority: "high", crud_group: null, crud_type: null, design_doc_section: "authentication", design_doc_api_refs: [], implemented_by_features: [], status: "pending", related_pages: ["001"] },
        { id: "003", name: "Dashboard", name_th: "แดชบอร์ด", url: "/dashboard", access: "User", category: "main", priority: "high", crud_group: null, crud_type: null, design_doc_section: "dashboard", design_doc_api_refs: [], implemented_by_features: [], status: "pending", related_pages: [] },
        { id: "004", name: "User List", name_th: "รายการผู้ใช้", url: "/admin/users", access: "Admin", category: "list", priority: "medium", crud_group: "User", crud_type: "list", design_doc_section: "user-management", design_doc_api_refs: ["API-001"], implemented_by_features: [5], status: "pending", complexity: "complex" },
        { id: "005", name: "User Form", name_th: "ฟอร์มผู้ใช้", url: "/admin/users/new", access: "Admin", category: "form", priority: "medium", crud_group: "User", crud_type: "form", design_doc_section: "user-management", design_doc_api_refs: ["API-003","API-004"], implemented_by_features: [7,8], status: "pending", complexity: "complex" },
        { id: "006", name: "User Detail", name_th: "รายละเอียดผู้ใช้", url: "/admin/users/:id", access: "Admin", category: "detail", priority: "medium", crud_group: "User", crud_type: "detail", design_doc_section: "user-management", design_doc_api_refs: ["API-002"], implemented_by_features: [6], status: "pending", complexity: "complex" },
        { id: "007", name: "Department List", name_th: "รายการแผนก", url: "/admin/departments", access: "Admin", category: "list", priority: "low", crud_group: "Department", crud_type: "list", design_doc_section: "master-data", design_doc_api_refs: [], implemented_by_features: [], status: "pending", complexity: "simple" }
      ],
      categories: { auth: "Authentication", main: "Main", list: "List", form: "Form", detail: "Detail", admin: "Admin", reports: "Reports" },
      sync_status: {}, summary: { total: 7, pending: 7 }, metadata: { schema_version: "1.7.0" }
    };
  }

  _demoFeature() {
    return {
      schema_version: "2.3.0", project: "Demo Project", description: "Demo feature list",
      technology: { framework: ".NET 8", language: "C#", database: "PostgreSQL" },
      integration: { design_doc_path: "design_doc_list.json", mockup_list_path: ".mockups/mockup_list.json" },
      model_config: { available_models: { opus: { role: "architect" }, sonnet: { role: "implementer" } } },
      layers: [
        { id: "presentation", name: "Presentation Layer", categories: ["api","feature-frontend"] },
        { id: "domain", name: "Domain Layer", categories: ["domain"] },
        { id: "infrastructure", name: "Infrastructure Layer", categories: ["setup","data"] },
        { id: "cross-cutting", name: "Cross-Cutting Layer", categories: ["quality"] }
      ],
      epics: [
        { id: "setup", name: "Project Setup", description: "Setup project", features: [1, 2], progress: { total: 2, passed: 0 } },
        { id: "domain", name: "Domain Layer", description: "Entities and business logic", features: [3, 4], progress: { total: 2, passed: 0 } },
        { id: "api", name: "API Endpoints", description: "REST API CRUD operations", features: [5, 6, 7, 8, 9], progress: { total: 5, passed: 0 } },
        { id: "quality", name: "Quality", description: "Validation, error handling", features: [10, 11, 12], progress: { total: 3, passed: 0 } }
      ],
      features: [
        { id: 1, epic: "setup", layer: "infrastructure", category: "setup", description: "Create project structure", priority: "high", complexity: "simple", status: "passed", subtasks: [{ id: "1.1", description: "Create new project", done: true }, { id: "1.2", description: "Setup config", done: true }, { id: "1.3", description: "Test run", done: true }], dependencies: [], design_doc_refs: { entity_ref: null, api_ref: null, section: "setup" }, mockup_page_refs: [] },
        { id: 2, epic: "setup", layer: "infrastructure", category: "setup", description: "Setup database & ORM", priority: "high", complexity: "medium", status: "passed", subtasks: [{ id: "2.1", description: "Add packages", done: true }, { id: "2.2", description: "Setup connection", done: true }, { id: "2.3", description: "Test connection", done: true }], dependencies: [1], design_doc_refs: { entity_ref: null, section: "data_model" }, mockup_page_refs: [] },
        { id: 3, epic: "domain", layer: "domain", category: "domain", description: "Create User entity", priority: "high", complexity: "medium", status: "in_progress", subtasks: [{ id: "3.1", description: "Create model class", done: true }, { id: "3.2", description: "Add properties", done: true }, { id: "3.3", description: "Add validations", done: false }], dependencies: [1], design_doc_refs: { entity_ref: "ENT-001", section: "er_diagram" }, mockup_page_refs: [] },
        { id: 4, epic: "domain", layer: "infrastructure", category: "data", description: "Create DbContext & Migration", priority: "high", complexity: "medium", status: "pending", subtasks: [{ id: "4.1", description: "Create DbContext", done: false }, { id: "4.2", description: "Configure entities", done: false }, { id: "4.3", description: "Run migration", done: false }], dependencies: [2, 3], design_doc_refs: { entity_ref: "ENT-001", section: "data_model" }, mockup_page_refs: [] },
        { id: 5, epic: "api", layer: "presentation", category: "api", description: "GET /api/users - List all", priority: "high", complexity: "medium", status: "pending", subtasks: [{ id: "5.1", description: "Create Controller", done: false }, { id: "5.2", description: "Implement endpoint", done: false }], dependencies: [4], design_doc_refs: { entity_ref: "ENT-001", api_ref: "API-001" }, mockup_page_refs: ["004"] },
        { id: 6, epic: "api", layer: "presentation", category: "api", description: "GET /api/users/:id - Get by ID", priority: "high", complexity: "simple", status: "pending", subtasks: [], dependencies: [5], design_doc_refs: { entity_ref: "ENT-001", api_ref: "API-002" }, mockup_page_refs: ["006"] },
        { id: 7, epic: "api", layer: "presentation", category: "api", description: "POST /api/users - Create", priority: "high", complexity: "medium", status: "pending", subtasks: [], dependencies: [5], design_doc_refs: { entity_ref: "ENT-001", api_ref: "API-003" }, mockup_page_refs: ["005"] },
        { id: 8, epic: "api", layer: "presentation", category: "api", description: "PUT /api/users/:id - Update", priority: "medium", complexity: "medium", status: "pending", subtasks: [], dependencies: [6], design_doc_refs: { entity_ref: "ENT-001", api_ref: "API-004" }, mockup_page_refs: ["005"] },
        { id: 9, epic: "api", layer: "presentation", category: "api", description: "DELETE /api/users/:id - Delete", priority: "medium", complexity: "simple", status: "pending", subtasks: [], dependencies: [6], design_doc_refs: { entity_ref: "ENT-001", api_ref: "API-005" }, mockup_page_refs: [] },
        { id: 10, epic: "quality", layer: "cross-cutting", category: "quality", description: "Input validation", priority: "medium", complexity: "medium", status: "pending", subtasks: [], dependencies: [7, 8], design_doc_refs: { section: "validation" }, mockup_page_refs: [] },
        { id: 11, epic: "quality", layer: "cross-cutting", category: "quality", description: "Error handling", priority: "medium", complexity: "medium", status: "pending", subtasks: [], dependencies: [5], design_doc_refs: { section: "error-handling" }, mockup_page_refs: [] },
        { id: 12, epic: "quality", layer: "cross-cutting", category: "quality", description: "API documentation", priority: "low", complexity: "simple", status: "pending", subtasks: [], dependencies: [5], design_doc_refs: { section: "api-documentation" }, mockup_page_refs: [] }
      ],
      flows: [], sync_status: {}, summary: { total: 12, passed: 2, in_progress: 1, pending: 9 },
      metadata: { schema_version: "2.3.0" }
    };
  }

  _demoQA() {
    return {
      schema_version: "1.4.0", project: "Demo Project", base_url: "http://localhost:3000",
      technology: ".NET 8 + React", login_url: "/login",
      model_config: { scenario_creator: "sonnet", test_runner: "sonnet", reviewer: "opus" },
      roles: [{ name: "Admin", username: "admin@demo.com" }, { name: "User", username: "user@demo.com" }],
      role_page_access: { Admin: ["001","002","003","004","005","006","007"], User: ["001","002","003"] },
      modules: [],
      page_types: ["form", "master-data", "master-detail"],
      scenarios: [
        { id: "TS-USER-001", title: "View user list with pagination", module: "USER", url: "/admin/users", type: "master-data", priority: "high", status: "pending" },
        { id: "TS-USER-002", title: "Create new user with valid data", module: "USER", url: "/admin/users/new", type: "form", priority: "high", status: "pending" },
        { id: "TS-USER-003", title: "Edit existing user", module: "USER", url: "/admin/users/new", type: "form", priority: "medium", status: "pending" },
        { id: "TS-USER-004", title: "Soft delete user with confirmation", module: "USER", url: "/admin/users", type: "master-data", priority: "medium", status: "pending" },
        { id: "TS-USER-005", title: "Search and filter users", module: "USER", url: "/admin/users", type: "master-data", priority: "medium", status: "pending" },
        { id: "TS-AUTH-001", title: "Login with valid credentials", module: "AUTH", url: "/auth/login", type: "form", priority: "critical", status: "passed" },
        { id: "TS-AUTH-002", title: "Login with invalid password", module: "AUTH", url: "/auth/login", type: "form", priority: "high", status: "passed" },
        { id: "TS-AUTH-003", title: "Register new account", module: "AUTH", url: "/auth/register", type: "form", priority: "high", status: "failed" },
        { id: "TS-DEPT-001", title: "View department list", module: "DEPARTMENT", url: "/admin/departments", type: "master-data", priority: "medium", status: "pending" }
      ],
      summary: { total_scenarios: 9, passed: 2, failed: 1, pending: 6 },
      metadata: { schema_version: "1.4.0" }
    };
  }
}

// ── App Initialization ──
class TrackerApp {
  constructor() {
    this.bus = new EventBus();
    this.state = new StateManager(this.bus);
    this.loader = new FileLoader(this.bus);
    this.graph = new UnifiedGraphBuilder();
    this._graphData = null;
  }

  buildGraph() {
    this._graphData = this.graph.build(this.loader.rawSources);
    this._updateStats();
    this.bus.emit('graph-built', this._graphData);
    return this._graphData;
  }

  _updateStats() {
    const data = this._graphData;
    if (!data) return;

    const counts = { design: 0, mockup: 0, feature: 0, qa: 0 };
    for (const n of data.nodes) counts[n.source] = (counts[n.source] || 0) + 1;

    document.getElementById('count-design').textContent = counts.design;
    document.getElementById('count-mockup').textContent = counts.mockup;
    document.getElementById('count-feature').textContent = counts.feature;
    document.getElementById('count-qa').textContent = counts.qa;
    document.getElementById('stat-nodes').textContent = data.nodes.length;
    document.getElementById('stat-edges').textContent = data.edges.length;
    document.getElementById('stat-orphans').textContent = this.graph.getOrphans().length;

    // Sync percentage: nodes with at least one cross-source edge
    const crossSourceNodes = new Set();
    for (const e of data.edges) {
      const sn = this.graph.getNode(e.source);
      const tn = this.graph.getNode(e.target);
      if (sn && tn && sn.source !== tn.source) {
        crossSourceNodes.add(e.source);
        crossSourceNodes.add(e.target);
      }
    }
    const topLevel = data.nodes.filter(n => !n.parentUid && n.nodeType !== 'subtask');
    const pct = topLevel.length > 0 ? Math.round((crossSourceNodes.size / topLevel.length) * 100) : 0;
    document.getElementById('stat-sync').textContent = `${Math.min(pct, 100)}%`;
  }

  connectSSE() {
    if (typeof EventSource === 'undefined') return;
    const es = new EventSource('/api/events');
    const indicator = document.getElementById('sse-indicator');

    es.onopen = () => {
      if (indicator) { indicator.classList.remove('disconnected'); indicator.classList.add('connected'); indicator.title = 'Connected to server'; }
    };

    es.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data);
        if (event.type === 'file-changed') {
          this.loader.loadFromAPI().then(() => {
            const graphData = this.buildGraph();
            this.bus.emit('graph-rebuilt', graphData);
          });
        }
      } catch {}
    };

    es.onerror = () => {
      if (indicator) { indicator.classList.remove('connected'); indicator.classList.add('disconnected'); indicator.title = 'Disconnected'; }
    };
  }

  isAPIMode() {
    return window.location.hostname === 'localhost' && !window.location.protocol.startsWith('file');
  }

  updateNodeInSource(uid, updates) {
    const node = this.graph.getNode(uid);
    if (!node) return;

    const src = this.loader.rawSources[node.source];
    if (!src) return;

    // Find the array and index
    let arr, idx;
    if (node.source === 'design') {
      if (node.nodeType === 'entity') { arr = src.entities; idx = arr.findIndex(e => e.id === node.metadata.id); }
      else if (node.nodeType === 'api') { arr = src.api_endpoints; idx = arr.findIndex(e => e.id === node.metadata.id); }
      else if (node.nodeType === 'role') { arr = src.user_roles; idx = arr.findIndex(e => e.id === node.metadata.id); }
    } else if (node.source === 'mockup') {
      if (node.nodeType === 'page') { arr = src.pages; idx = arr.findIndex(e => e.id === node.metadata.id); }
      else if (node.nodeType === 'mockup-entity') { arr = src.entities; idx = arr.findIndex(e => e.name === node.metadata.name); }
    } else if (node.source === 'feature') {
      if (node.nodeType === 'feature') { arr = src.features; idx = arr.findIndex(e => e.id === node.metadata.id); }
      else if (node.nodeType === 'epic') { arr = src.epics; idx = arr.findIndex(e => e.id === node.metadata.id); }
    } else if (node.source === 'qa') {
      if (node.nodeType === 'scenario') { arr = src.scenarios; idx = arr.findIndex(e => e.id === node.metadata.id); }
    }

    if (arr && idx >= 0) {
      Object.assign(arr[idx], updates);
      this.state.markDirty(node.source);
    }
  }

  addNodeToSource(sourceType, nodeType, data) {
    const src = this.loader.rawSources[sourceType];
    if (!src) return null;

    if (sourceType === 'design') {
      if (nodeType === 'entity') {
        const nextId = this._nextId(src.entities, 'ENT');
        const entry = { id: nextId, name: data.name || 'New Entity', name_th: data.name_th || '', table_name: data.table_name || '', description: data.description || '', mockup_entity_ref: null, feature_ids: [], pages: [], crud_operations: { create: { enabled: true }, read: { enabled: true }, update: { enabled: true }, delete: { enabled: true, strategy: "soft" }, list: { enabled: true } }, relationships: [], attributes: [], status: 'draft' };
        src.entities.push(entry);
        this.state.markDirty('design');
        return entry;
      } else if (nodeType === 'api') {
        const nextId = this._nextId(src.api_endpoints, 'API');
        const entry = { id: nextId, method: data.method || 'GET', path: data.path || '/api/resource', description: data.description || '', entity_ref: null, feature_id: null, page_refs: [], auth_required: true, status: 'draft' };
        src.api_endpoints.push(entry);
        this.state.markDirty('design');
        return entry;
      }
    } else if (sourceType === 'mockup') {
      if (nodeType === 'page') {
        const ids = (src.pages || []).map(p => parseInt(p.id)).filter(n => !isNaN(n));
        const nextNum = (Math.max(0, ...ids) + 1).toString().padStart(3, '0');
        const entry = { id: nextNum, name: data.name || 'New Page', name_th: data.name_th || '', url: data.url || '/', access: 'User', category: data.category || 'main', priority: 'medium', crud_group: data.crud_group || null, crud_type: data.crud_type || null, design_doc_section: '', design_doc_api_refs: [], implemented_by_features: [], status: 'pending' };
        src.pages.push(entry);
        this.state.markDirty('mockup');
        return entry;
      }
    } else if (sourceType === 'feature') {
      if (nodeType === 'feature') {
        const ids = (src.features || []).map(f => f.id);
        const nextId = Math.max(0, ...ids) + 1;
        const entry = { id: nextId, epic: data.epic || 'setup', layer: data.layer || 'presentation', category: data.category || 'feature', description: data.description || 'New feature', priority: data.priority || 'medium', complexity: data.complexity || 'medium', status: 'pending', subtasks: [], dependencies: [], design_doc_refs: { entity_ref: null, api_ref: null, section: '' }, mockup_page_refs: [] };
        src.features.push(entry);
        this.state.markDirty('feature');
        return entry;
      }
    } else if (sourceType === 'qa') {
      if (nodeType === 'scenario') {
        const mod = (data.module || 'GENERAL').toUpperCase();
        const existing = (src.scenarios || []).filter(s => s.module === mod);
        const nextNum = (existing.length + 1).toString().padStart(3, '0');
        const entry = { id: `TS-${mod}-${nextNum}`, title: data.title || 'New scenario', module: mod, url: data.url || '/', type: data.type || 'form', priority: data.priority || 'medium', status: 'pending' };
        src.scenarios.push(entry);
        this.state.markDirty('qa');
        return entry;
      }
    }
    return null;
  }

  _nextId(arr, prefix) {
    const nums = (arr || []).map(item => {
      const match = item.id?.match(new RegExp(`${prefix}-(\\d+)`));
      return match ? parseInt(match[1]) : 0;
    });
    const next = Math.max(0, ...nums) + 1;
    return `${prefix}-${next.toString().padStart(3, '0')}`;
  }
}

// ── Global Instance ──
const app = new TrackerApp();
window.app = app;
