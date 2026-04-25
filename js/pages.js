// ===== PAGE MODULES =====

// ---- DEPARTMENTS ----
const DeptPage = {
  render() {
    const depts = Store.get('departments');
    const machines = Store.get('machines');
    const tbody = document.getElementById('dept-tbody');
    if(!tbody) return;
    tbody.innerHTML = depts.map((d,i) => {
      const mc = machines.filter(m => m.dept === d).length;
      return `<tr>
        <td>${i+1}</td>
        <td><strong>${Utils.esc(d)}</strong></td>
        <td>${Utils.dateStr()}</td>
        <td>${Utils.badge(mc+' machines','info')}</td>
        <td><button class="btn btn-danger btn-xs" onclick="DeptPage.delete('${Utils.esc(d)}')">🗑 Delete</button></td>
      </tr>`;
    }).join('') || `<tr><td colspan="5" class="table-empty"><div class="ico">🏭</div>No departments yet</td></tr>`;
  },
  add() {
    const inp = document.getElementById('new-dept-input');
    const n = inp.value.trim();
    if(!n) { Utils.toast('Enter department name','error'); return; }
    const depts = Store.get('departments');
    if(depts.includes(n)) { Utils.toast('Department already exists','warning'); return; }
    depts.push(n);
    Store.set('departments', depts);
    inp.value = '';
    this.render();
    Nav.populateAllSelects();
    Utils.toast(`Department "${n}" added!`);
  },
  delete(name) {
    if(!Utils.confirm(`Delete "${name}" and all its machines?`)) return;
    const depts = Store.get('departments').filter(d => d !== name);
    Store.set('departments', depts);
    const machines = Store.get('machines').filter(m => m.dept !== name);
    Store.set('machines', machines);
    this.render();
    Nav.populateAllSelects();
    Utils.toast(`Department "${name}" deleted`,'warning');
  }
};

// ---- MACHINES ----
const MachinePage = {
  render() {
    const filter = document.getElementById('machine-filter-dept')?.value || '';
    const all = Store.get('machines');
    const list = filter ? all.filter(m => m.dept === filter) : all;
    const tbody = document.getElementById('machine-tbody');
    if(!tbody) return;
    tbody.innerHTML = list.map((m,i) => `
      <tr id="mrow-${m.id}">
        <td>${i+1}</td>
        <td>${Utils.badge(m.dept,'info')}</td>
        <td><strong id="mname-disp-${m.id}">${Utils.esc(m.name)}</strong></td>
        <td><code id="mcode-disp-${m.id}">${Utils.esc(m.code)}</code></td>
        <td id="mcap-disp-${m.id}">${Utils.fmtNum(m.cap)}/hr</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-xs" onclick="MachinePage.edit(${m.id})">✏ Edit</button>
            <button class="btn btn-danger btn-xs" onclick="MachinePage.delete(${m.id})">🗑</button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" class="table-empty"><div class="ico">⚙️</div>No machines</td></tr>`;
  },
  add() {
    const dept = document.getElementById('add-machine-dept').value;
    const name = document.getElementById('add-machine-name').value.trim();
    const code = document.getElementById('add-machine-code').value.trim();
    const cap = parseInt(document.getElementById('add-machine-cap').value) || 0;
    if(!dept || !name || !code) { Utils.toast('Fill all required fields','error'); return; }
    const machines = Store.get('machines');
    machines.push({ id: Store.getNextId('machines'), dept, name, code, cap });
    Store.set('machines', machines);
    ['add-machine-name','add-machine-code','add-machine-cap'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    this.render();
    Nav.populateAllSelects();
    Utils.toast('Machine added!');
  },
  edit(id) {
    const machines = Store.get('machines');
    const m = machines.find(x => x.id === id);
    if(!m) return;
    Utils.showModal(`
      <h3>Edit Machine</h3>
      <div class="sub">Update machine details</div>
      <div class="form-grid" style="gap:14px;">
        <div class="field"><label>Machine Name</label><input id="em-name" value="${Utils.esc(m.name)}"></div>
        <div class="field"><label>Machine Code</label><input id="em-code" value="${Utils.esc(m.code)}"></div>
        <div class="field"><label>Capacity / Hour</label><input id="em-cap" type="number" value="${m.cap}"></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-success" onclick="MachinePage.saveEdit(${id})">Save Changes</button>
      </div>`);
  },
  saveEdit(id) {
    const machines = Store.get('machines');
    const m = machines.find(x => x.id === id);
    if(!m) return;
    m.name = document.getElementById('em-name').value.trim() || m.name;
    m.code = document.getElementById('em-code').value.trim() || m.code;
    m.cap = parseInt(document.getElementById('em-cap').value) || m.cap;
    Store.set('machines', machines);
    Utils.closeModal();
    this.render();
    Nav.populateAllSelects();
    Utils.toast('Machine updated!');
  },
  delete(id) {
    if(!Utils.confirm('Delete this machine?')) return;
    Store.set('machines', Store.get('machines').filter(m => m.id !== id));
    this.render();
    Nav.populateAllSelects();
    Utils.toast('Machine deleted','warning');
  }
};

// ---- USERS ----
const UserPage = {
  render() {
    const users = Store.get('users');
    const tbody = document.getElementById('user-tbody');
    if(!tbody) return;
    tbody.innerHTML = users.map((u,i) => {
      const roleColors = { Admin:'danger', 'QC Supervisor':'warning', 'QC Inspector':'info', 'Production Manager':'purple' };
      const roleColor = roleColors[u.role] || 'info';
      return `<tr>
        <td>${i+1}</td>
        <td><strong>${Utils.esc(u.name)}</strong></td>
        <td><code>${Utils.esc(u.id)}</code></td>
        <td>${Utils.badge(u.role, roleColor)}</td>
        <td style="font-size:12px;">${u.depts && u.depts.length ? u.depts.join(', ') : '<span style="color:var(--text3)">All Departments</span>'}</td>
        <td>${u.id === 'admin' ? Utils.badge('System','dark') : `<button class="btn btn-danger btn-xs" onclick="UserPage.delete('${u.id}')">🗑 Delete</button>`}</td>
      </tr>`;
    }).join('');
  },
  add() {
    const name = document.getElementById('u-name').value.trim();
    const id = document.getElementById('u-id').value.trim();
    const pass = document.getElementById('u-pass').value.trim();
    const role = document.getElementById('u-role').value;
    const deptSel = document.getElementById('u-depts');
    const depts = deptSel ? Array.from(deptSel.selectedOptions).map(o => o.value) : [];
    if(!name || !id || !pass) { Utils.toast('Name, Login ID and Password are required','error'); return; }
    const users = Store.get('users');
    if(users.find(u => u.id === id)) { Utils.toast('Login ID already taken','error'); return; }
    users.push({ name, id, pass, role, depts });
    Store.set('users', users);
    ['u-name','u-id','u-pass'].forEach(x => { const el = document.getElementById(x); if(el) el.value=''; });
    this.render();
    Utils.toast(`User "${name}" added!`);
  },
  delete(id) {
    if(!Utils.confirm('Delete this user?')) return;
    Store.set('users', Store.get('users').filter(u => u.id !== id));
    this.render();
    Utils.toast('User deleted','warning');
  },
  populateDepts() {
    const sel = document.getElementById('u-depts');
    if(!sel) return;
    const depts = Store.get('departments');
    sel.innerHTML = depts.map(d => `<option value="${Utils.esc(d)}">${Utils.esc(d)}</option>`).join('');
  }
};

// ---- DEFECTS ----
const DefectPage = {
  render() {
    const defects = Store.get('defects');
    const c = document.getElementById('defect-tags');
    if(!c) return;
    c.innerHTML = defects.map(d => `
      <span class="tag">${Utils.esc(d)}
        <span class="tag-remove" onclick="DefectPage.delete('${Utils.esc(d)}')">×</span>
      </span>`).join('');
  },
  add() {
    const inp = document.getElementById('new-defect-input');
    const n = inp.value.trim();
    if(!n) { Utils.toast('Enter defect name','error'); return; }
    const defects = Store.get('defects');
    if(defects.includes(n)) { Utils.toast('Defect already exists','warning'); return; }
    defects.push(n);
    Store.set('defects', defects);
    inp.value = '';
    this.render();
    Utils.toast(`Defect "${n}" added!`);
  },
  delete(name) {
    const defects = Store.get('defects').filter(d => d !== name);
    Store.set('defects', defects);
    this.render();
    Utils.toast('Defect removed','warning');
  }
};

// ---- SALES ORDERS ----
const SOPage = {
  render() {
    const sos = Store.get('salesOrders');
    const tbody = document.getElementById('so-tbody');
    if(!tbody) return;
    tbody.innerHTML = sos.map((s,i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${Utils.esc(s.num)}</strong></td>
        <td>${Utils.esc(s.customer)}</td>
        <td>${Utils.esc(s.style||'-')}</td>
        <td><code style="font-size:11px;">${Utils.esc(s.article||'-')}</code></td>
        <td>${Utils.badge(s.prodcat||'-','info')}</td>
        <td style="font-weight:600;">${Utils.fmtNum(s.qty)}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-xs" onclick="SOPage.edit(${s.id})">✏</button>
            <button class="btn btn-danger btn-xs" onclick="SOPage.delete(${s.id})">🗑</button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="8" class="table-empty"><div class="ico">📦</div>No sales orders. Add one above or import Excel.</td></tr>`;
  },
  add() {
    const num = document.getElementById('so-num').value.trim();
    const customer = document.getElementById('so-customer').value.trim();
    const style = document.getElementById('so-style').value.trim();
    const article = document.getElementById('so-article').value.trim();
    const prodcat = document.getElementById('so-prodcat').value;
    const qty = parseInt(document.getElementById('so-qty').value) || 0;
    if(!num || !customer) { Utils.toast('SO Number and Customer are required','error'); return; }
    const sos = Store.get('salesOrders');
    if(sos.find(s => s.num === num)) { Utils.toast('SO number already exists','error'); return; }
    sos.push({ id: Store.getNextId('salesOrders'), num, customer, style, article, prodcat, qty });
    Store.set('salesOrders', sos);
    ['so-num','so-customer','so-style','so-article','so-qty'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    this.render();
    Utils.toast(`SO "${num}" added!`);
  },
  edit(id) {
    const sos = Store.get('salesOrders');
    const s = sos.find(x => x.id === id);
    if(!s) return;
    Utils.showModal(`
      <h3>Edit Sales Order</h3>
      <div class="sub">Update SO details</div>
      <div class="form-grid cols-2" style="gap:14px;">
        <div class="field"><label>SO Number</label><input id="es-num" value="${Utils.esc(s.num)}" readonly></div>
        <div class="field"><label>Customer</label><input id="es-customer" value="${Utils.esc(s.customer)}"></div>
        <div class="field"><label>Style Name</label><input id="es-style" value="${Utils.esc(s.style||'')}"></div>
        <div class="field"><label>Article</label><input id="es-article" value="${Utils.esc(s.article||'')}"></div>
        <div class="field">
          <label>Product Category</label>
          <select id="es-prodcat">
            ${['Diecut Insoles','Molded Insoles','Uncovered Sheets','Covered Sheets'].map(c => `<option ${s.prodcat===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Order Qty</label><input id="es-qty" type="number" value="${s.qty}"></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-success" onclick="SOPage.saveEdit(${id})">Save</button>
      </div>`);
  },
  saveEdit(id) {
    const sos = Store.get('salesOrders');
    const s = sos.find(x => x.id === id);
    if(!s) return;
    s.customer = document.getElementById('es-customer').value.trim() || s.customer;
    s.style = document.getElementById('es-style').value.trim();
    s.article = document.getElementById('es-article').value.trim();
    s.prodcat = document.getElementById('es-prodcat').value;
    s.qty = parseInt(document.getElementById('es-qty').value) || s.qty;
    Store.set('salesOrders', sos);
    Utils.closeModal();
    this.render();
    Utils.toast('Sales order updated!');
  },
  delete(id) {
    if(!Utils.confirm('Delete this sales order?')) return;
    Store.set('salesOrders', Store.get('salesOrders').filter(s => s.id !== id));
    this.render();
    Utils.toast('Sales order deleted','warning');
  },
  importExcel(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, {type:'binary'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const sos = Store.get('salesOrders');
        let added = 0;
        data.forEach(row => {
          const num = String(row['SO Number']||row['so_number']||row['SONumber']||'').trim();
          const customer = String(row['Customer']||row['customer']||'').trim();
          if(num && customer && !sos.find(s => s.num === num)) {
            sos.push({ id: Store.getNextId('salesOrders'), num, customer, style:String(row['Style Name']||row['Style']||''), article:String(row['Article']||''), prodcat:String(row['Product Category']||''), qty:parseInt(row['Order Qty']||row['Qty']||0) });
            added++;
          }
        });
        Store.set('salesOrders', sos);
        this.render();
        Utils.toast(`Imported ${added} records successfully!`);
      } catch(err) { Utils.toast('Excel import failed — check file format','error'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  },
  exportExcel() {
    const sos = Store.get('salesOrders');
    const data = sos.map(s => ({ 'SO Number':s.num, Customer:s.customer, 'Style Name':s.style, Article:s.article, 'Product Category':s.prodcat, 'Order Qty':s.qty }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesOrders');
    XLSX.writeFile(wb, `Ortholite_SO_${new Date().toISOString().slice(0,10)}.xlsx`);
    Utils.toast('Excel exported!');
  },
  showOdooModal() {
    const cfg = Store.get('odoo');
    Utils.showModal(`
      <h3>🔗 Odoo ERP Integration</h3>
      <div class="sub">Connect QMS to your Odoo instance via REST/XML-RPC API</div>
      <div class="odoo-info">
        <strong>Endpoints used:</strong><br>
        • Auth: <code>/web/session/authenticate</code><br>
        • Sales Orders: <code>/api/sale.order</code> — GET/POST<br>
        • Quality Checks: <code>/api/quality.check</code> — POST<br>
        • Model call: <code>/web/dataset/call_kw</code> — POST JSON-RPC
      </div>
      <div class="form-grid" style="gap:12px;">
        <div class="field"><label>Odoo Server URL</label><input id="od-url" value="${Utils.esc(cfg.url)}" placeholder="https://your-odoo.com"></div>
        <div class="field"><label>Database Name</label><input id="od-db" value="${Utils.esc(cfg.db)}" placeholder="odoo_production"></div>
        <div class="field"><label>API Key</label><input type="password" id="od-key" value="${Utils.esc(cfg.apiKey)}" placeholder="Your API key"></div>
        <div class="field"><label>User ID (UID)</label><input id="od-uid" value="${Utils.esc(cfg.uid)}" placeholder="1"></div>
      </div>
      ${cfg.lastSync ? `<div style="margin-top:10px;font-size:12px;color:var(--text3);">Last sync: ${cfg.lastSync}</div>` : ''}
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-ghost" onclick="SOPage.testOdoo()">Test Connection</button>
        <button class="btn btn-success" onclick="SOPage.saveOdoo()">Save & Sync</button>
      </div>`);
  },
  testOdoo() {
    Utils.toast('Testing Odoo connection…');
    setTimeout(() => Utils.toast('Odoo connection simulated ✓ (demo mode)'), 1200);
  },
  saveOdoo() {
    const cfg = { url: document.getElementById('od-url').value, db: document.getElementById('od-db').value, apiKey: document.getElementById('od-key').value, uid: document.getElementById('od-uid').value, lastSync: Utils.nowStr() };
    Store.set('odoo', cfg);
    Utils.closeModal();
    Utils.toast('Odoo config saved & sync initiated!');
  }
};

// ---- PROCESS MAPPING ----
const ProcPage = {
  render() {
    this.renderProcessTags();
    this.renderMapping();
  },
  renderProcessTags() {
    const c = document.getElementById('process-tags');
    if(!c) return;
    const procs = Store.get('processes');
    c.innerHTML = procs.map(p => `
      <span class="tag" style="background:var(--info-bg);">${Utils.esc(p)}
        <span class="tag-remove" onclick="ProcPage.deleteProc('${Utils.esc(p)}')">×</span>
      </span>`).join('');
  },
  renderMapping() {
    const grid = document.getElementById('proc-mapping-grid');
    if(!grid) return;
    const procs = Store.get('processes');
    const map = Store.get('processMapping');
    const cats = ['Diecut Insoles','Molded Insoles','Uncovered Sheets','Covered Sheets'];
    grid.innerHTML = cats.map(cat => `
      <div class="mb16">
        <div style="font-size:13px;font-weight:700;color:var(--primary);padding:10px 0 10px;border-bottom:1px solid var(--border);margin-bottom:10px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">📦</span>${Utils.esc(cat)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${procs.map(p => {
            const active = (map[cat]||[]).includes(p);
            return `<span class="process-pill ${active?'active':''}" onclick="ProcPage.toggle('${Utils.esc(cat)}','${Utils.esc(p)}')">${active?'✓ ':''}${Utils.esc(p)}</span>`;
          }).join('')}
        </div>
      </div>`).join('');
  },
  addProc() {
    const inp = document.getElementById('new-proc-input');
    const n = inp.value.trim();
    if(!n) { Utils.toast('Enter process name','error'); return; }
    const procs = Store.get('processes');
    if(procs.includes(n)) { Utils.toast('Process exists','warning'); return; }
    procs.push(n);
    Store.set('processes', procs);
    inp.value = '';
    this.render();
    Utils.toast(`Process "${n}" added!`);
  },
  deleteProc(name) {
    Store.set('processes', Store.get('processes').filter(p => p !== name));
    const map = Store.get('processMapping');
    Object.keys(map).forEach(cat => { map[cat] = (map[cat]||[]).filter(p => p !== name); });
    Store.set('processMapping', map);
    this.render();
    Utils.toast('Process removed','warning');
  },
  toggle(cat, proc) {
    const map = Store.get('processMapping');
    if(!map[cat]) map[cat] = [];
    const idx = map[cat].indexOf(proc);
    if(idx >= 0) map[cat].splice(idx,1);
    else map[cat].push(proc);
    Store.set('processMapping', map);
    this.renderMapping();
  }
};

// ---- QMS ENTRY ----
const EntryPage = {
  init() {
    this.populateSelects();
    this.updateAutoFields();
    this.initDefectRows();
    this.updateClock();
    if(!this._clockInt) this._clockInt = setInterval(() => this.updateClock(), 1000);
  },
  updateClock() {
    const el = document.getElementById('entry-clock');
    if(!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN') + ' · ' + now.toLocaleDateString('en-IN');
    this.updateAutoFields();
  },
  updateAutoFields() {
    const sh = Utils.getShiftHour();
    const sf = document.getElementById('entry-shift');
    const hf = document.getElementById('entry-hour');
    if(sf && sf.value !== sh.shiftName) sf.value = sh.shiftName;
    if(hf && hf.value !== `Hour ${sh.hourNum}`) hf.value = `Hour ${sh.hourNum}`;
    const headerBadge = document.getElementById('header-shift-badge');
    if(headerBadge) headerBadge.textContent = sh.shiftName + ' · Hour ' + sh.hourNum;
  },
  populateSelects() {
    const depts = Store.get('departments');
    const sos = Store.get('salesOrders');

    const deptSel = document.getElementById('entry-dept');
    if(deptSel) deptSel.innerHTML = '<option value="">-- Select Department --</option>' + depts.map(d => `<option>${Utils.esc(d)}</option>`).join('');

    const soSel = document.getElementById('entry-so');
    if(soSel) soSel.innerHTML = '<option value="">-- Select Sales Order --</option>' + sos.map(s => `<option value="${s.id}">${Utils.esc(s.num)} — ${Utils.esc(s.customer)}</option>`).join('');
  },
  onDeptChange() {
    const dept = document.getElementById('entry-dept').value;
    const machines = Store.get('machines').filter(m => m.dept === dept);
    const mSel = document.getElementById('entry-machine');
    if(mSel) mSel.innerHTML = machines.length
      ? machines.map(m => `<option value="${m.id}">${Utils.esc(m.name)} (${Utils.esc(m.code)})</option>`).join('')
      : '<option value="">No machines in this department</option>';
  },
  onSOChange() {
    const soId = parseInt(document.getElementById('entry-so').value);
    const so = Store.get('salesOrders').find(s => s.id === soId);
    const set = (id,v) => { const el = document.getElementById(id); if(el) el.value = v||''; };
    if(so) {
      set('entry-customer', so.customer);
      set('entry-style', so.style);
      set('entry-article', so.article);
      set('entry-prodcat', so.prodcat);
      set('entry-orderqty', so.qty);
    } else {
      ['entry-customer','entry-style','entry-article','entry-prodcat','entry-orderqty'].forEach(id => set(id,''));
    }
  },
  calcPass() {
    const checked = parseInt(document.getElementById('entry-checked').value)||0;
    const reject = parseInt(document.getElementById('entry-reject').value)||0;
    const repair = parseInt(document.getElementById('entry-repair').value)||0;
    const pass = Math.max(0, checked - reject - repair);
    const el = document.getElementById('entry-pass');
    if(el) el.value = pass;
    // Show live metrics
    const ftpr = checked > 0 ? ((pass/checked)*100).toFixed(1) : 0;
    const rejPct = checked > 0 ? ((reject/checked)*100).toFixed(1) : 0;
    const el2 = document.getElementById('entry-live-ftpr');
    if(el2) {
      el2.innerHTML = checked > 0 ? `<span style="color:#10b981;font-weight:700;">FTPR: ${ftpr}%</span> &nbsp; <span style="color:#ef4444;">Rej: ${rejPct}%</span>` : '';
    }
  },
  initDefectRows() {
    const c = document.getElementById('defect-rows');
    if(c && c.children.length === 0) this.addDefectRow();
  },
  addDefectRow() {
    const defects = Store.get('defects');
    const row = document.createElement('div');
    row.className = 'defect-entry-row';
    row.innerHTML = `
      <select>
        <option value="">-- Select Defect --</option>
        ${defects.map(d => `<option>${Utils.esc(d)}</option>`).join('')}
      </select>
      <input type="number" placeholder="Qty" min="0">
      <button class="btn btn-danger btn-xs btn-icon" onclick="this.parentElement.remove()" title="Remove">×</button>`;
    document.getElementById('defect-rows').appendChild(row);
  },
  save() {
    const dept = document.getElementById('entry-dept').value;
    const qcname = document.getElementById('entry-qcname').value.trim();
    const checked = parseInt(document.getElementById('entry-checked').value)||0;
    if(!dept) { Utils.toast('Select a department','error'); return; }
    if(!qcname) { Utils.toast('Enter QC Name','error'); return; }
    if(!checked) { Utils.toast('Enter Checked Quantity','error'); return; }
    const reject = parseInt(document.getElementById('entry-reject').value)||0;
    const repair = parseInt(document.getElementById('entry-repair').value)||0;
    const pass = Math.max(0, checked - reject - repair);
    const defects = [];
    document.querySelectorAll('#defect-rows .defect-entry-row').forEach(row => {
      const sel = row.querySelector('select').value;
      const qty = parseInt(row.querySelector('input').value)||0;
      if(sel && qty > 0) defects.push({ name:sel, qty });
    });
    const soSel = document.getElementById('entry-so');
    const soText = soSel.options[soSel.selectedIndex]?.text || '';
    const sh = Utils.getShiftHour();
    const entry = {
      id: Store.getNextId('entries'),
      ts: new Date().toISOString(),
      time: Utils.timeStr(),
      dept, machine: document.getElementById('entry-machine').options[document.getElementById('entry-machine').selectedIndex]?.text || '',
      shift: sh.shiftName, hour: `Hour ${sh.hourNum}`,
      qcname, jobcard: document.getElementById('entry-jobcard').value.trim(),
      soText, customer: document.getElementById('entry-customer').value,
      style: document.getElementById('entry-style').value, article: document.getElementById('entry-article').value,
      prodcat: document.getElementById('entry-prodcat').value,
      orderqty: parseInt(document.getElementById('entry-orderqty').value)||0,
      checked, pass, reject, repair,
      ftpr: checked > 0 ? +((pass/checked)*100).toFixed(1) : 0,
      defects
    };
    const entries = Store.get('entries');
    entries.unshift(entry);
    Store.set('entries', entries);
    this.renderRecentEntries();
    this.clear();
    Utils.toast('Entry saved successfully! ✓');
  },
  clear() {
    ['entry-qcname','entry-jobcard','entry-checked','entry-reject','entry-repair'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    document.getElementById('entry-so').value = '';
    ['entry-customer','entry-style','entry-article','entry-prodcat','entry-orderqty','entry-pass'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    const el2 = document.getElementById('entry-live-ftpr');
    if(el2) el2.innerHTML = '';
    document.getElementById('defect-rows').innerHTML = '';
    this.addDefectRow();
  },
  renderRecentEntries() {
    const entries = Store.get('entries').slice(0, 30);
    const tbody = document.getElementById('entry-history-tbody');
    if(!tbody) return;
    tbody.innerHTML = entries.map(e => {
      const ft = parseFloat(e.ftpr);
      const badge = ft >= 95 ? 'success' : ft >= 90 ? 'warning' : 'danger';
      return `<tr>
        <td style="font-size:11px;">${e.time}</td>
        <td>${Utils.badge(e.dept,'info')}</td>
        <td style="font-size:11px;">${Utils.esc(e.shift)} / ${Utils.esc(e.hour)}</td>
        <td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${Utils.esc(e.soText||'-')}</td>
        <td>${Utils.esc(e.qcname)}</td>
        <td style="font-weight:600;">${e.checked}</td>
        <td style="color:#10b981;font-weight:600;">${e.pass}</td>
        <td style="color:#ef4444;">${e.reject}</td>
        <td style="color:#f59e0b;">${e.repair}</td>
        <td>${Utils.badge(e.ftpr+'%', badge)}</td>
      </tr>`;
    }).join('') || `<tr><td colspan="10" class="table-empty">No entries recorded today</td></tr>`;
  }
};

// ---- REPORTS PAGE ----
const ReportPage = {
  _filtered: [],
  render() {
    const today = new Date().toISOString().slice(0, 10);
    const fromEl = document.getElementById('rpt-from');
    const toEl = document.getElementById('rpt-to');
    if (fromEl && !fromEl.value) fromEl.value = today;
    if (toEl && !toEl.value) toEl.value = today;
    const depts = Store.get('departments');
    const sel = document.getElementById('rpt-dept');
    if (sel) {
      sel.innerHTML = '<option value="">All Departments</option>';
      depts.forEach(d => { sel.innerHTML += `<option value="${d.name}">${d.name}</option>`; });
    }
    this.filter();
  },
  filter() {
    const from = document.getElementById('rpt-from').value;
    const to = document.getElementById('rpt-to').value;
    const dept = document.getElementById('rpt-dept').value;
    if (!from || !to) { Utils.toast('Select both From and To dates', 'error'); return; }
    if (from > to) { Utils.toast('From date must be before To date', 'error'); return; }
    const entries = Store.get('entries');
    this._filtered = entries.filter(e => {
      const d = e.ts ? e.ts.slice(0, 10) : '';
      if (d < from || d > to) return false;
      if (dept && e.dept !== dept) return false;
      return true;
    });
    this.renderTable(this._filtered);
  },
  renderTable(entries) {
    const tbody = document.getElementById('rpt-tbody');
    const count = document.getElementById('rpt-count');
    if (!tbody) return;
    if (count) count.textContent = entries.length ? `${entries.length} record${entries.length !== 1 ? 's' : ''} found` : 'No records found';
    if (!entries.length) {
      tbody.innerHTML = '<tr><td colspan="21" class="table-empty">No entries found for selected range</td></tr>';
      return;
    }
    tbody.innerHTML = entries.map((e, i) => {
      const date = e.ts ? e.ts.slice(0, 10) : '—';
      const defectStr = e.defects && e.defects.length ? e.defects.map(d => `${d.name} (${d.qty})`).join(', ') : '—';
      const ftpr = parseFloat(e.ftpr) || 0;
      const ftprColor = ftpr >= 95 ? '#10b981' : ftpr >= 80 ? '#f59e0b' : '#ef4444';
      return `<tr>
        <td>${i + 1}</td>
        <td>${date}</td>
        <td>${e.time || '—'}</td>
        <td>${Utils.esc(e.shift || '—')}</td>
        <td>${Utils.esc(e.hour || '—')}</td>
        <td>${Utils.badge(e.dept || '—', 'info')}</td>
        <td>${Utils.esc(e.machine || '—')}</td>
        <td>${Utils.esc(e.qcname || '—')}</td>
        <td>${Utils.esc(e.jobcard || '—')}</td>
        <td style="font-size:12px;">${Utils.esc(e.soText || '—')}</td>
        <td>${Utils.esc(e.customer || '—')}</td>
        <td>${Utils.esc(e.style || '—')}</td>
        <td>${Utils.esc(e.article || '—')}</td>
        <td>${Utils.esc(e.prodcat || '—')}</td>
        <td>${e.orderqty || 0}</td>
        <td><strong>${e.checked || 0}</strong></td>
        <td style="color:#10b981;font-weight:600;">${e.pass || 0}</td>
        <td style="color:#ef4444;font-weight:600;">${e.reject || 0}</td>
        <td style="color:#f59e0b;font-weight:600;">${e.repair || 0}</td>
        <td style="color:${ftprColor};font-weight:700;">${ftpr}%</td>
        <td style="font-size:11px;max-width:180px;">${defectStr}</td>
      </tr>`;
    }).join('');
  },
  exportExcel() {
    if (!this._filtered.length) { Utils.toast('No data to export — apply a filter first', 'error'); return; }
    const rows = this._filtered.map((e, i) => ({
      '#': i + 1,
      'Date': e.ts ? e.ts.slice(0, 10) : '',
      'Time': e.time || '',
      'Shift': e.shift || '',
      'Hour': e.hour || '',
      'Department': e.dept || '',
      'Machine': e.machine || '',
      'QC Name': e.qcname || '',
      'Jobcard No.': e.jobcard || '',
      'Sales Order': e.soText || '',
      'Customer': e.customer || '',
      'Style': e.style || '',
      'Article': e.article || '',
      'Product Category': e.prodcat || '',
      'Order Qty': e.orderqty || 0,
      'Checked Qty': e.checked || 0,
      'Pass Qty': e.pass || 0,
      'Reject Qty': e.reject || 0,
      'Repair Qty': e.repair || 0,
      'FTPR %': e.ftpr || 0,
      'Defects': e.defects && e.defects.length ? e.defects.map(d => `${d.name}(${d.qty})`).join(', ') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QMS Report');
    const from = document.getElementById('rpt-from').value;
    const to = document.getElementById('rpt-to').value;
    XLSX.writeFile(wb, `QMS_Report_${from}_to_${to}.xlsx`);
    Utils.toast('Report downloaded successfully!');
  }
};

// ---- SHIFTS PAGE ----
const ShiftPage = {
  render() {
    const g = document.getElementById('shift-grid');
    if(!g) return;
    const shifts = [
      { name:'Shift A', letter:'A', cls:'a', start:6, end:14, color:'#059669' },
      { name:'Shift B', letter:'B', cls:'b', start:14, end:22, color:'#1d4ed8' },
      { name:'Shift C', letter:'C', cls:'c', start:22, end:6, color:'#c2410c' }
    ];
    g.innerHTML = shifts.map(s => `
      <div class="shift-card">
        <div class="shift-card-hdr ${s.cls}">
          <div>
            <div style="font-size:17px;font-weight:700;">${s.name}</div>
            <div style="font-size:12px;opacity:0.8;">${Utils.fmtH12(s.start)} – ${Utils.fmtH12(s.end)}</div>
          </div>
          <div style="font-size:28px;font-weight:800;opacity:0.3;">${s.letter}</div>
        </div>
        ${Array.from({length:8},(_,i) => {
          const h = (s.start + i) % 24;
          const h2 = (s.start + i + 1) % 24;
          return `<div class="shift-hour-row">
            <span class="hr-num">Hour ${i+1}</span>
            <span class="hr-time">${Utils.fmtH12(h)} – ${Utils.fmtH12(h2)}</span>
          </div>`;
        }).join('')}
      </div>`).join('');
  }
};

// ---- NAVIGATION ----
const Nav = {
  populateAllSelects() {
    const depts = Store.get('departments');
    const machines = Store.get('machines');

    // Machine page selects
    ['add-machine-dept','machine-filter-dept'].forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      const isFilter = id === 'machine-filter-dept';
      el.innerHTML = (isFilter ? '<option value="">All Departments</option>' : '<option value="">-- Select Dept --</option>') +
        depts.map(d => `<option>${Utils.esc(d)}</option>`).join('');
    });

    // User dept access
    const udSel = document.getElementById('u-depts');
    if(udSel) udSel.innerHTML = depts.map(d => `<option>${Utils.esc(d)}</option>`).join('');

    // Entry dept
    const entryDept = document.getElementById('entry-dept');
    if(entryDept) {
      const cur = entryDept.value;
      entryDept.innerHTML = '<option value="">-- Select Department --</option>' + depts.map(d => `<option>${Utils.esc(d)}</option>`).join('');
      entryDept.value = cur;
    }
  }
};
