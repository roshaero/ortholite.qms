// ===== UTILITIES =====
const Utils = {
  // Toast notifications
  toast(msg, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    const icons = { success:'✓', error:'✕', warning:'⚠' };
    t.className = `toast ${type !== 'success' ? type : ''}`;
    t.innerHTML = `<span>${icons[type]||'✓'}</span><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(20px)'; t.style.transition='all 0.3s'; setTimeout(() => t.remove(), 300); }, duration);
  },

  // Modal
  showModal(html, onClose) {
    let overlay = document.getElementById('globalModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'globalModal';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    overlay.style.display = 'flex';
    overlay.onclick = e => { if (e.target === overlay) Utils.closeModal(onClose); };
    return overlay.querySelector('.modal');
  },

  closeModal(cb) {
    const m = document.getElementById('globalModal');
    if (m) m.style.display = 'none';
    if (cb) cb();
  },

  // Format helpers
  fmtNum(n) { return Number(n).toLocaleString('en-IN'); },
  fmtPct(n) { return Number(n).toFixed(1) + '%'; },
  fmtH12(h) { const p = h % 12 || 12; return `${p}:00 ${h < 12 ? 'AM' : 'PM'}`; },

  // Current shift & hour
  getShiftHour() {
    const h = new Date().getHours();
    let shift, shiftStart, shiftName;
    if (h >= 6 && h < 14) { shift = 'A'; shiftName = 'Shift A'; shiftStart = 6; }
    else if (h >= 14 && h < 22) { shift = 'B'; shiftName = 'Shift B'; shiftStart = 14; }
    else { shift = 'C'; shiftName = 'Shift C'; shiftStart = h >= 22 ? 22 : -2; }
    let hourNum = shift === 'C'
      ? (h >= 22 ? h - 22 + 1 : h + 2 + 1)
      : h - shiftStart + 1;
    hourNum = Math.min(Math.max(hourNum, 1), 8);
    return { shift, shiftName, hourNum };
  },

  // Date/time
  nowStr() { return new Date().toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); },
  timeStr() { return new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}); },
  dateStr() { return new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}); },

  // Confirm dialog
  confirm(msg) { return window.confirm(msg); },

  // Escape HTML
  esc(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },

  // Badge HTML
  badge(text, type = 'info') { return `<span class="badge badge-${type}">${this.esc(text)}</span>`; },

  // Generate hourly label
  shiftHourLabel(shiftLetter, hourNum) {
    const starts = { A: 6, B: 14, C: 22 };
    const s = starts[shiftLetter] || 6;
    const h = (s + hourNum - 1) % 24;
    const h2 = (s + hourNum) % 24;
    return `${this.fmtH12(h)} – ${this.fmtH12(h2)}`;
  }
};
