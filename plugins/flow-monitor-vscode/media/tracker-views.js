/* ===== Tracker Views — Graph, Tree, Board, Table ===== */
/* Note: All user-provided strings are escaped via _escapeHtml (textContent-based)
   before insertion. Data source is user's own local JSON files only. */

// ── Color & Style Helpers ──
const SOURCE_COLORS = {
  design: { bg: '#6366f1', light: '#eef2ff', text: '#4f46e5', label: 'Design Doc' },
  mockup: { bg: '#10b981', light: '#ecfdf5', text: '#059669', label: 'Mockup' },
  feature: { bg: '#f59e0b', light: '#fffbeb', text: '#d97706', label: 'Feature' },
  qa: { bg: '#f43f5e', light: '#fff1f2', text: '#e11d48', label: 'QA' }
};

const NODE_COLORS = {
  entity: '#6366f1', api: '#64748b', role: '#8b5cf6',
  page: '#10b981', 'mockup-entity': '#059669',
  feature: '#f59e0b', subtask: '#fbbf24', epic: '#92400e',
  scenario: '#94a3b8', 'qa-module': '#f43f5e'
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function createStatusBadge(status) {
  if (!status) return document.createTextNode('');
  const span = document.createElement('span');
  span.className = `status-badge status-${status.replace(/\s/g, '_')}`;
  span.textContent = status;
  return span;
}

function createSourceBadge(source) {
  const info = SOURCE_COLORS[source] || { label: source };
  const span = document.createElement('span');
  span.className = `source-badge source-${escapeHtml(source)}`;
  span.textContent = info.label;
  return span;
}

function createDot(color) {
  const span = document.createElement('span');
  span.className = 'source-dot';
  span.style.background = color;
  return span;
}

// ── Graph View (Cytoscape) ──
class GraphView {
  constructor(containerId, appInstance) {
    this.app = appInstance;
    this.containerId = containerId;
    this.cy = null;
  }

  init(graphData) {
    const elements = this._buildElements(graphData);

    this.cy = cytoscape({
      container: document.getElementById(this.containerId),
      elements,
      style: this._getStyles(),
      layout: { name: 'preset' },
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.3
    });

    window.cy = this.cy;
    this._runLayout();
    this._bindEvents();
  }

  _buildElements(graphData) {
    const elements = [];
    const parentNodes = graphData.nodes.filter(n => ['epic', 'qa-module', 'mockup-entity'].includes(n.nodeType));
    const childNodes = graphData.nodes.filter(n => !['epic', 'qa-module', 'mockup-entity'].includes(n.nodeType));

    for (const n of parentNodes) {
      elements.push({ group: 'nodes', data: { id: n.uid, label: n.label, source: n.source, nodeType: n.nodeType, status: n.status, isParent: true } });
    }

    for (const n of childNodes) {
      const parent = n.parentUid && graphData.nodes.some(p => p.uid === n.parentUid) ? n.parentUid : undefined;
      elements.push({ group: 'nodes', data: { id: n.uid, label: n.label, source: n.source, nodeType: n.nodeType, status: n.status, parent, layer: n.layer, complexity: n.complexity } });
    }

    for (const e of graphData.edges) {
      elements.push({ group: 'edges', data: { id: `${e.source}>${e.target}`, source: e.source, target: e.target, edgeType: e.type, label: e.label } });
    }

    return elements;
  }

  _getStyles() {
    return [
      // Parent (compound) nodes
      { selector: 'node[?isParent]', style: { 'background-color': '#f8fafc', 'background-opacity': 0.6, 'border-width': 2, 'border-color': '#e2e8f0', 'border-style': 'dashed', 'label': 'data(label)', 'text-valign': 'top', 'text-halign': 'center', 'font-size': 11, 'font-weight': 600, 'color': '#64748b', 'padding': 20, 'text-margin-y': -8, 'shape': 'round-rectangle' }},
      { selector: 'node[nodeType="epic"]', style: { 'border-color': '#d97706', 'background-color': '#fffbeb' }},
      { selector: 'node[nodeType="qa-module"]', style: { 'border-color': '#f43f5e', 'background-color': '#fff1f2' }},
      { selector: 'node[nodeType="mockup-entity"]', style: { 'border-color': '#059669', 'background-color': '#ecfdf5' }},
      // Regular nodes
      { selector: 'node[!isParent]', style: { 'label': 'data(label)', 'text-valign': 'center', 'text-halign': 'center', 'text-wrap': 'wrap', 'text-max-width': 120, 'font-size': 10, 'color': '#fff', 'text-outline-width': 2, 'width': 60, 'height': 60, 'border-width': 2 }},
      { selector: 'node[nodeType="entity"]', style: { 'shape': 'round-rectangle', 'background-color': '#6366f1', 'text-outline-color': '#6366f1', 'width': 80, 'height': 50 }},
      { selector: 'node[nodeType="api"]', style: { 'shape': 'diamond', 'background-color': '#64748b', 'text-outline-color': '#64748b', 'width': 70, 'height': 70, 'font-size': 8 }},
      { selector: 'node[nodeType="role"]', style: { 'shape': 'triangle', 'background-color': '#8b5cf6', 'text-outline-color': '#8b5cf6', 'width': 50, 'height': 50 }},
      { selector: 'node[nodeType="page"]', style: { 'shape': 'rectangle', 'background-color': '#10b981', 'text-outline-color': '#10b981', 'width': 80, 'height': 45 }},
      { selector: 'node[nodeType="feature"]', style: { 'shape': 'hexagon', 'background-color': '#f59e0b', 'text-outline-color': '#f59e0b', 'width': 70, 'height': 60 }},
      { selector: 'node[nodeType="subtask"]', style: { 'shape': 'hexagon', 'background-color': '#fbbf24', 'text-outline-color': '#fbbf24', 'width': 40, 'height': 35, 'font-size': 7 }},
      { selector: 'node[nodeType="scenario"]', style: { 'shape': 'ellipse', 'background-color': '#94a3b8', 'text-outline-color': '#94a3b8', 'width': 55, 'height': 55, 'font-size': 8 }},
      { selector: 'node[nodeType="scenario"][status="passed"]', style: { 'background-color': '#10b981', 'text-outline-color': '#10b981' }},
      { selector: 'node[nodeType="scenario"][status="failed"]', style: { 'background-color': '#ef4444', 'text-outline-color': '#ef4444' }},
      // Status borders
      { selector: 'node[status="pending"]', style: { 'border-style': 'dashed', 'border-color': '#94a3b8' }},
      { selector: 'node[status="in_progress"]', style: { 'border-style': 'solid', 'border-color': '#3b82f6', 'border-width': 3 }},
      { selector: 'node[status="passed"], node[status="completed"]', style: { 'border-style': 'solid', 'border-color': '#10b981' }},
      { selector: 'node[status="failed"]', style: { 'border-style': 'solid', 'border-color': '#ef4444', 'border-width': 3 }},
      { selector: 'node[status="draft"]', style: { 'border-style': 'dotted', 'border-color': '#d97706' }},
      // Selection
      { selector: 'node:selected', style: { 'border-color': '#6366f1', 'border-width': 4, 'overlay-opacity': 0.1, 'overlay-color': '#6366f1' }},
      // Edges
      { selector: 'edge', style: { 'width': 1.5, 'line-color': '#cbd5e1', 'target-arrow-color': '#cbd5e1', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.8, 'opacity': 0.6 }},
      { selector: 'edge[edgeType="entity_ref"]', style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1' }},
      { selector: 'edge[edgeType="implements"]', style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b' }},
      { selector: 'edge[edgeType="api_ref"]', style: { 'line-color': '#64748b', 'target-arrow-color': '#64748b' }},
      { selector: 'edge[edgeType="mockup_ref"]', style: { 'line-color': '#10b981', 'target-arrow-color': '#10b981' }},
      { selector: 'edge[edgeType="depends_on"]', style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', 'line-style': 'dashed' }},
      { selector: 'edge[edgeType="contains"]', style: { 'line-color': '#d97706', 'target-arrow-color': '#d97706', 'line-style': 'dotted' }},
      { selector: 'edge[edgeType="url_match"], edge[edgeType="inferred_ref"]', style: { 'line-color': '#f43f5e', 'target-arrow-color': '#f43f5e', 'line-style': 'dashed', 'opacity': 0.4 }},
      // Highlight
      { selector: '.highlighted', style: { 'opacity': 1 }},
      { selector: '.faded', style: { 'opacity': 0.15 }},
      { selector: '.hidden-by-filter', style: { 'display': 'none' }}
    ];
  }

  _runLayout(direction) {
    const mode = direction || this.app.state.layoutDirection;
    if (mode === 'FISH') {
      this._runFishboneLayout();
      return;
    }
    this.cy.edges().style({ 'curve-style': 'bezier', 'taxi-direction': '', 'taxi-turn': '' });
    this.cy.layout({
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 90,
      rankSep: 140,
      edgeSep: 40,
      animate: false,
      fit: true,
      padding: 80
    }).run();
  }

  _runFishboneLayout() {
    // Swimlane (Fish) layout — 4 horizontal lanes (design/mockup/feature/qa).
    // Lane Y is computed dynamically from each lane's actual content height to
    // prevent groups with many children from overflowing into adjacent lanes.
    const sourceOrder = ['design', 'mockup', 'feature', 'qa'];
    const groupGap = 220;       // horizontal gap between groups
    const childXGap = 200;      // gap between child columns (label text-max-width=120 + buffer)
    const childYGap = 150;      // gap between child rows  (multi-line wrapped labels)
    const baseColumns = 6;      // min columns for small groups
    const laneVPadding = 220;   // vertical clear-space between lanes

    this.cy.startBatch();

    // Phase 1 — build per-source plans and measure each lane's height.
    const plans = {};
    for (const source of sourceOrder) {
      const sourceNodes = this.cy.nodes().filter(n => n.data('source') === source);
      const groupNodes = sourceNodes.filter(n => n.data('isParent'));
      const childNodes = sourceNodes.filter(n => !n.data('isParent'));
      const topLevel = childNodes.filter(n => !n.data('parent'));
      const groups = groupNodes.length ? groupNodes : topLevel;

      let cursorX = 0;
      let maxRows = 0;
      const groupPlans = [];

      groups.forEach((group) => {
        const children = group.data('isParent')
          ? childNodes.filter(n => n.data('parent') === group.id())
          : this.cy.collection([group]);
        const childCount = Math.max(children.length, 1);
        // Adaptive grid: keep big groups roughly square so they don't grow tall and
        // bleed into the next lane. sqrt(n*1.5) gives a slight bias toward wider grids.
        const cols = Math.max(baseColumns, Math.ceil(Math.sqrt(childCount * 1.5)));
        const rows = Math.ceil(childCount / cols);
        const usedCols = Math.min(cols, childCount);
        const groupWidth = Math.max(380, usedCols * childXGap + 120);
        const groupX = cursorX + groupWidth / 2;

        maxRows = Math.max(maxRows, rows);
        groupPlans.push({ group, children, groupX, cols, rows, childCount });
        cursorX += groupWidth + groupGap;
      });

      plans[source] = {
        groupPlans,
        laneHeight: Math.max(140, maxRows * childYGap)
      };
    }

    // Phase 2 — stack lanes vertically, then center the whole diagram around y=0.
    let cursorY = 0;
    const laneCenterY = {};
    for (const source of sourceOrder) {
      const half = plans[source].laneHeight / 2;
      laneCenterY[source] = cursorY + half;
      cursorY += plans[source].laneHeight + laneVPadding;
    }
    const totalH = cursorY - laneVPadding;
    for (const source of sourceOrder) {
      laneCenterY[source] -= totalH / 2;
    }

    // Phase 3 — place children. Compound parent positions auto-derive from children.
    for (const source of sourceOrder) {
      const groupY = laneCenterY[source];
      for (const plan of plans[source].groupPlans) {
        const { children, groupX, cols, rows, childCount } = plan;
        children.forEach((node, childIndex) => {
          const row = Math.floor(childIndex / cols);
          const col = childIndex % cols;
          const isLastRow = row === rows - 1;
          const lastRowCount = childCount % cols || cols;
          const rowCols = isLastRow ? lastRowCount : cols;
          const xOffset = (col - (rowCols - 1) / 2) * childXGap;
          const yOffset = (row - (rows - 1) / 2) * childYGap;
          node.position({ x: groupX + xOffset, y: groupY + yOffset });
        });
      }
    }

    this.cy.edges().style({ 'curve-style': 'taxi', 'taxi-direction': 'horizontal', 'taxi-turn': 30 });
    this.cy.endBatch();
    this.cy.fit(80);
  }

  _bindEvents() {
    this.cy.on('tap', 'node[!isParent]', (evt) => {
      const uid = evt.target.id();
      this.app.state.select(uid);
      this._highlightNeighbors(uid);
    });

    this.cy.on('dbltap', 'node[!isParent]', (evt) => {
      this.app.state.select(evt.target.id());
      this.app.bus.emit('edit-node', evt.target.id());
    });

    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) { this.app.state.select(null); this._clearHighlight(); }
    });

    this.cy.on('mouseover', 'edge', (evt) => {
      evt.target.style({ 'label': evt.target.data('label'), 'font-size': 9, 'text-background-color': '#fff', 'text-background-opacity': 0.9, 'text-background-padding': 3, 'color': '#475569' });
    });
    this.cy.on('mouseout', 'edge', (evt) => { evt.target.style('label', ''); });

    this.app.bus.on('filters-changed', () => this.applyFilters());
    this.app.bus.on('layout-changed', (dir) => this._runLayout(dir));
    this.app.bus.on('selection-changed', ({ selected }) => {
      if (selected) { this.cy.nodes().unselect(); const n = this.cy.getElementById(selected); if (n.length) n.select(); }
    });
  }

  _highlightNeighbors(uid) {
    this.cy.elements().removeClass('highlighted faded');
    const node = this.cy.getElementById(uid);
    if (!node.length) return;
    const neighborhood = node.neighborhood().add(node);
    this.cy.elements().addClass('faded');
    neighborhood.removeClass('faded').addClass('highlighted');
  }

  _clearHighlight() { this.cy.elements().removeClass('highlighted faded'); }

  applyFilters() {
    const filters = this.app.state.filters;
    this.cy.batch(() => {
      this.cy.nodes().forEach(node => {
        const d = node.data();
        if (d.isParent) return;
        let show = true;
        if (!filters.sources[d.source]) show = false;
        if (filters.status && d.status !== filters.status) show = false;
        node[show ? 'removeClass' : 'addClass']('hidden-by-filter');
      });
      if (filters.search) {
        const q = filters.search.toLowerCase();
        this.cy.nodes('[!isParent]').forEach(node => {
          if ((node.data('label') || '').toLowerCase().includes(q)) {
            node.removeClass('hidden-by-filter');
            node.style({ 'border-width': 4, 'border-color': '#6366f1' });
          } else { node.style({ 'border-width': '', 'border-color': '' }); }
        });
      } else { this.cy.nodes().style({ 'border-width': '', 'border-color': '' }); }
    });
  }

  fit() { if (this.cy) this.cy.fit(40); }
  destroy() {
    if (this.cy) {
      if (window.cy === this.cy) window.cy = null;
      this.cy.destroy();
      this.cy = null;
    }
  }
}

// ── Tree View ──
class TreeView {
  constructor(containerId, appInstance) {
    this.app = appInstance;
    this.containerId = containerId;
  }

  render(graphData) {
    const container = document.getElementById(this.containerId);
    container.textContent = '';

    const root = document.createElement('div');
    root.className = 'p-2';

    const sources = [
      { key: 'design', label: 'Design Doc' },
      { key: 'mockup', label: 'Mockup Pages' },
      { key: 'feature', label: 'Features' },
      { key: 'qa', label: 'QA Tests' }
    ];

    for (const src of sources) {
      const srcNodes = graphData.nodes.filter(n => n.source === src.key);
      if (srcNodes.length === 0) continue;

      const section = this._makeDetails(`${src.label} (${srcNodes.length})`, true);
      const topLevel = srcNodes.filter(n => !n.parentUid);
      const children = srcNodes.filter(n => n.parentUid);
      const childMap = new Map();
      for (const c of children) {
        if (!childMap.has(c.parentUid)) childMap.set(c.parentUid, []);
        childMap.get(c.parentUid).push(c);
      }

      for (const node of topLevel) section.appendChild(this._makeNodeItem(node, childMap, graphData));
      root.appendChild(section);
    }

    const orphans = this.app.graph.getOrphans();
    if (orphans.length > 0) {
      const orphanSection = this._makeDetails(`Orphans (${orphans.length})`, true);
      for (const node of orphans) orphanSection.appendChild(this._makeLeaf(node));
      root.appendChild(orphanSection);
    }

    container.appendChild(root);
  }

  _makeDetails(labelText, open) {
    const details = document.createElement('details');
    details.className = 'tree-node';
    if (open) details.open = true;
    const summary = document.createElement('summary');
    const strong = document.createElement('strong');
    strong.textContent = labelText;
    summary.appendChild(strong);
    details.appendChild(summary);
    return details;
  }

  _makeNodeItem(node, childMap, graphData) {
    const kids = childMap.get(node.uid) || [];
    const connected = this.app.graph.getConnected(node.uid);

    if (kids.length > 0 || connected.length > 0) {
      const details = document.createElement('details');
      details.className = 'tree-node';
      const summary = document.createElement('summary');
      summary.appendChild(createDot(NODE_COLORS[node.nodeType] || '#94a3b8'));
      summary.appendChild(document.createTextNode(' ' + node.label + ' '));
      summary.appendChild(createStatusBadge(node.status));
      summary.addEventListener('click', (e) => { if (!e.target.closest('details > details')) this.app.state.select(node.uid); });
      details.appendChild(summary);

      for (const kid of kids) {
        const subKids = childMap.get(kid.uid) || [];
        details.appendChild(subKids.length > 0 ? this._makeNodeItem(kid, childMap, graphData) : this._makeLeaf(kid));
      }

      const crossSource = connected.filter(c => c.node && c.node.source !== node.source);
      if (crossSource.length > 0) {
        const connDetails = this._makeDetails(`Connections (${crossSource.length})`, false);
        for (const c of crossSource) { if (c.node) connDetails.appendChild(this._makeLeaf(c.node, c.edge.label)); }
        details.appendChild(connDetails);
      }
      return details;
    }
    return this._makeLeaf(node);
  }

  _makeLeaf(node, edgeLabel) {
    const div = document.createElement('div');
    div.className = 'tree-leaf';
    div.appendChild(createDot(NODE_COLORS[node.nodeType] || '#94a3b8'));
    div.appendChild(document.createTextNode(' ' + node.label + ' '));
    div.appendChild(createStatusBadge(node.status));
    if (edgeLabel) {
      const hint = document.createElement('span');
      hint.className = 'text-xs text-gray-400';
      hint.textContent = ` (${edgeLabel})`;
      div.appendChild(hint);
    }
    div.addEventListener('click', () => this.app.state.select(node.uid));
    return div;
  }
}

// ── Board View ──
class BoardView {
  constructor(containerId, appInstance) {
    this.app = appInstance;
    this.containerId = containerId;
    this.groupBy = 'source';
  }

  render(graphData) {
    const container = document.getElementById(this.containerId);
    container.textContent = '';

    // Group selector
    const controls = document.createElement('div');
    controls.className = 'flex gap-2 mb-4 items-center';
    const lbl = document.createElement('label');
    lbl.className = 'text-sm font-medium text-gray-600';
    lbl.textContent = 'Group by:';
    const sel = document.createElement('select');
    sel.className = 'topbar-select text-sm';
    for (const opt of [['source','Source'],['status','Status'],['epic','Epic']]) {
      const o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      if (this.groupBy === opt[0]) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', (e) => { this.groupBy = e.target.value; this.render(graphData); });
    controls.appendChild(lbl);
    controls.appendChild(sel);
    container.appendChild(controls);

    const nodes = graphData.nodes.filter(n => !['epic', 'qa-module', 'mockup-entity', 'subtask'].includes(n.nodeType));
    const groups = this._groupNodes(nodes);

    const grid = document.createElement('div');
    grid.className = 'board-grid';
    grid.style.gridTemplateColumns = `repeat(${Object.keys(groups).length}, minmax(250px, 1fr))`;

    for (const [groupName, groupNodes] of Object.entries(groups)) {
      const col = document.createElement('div');
      col.className = 'board-column';
      const header = document.createElement('div');
      header.className = 'board-column-header';
      header.textContent = groupName + ' ';
      const cnt = document.createElement('span');
      cnt.className = 'board-column-count';
      cnt.textContent = groupNodes.length;
      header.appendChild(cnt);
      col.appendChild(header);

      for (const node of groupNodes) {
        const card = document.createElement('div');
        card.className = 'board-card';
        const title = document.createElement('div');
        title.className = 'board-card-title';
        title.textContent = node.label;
        const meta = document.createElement('div');
        meta.className = 'board-card-meta';
        meta.appendChild(createSourceBadge(node.source));
        meta.appendChild(document.createTextNode(' '));
        meta.appendChild(createStatusBadge(node.status));
        const links = document.createElement('span');
        links.textContent = `${this.app.graph.getConnected(node.uid).length} links`;
        meta.appendChild(links);
        card.appendChild(title);
        card.appendChild(meta);
        card.addEventListener('click', () => this.app.state.select(node.uid));
        col.appendChild(card);
      }
      grid.appendChild(col);
    }
    container.appendChild(grid);
  }

  _groupNodes(nodes) {
    const groups = {};
    for (const node of nodes) {
      let key;
      if (this.groupBy === 'source') key = SOURCE_COLORS[node.source]?.label || node.source;
      else if (this.groupBy === 'status') key = node.status || 'unknown';
      else if (this.groupBy === 'epic') key = node.metadata?.epic || node.source;
      if (!groups[key]) groups[key] = [];
      groups[key].push(node);
    }
    return groups;
  }
}

// ── Table View ──
class TableView {
  constructor(containerId, appInstance) {
    this.app = appInstance;
    this.containerId = containerId;
    this.sortColumn = 'source';
    this.sortDir = 'asc';
  }

  render(graphData) {
    const container = document.getElementById(this.containerId);
    container.textContent = '';

    const nodes = graphData.nodes.filter(n => !['epic', 'qa-module', 'mockup-entity'].includes(n.nodeType));
    const sorted = this._sort(nodes);

    const wrapper = document.createElement('div');
    wrapper.className = 'overflow-x-auto';
    const table = document.createElement('table');
    table.className = 'tracker-table';

    const columns = [
      { key: 'source', label: 'Source' }, { key: 'nodeType', label: 'Type' },
      { key: 'id', label: 'ID' }, { key: 'label', label: 'Name' },
      { key: 'status', label: 'Status' }, { key: 'layer', label: 'Layer' },
      { key: 'complexity', label: 'Complexity' }, { key: 'connections', label: 'Links' }
    ];

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const col of columns) {
      const th = document.createElement('th');
      if (this.sortColumn === col.key) th.classList.add('sorted');
      th.textContent = col.label;
      const arrow = document.createElement('span');
      arrow.className = 'sort-indicator';
      arrow.textContent = this.sortColumn === col.key ? (this.sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';
      th.appendChild(arrow);
      th.addEventListener('click', () => {
        if (this.sortColumn === col.key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        else { this.sortColumn = col.key; this.sortDir = 'asc'; }
        this.render(graphData);
      });
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const node of sorted) {
      const tr = document.createElement('tr');
      const connCount = this.app.graph.getConnected(node.uid).length;

      const tdSource = document.createElement('td'); tdSource.appendChild(createSourceBadge(node.source));
      const tdType = document.createElement('td'); const tSpan = document.createElement('span'); tSpan.className = 'text-xs font-medium'; tSpan.textContent = node.nodeType; tdType.appendChild(tSpan);
      const tdId = document.createElement('td'); const code = document.createElement('code'); code.className = 'text-xs'; code.textContent = node.id; tdId.appendChild(code);
      const tdName = document.createElement('td'); tdName.textContent = node.name || node.label;
      const tdStatus = document.createElement('td'); tdStatus.appendChild(createStatusBadge(node.status));
      const tdLayer = document.createElement('td'); const layerSpan = document.createElement('span'); layerSpan.className = 'text-xs text-gray-500'; layerSpan.textContent = node.layer || '\u2014'; tdLayer.appendChild(layerSpan);
      const tdComplexity = document.createElement('td'); const cSpan = document.createElement('span'); cSpan.className = 'text-xs text-gray-500'; cSpan.textContent = node.complexity || '\u2014'; tdComplexity.appendChild(cSpan);
      const tdLinks = document.createElement('td'); const lSpan = document.createElement('span'); lSpan.className = 'text-xs'; lSpan.textContent = connCount; tdLinks.appendChild(lSpan);

      tr.append(tdSource, tdType, tdId, tdName, tdStatus, tdLayer, tdComplexity, tdLinks);
      tr.addEventListener('click', () => this.app.state.select(node.uid));
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.appendChild(wrapper);
  }

  _sort(nodes) {
    const col = this.sortColumn;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...nodes].sort((a, b) => {
      let va, vb;
      if (col === 'connections') { va = this.app.graph.getConnected(a.uid).length; vb = this.app.graph.getConnected(b.uid).length; }
      else { va = a[col] || ''; vb = b[col] || ''; }
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }
}

// ── View Manager ──
class ViewManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.graphView = new GraphView('cy', appInstance);
    this.treeView = new TreeView('tree-root', appInstance);
    this.boardView = new BoardView('board-root', appInstance);
    this.tableView = new TableView('table-root', appInstance);
    this._graphData = null;
  }

  init(graphData) {
    this._graphData = graphData;
    this.graphView.init(graphData);
    this.treeView.render(graphData);
    this.boardView.render(graphData);
    this.tableView.render(graphData);
    this._bindViewSwitcher();
  }

  refresh(graphData) {
    this._graphData = graphData;
    this.graphView.destroy();
    this.graphView.init(graphData);
    this.treeView.render(graphData);
    this.boardView.render(graphData);
    this.tableView.render(graphData);
  }

  _bindViewSwitcher() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.app.state.setView(view);
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.view-container').forEach(c => c.classList.remove('active'));
        const container = document.getElementById(`view-${view}`);
        if (container) container.classList.add('active');
        if (view === 'graph') setTimeout(() => this.graphView.fit(), 100);
      });
    });
  }
}
