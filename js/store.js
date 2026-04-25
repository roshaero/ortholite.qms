// ===== ORTHOLITE QMS — DATA STORE =====
const Store = (() => {
  const KEYS = {
    users: 'qms_users',
    departments: 'qms_depts',
    machines: 'qms_machines',
    defects: 'qms_defects',
    salesOrders: 'qms_so',
    processes: 'qms_processes',
    processMapping: 'qms_proc_map',
    entries: 'qms_entries',
    odoo: 'qms_odoo'
  };

  const defaults = {
    users: [
      { name:'Admin User', id:'admin', pass:'admin123', role:'Admin', depts:[] }
    ],
    departments: ['Splitting','Lamination','Molding','Diecut'],
    machines: [
      { id:1, dept:'Splitting', name:'Splitting M/C 1', code:'SPL-001', cap:500 },
      { id:2, dept:'Splitting', name:'Splitting M/C 2', code:'SPL-002', cap:480 },
      { id:3, dept:'Lamination', name:'Lamination Line 1', code:'LAM-001', cap:300 },
      { id:4, dept:'Lamination', name:'Lamination Line 2', code:'LAM-002', cap:280 },
      { id:5, dept:'Molding', name:'Mold Press 1', code:'MOL-001', cap:200 },
      { id:6, dept:'Molding', name:'Mold Press 2', code:'MOL-002', cap:180 },
      { id:7, dept:'Diecut', name:'Diecut M/C 1', code:'DCT-001', cap:600 },
      { id:8, dept:'Diecut', name:'Diecut M/C 2', code:'DCT-002', cap:550 }
    ],
    defects: ['Edge Crack','Surface Peel','Size Variation','Colour Fading','Thickness Issue','Delamination','Contamination','Impression Mark','Air Bubble','Short Shot','Warping','Under-fill'],
    salesOrders: [
      { id:1, num:'SO-2025-001', customer:'Adidas GmbH', style:'UltraBoost X', article:'ART-2025-A1', prodcat:'Diecut Insoles', qty:5000 },
      { id:2, num:'SO-2025-002', customer:'Nike Inc.', style:'AirMax Pro', article:'ART-2025-B2', prodcat:'Molded Insoles', qty:8000 },
      { id:3, num:'SO-2025-003', customer:'Puma SE', style:'Velocity Run', article:'ART-2025-C3', prodcat:'Covered Sheets', qty:3000 },
      { id:4, num:'SO-2025-004', customer:'New Balance', style:'Fresh Foam X', article:'ART-2025-D4', prodcat:'Diecut Insoles', qty:4500 }
    ],
    processes: ['Splitting','Lamination','Molding','Diecut','Heat Transfer','Buffing','Endline Checking','Final AQL'],
    processMapping: {
      'Diecut Insoles': ['Splitting','Diecut','Endline Checking','Final AQL'],
      'Molded Insoles': ['Lamination','Molding','Buffing','Endline Checking','Final AQL'],
      'Uncovered Sheets': ['Splitting','Lamination','Endline Checking'],
      'Covered Sheets': ['Splitting','Lamination','Heat Transfer','Endline Checking','Final AQL']
    },
    entries: [],
    odoo: { url:'', db:'', apiKey:'', uid:'', lastSync:null }
  };

  function get(key) {
    const raw = localStorage.getItem(KEYS[key]);
    if (!raw) return JSON.parse(JSON.stringify(defaults[key]));
    return JSON.parse(raw);
  }

  function set(key, val) {
    localStorage.setItem(KEYS[key], JSON.stringify(val));
  }

  function getNextId(key) {
    const items = get(key);
    if (!Array.isArray(items) || items.length === 0) return 1;
    return Math.max(...items.map(i => i.id || 0)) + 1;
  }

  return { get, set, getNextId };
})();

// ===== GLOBAL APP STATE =====
const App = {
  currentUser: null,
  currentPage: 'dashboard',

  init() {
    const u = sessionStorage.getItem('qms_user');
    if (!u) { window.location.href = 'index.html'; return; }
    this.currentUser = JSON.parse(u);
  }
};
