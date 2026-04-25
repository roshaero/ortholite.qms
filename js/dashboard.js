// ===== DASHBOARD MODULE =====
const Dashboard = (() => {
  let charts = {};

  function calcKPIs() {
    const entries = Store.get('entries');
    const today = new Date().toDateString();
    const todayEntries = entries.filter(e => new Date(e.ts).toDateString() === today);

    let totalChecked = todayEntries.reduce((a,b) => a+b.checked, 0);
    let totalPass = todayEntries.reduce((a,b) => a+b.pass, 0);
    let totalReject = todayEntries.reduce((a,b) => a+b.reject, 0);
    let totalRepair = todayEntries.reduce((a,b) => a+b.repair, 0);

    // Add demo data if no real data
    if (totalChecked === 0) {
      totalChecked = 4820; totalPass = 4547; totalReject = 135; totalRepair = 138;
    }

    const ftpr = totalChecked > 0 ? (totalPass / totalChecked) * 100 : 0;
    const rejPct = totalChecked > 0 ? (totalReject / totalChecked) * 100 : 0;
    const repPct = totalChecked > 0 ? (totalRepair / totalChecked) * 100 : 0;

    return { totalChecked, totalPass, totalReject, totalRepair, ftpr, rejPct, repPct, entryCount: todayEntries.length };
  }

  function defectSummary() {
    const entries = Store.get('entries');
    const today = new Date().toDateString();
    const map = {};
    entries.filter(e => new Date(e.ts).toDateString() === today).forEach(e => {
      (e.defects || []).forEach(d => { map[d.name] = (map[d.name] || 0) + d.qty; });
    });
    // Demo data
    if (Object.keys(map).length === 0) {
      return [['Edge Crack',42],['Surface Peel',31],['Size Variation',24],['Colour Fading',20],['Thickness Issue',21],['Delamination',14]];
    }
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,6);
  }

  function destroyAll() { Object.values(charts).forEach(c => { if(c) c.destroy(); }); charts = {}; }

  function render() {
    destroyAll();
    const k = calcKPIs();
    const def = defectSummary();

    // KPI values
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('kpi-ftpr', Utils.fmtPct(k.ftpr));
    set('kpi-rej', Utils.fmtPct(k.rejPct));
    set('kpi-rework', Utils.fmtPct(k.repPct));
    set('kpi-checked', Utils.fmtNum(k.totalChecked));

    // Progress bars
    const setBar = (id, pct, color) => {
      const el = document.getElementById(id);
      if(el) { el.style.width = Math.min(pct,100)+'%'; el.style.background = color; }
    };
    setBar('bar-ftpr', k.ftpr, '#10b981');
    setBar('bar-rej', Math.min(k.rejPct*20, 100), '#ef4444');
    setBar('bar-rework', Math.min(k.repPct*20, 100), '#f59e0b');
    setBar('bar-checked', Math.min((k.totalChecked/6000)*100, 100), '#2563a8');

    renderHourlyChart(k);
    renderDefectChart(def);
    renderDeptChart();
    renderShiftChart();
    renderWeeklyChart();
    renderTopDefects(def);
  }

  function renderHourlyChart(k) {
    const ctx = document.getElementById('chart-hourly');
    if(!ctx) return;
    charts.hourly = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['H1','H2','H3','H4','H5','H6','H7','H8'],
        datasets: [
          { label:'FTPR %', data:[95.2,94.8,93.5,96.1,94.2,95.8,93.1,94.5], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.07)', tension:0.4, pointRadius:4, pointBackgroundColor:'#10b981', fill:true, borderWidth:2 },
          { label:'Rejection %', data:[2.1,2.5,3.8,1.9,3.0,2.2,4.1,2.8], borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.05)', tension:0.4, pointRadius:4, pointBackgroundColor:'#ef4444', fill:true, borderWidth:2 },
          { label:'Repair %', data:[2.7,2.7,2.7,2.0,2.8,2.0,2.8,2.7], borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.05)', tension:0.4, pointRadius:3, fill:true, borderWidth:1.5 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:true, position:'top', labels:{ font:{size:11}, boxWidth:10, padding:16, usePointStyle:true } } },
        scales:{
          y:{ beginAtZero:true, max:100, ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ color:'rgba(0,0,0,0.04)' } },
          x:{ ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ display:false } }
        }
      }
    });
  }

  function renderDefectChart(def) {
    const ctx = document.getElementById('chart-defect');
    if(!ctx) return;
    const colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#10b981','#ec4899'];
    charts.defect = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: def.map(d=>d[0]), datasets:[{ data: def.map(d=>d[1]), backgroundColor:colors, borderWidth:2, borderColor:'#fff', hoverOffset:6 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        cutout:'68%'
      }
    });
    // Custom legend
    const leg = document.getElementById('defect-legend');
    if(leg) {
      const total = def.reduce((a,b) => a+b[1], 0);
      leg.innerHTML = def.map((d,i) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;"><div style="width:10px;height:10px;border-radius:2px;background:${colors[i]};flex-shrink:0;"></div><div style="flex:1;font-size:12px;color:#475569;">${d[0]}</div><div style="font-size:12px;font-weight:600;color:#0f172a;">${d[1]}</div><div style="font-size:11px;color:#94a3b8;width:36px;text-align:right;">${total>0?((d[1]/total)*100).toFixed(0):'0'}%</div></div>`).join('');
    }
  }

  function renderDeptChart() {
    const ctx = document.getElementById('chart-dept');
    if(!ctx) return;
    const depts = Store.get('departments');
    const vals = depts.map(() => (Math.random()*3+1).toFixed(1));
    charts.dept = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: depts,
        datasets: [
          { label:'Rejection %', data: vals, backgroundColor: vals.map(v => v>3?'#ef4444':v>2?'#f59e0b':'#10b981'), borderRadius:5, borderSkipped:false }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true, ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ color:'rgba(0,0,0,0.04)' } }, x:{ ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ display:false } } }
      }
    });
  }

  function renderShiftChart() {
    const ctx = document.getElementById('chart-shift');
    if(!ctx) return;
    charts.shift = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Shift A','Shift B','Shift C'],
        datasets: [
          { label:'FTPR %', data:[95.2,93.8,94.6], backgroundColor:'rgba(16,185,129,0.85)', borderRadius:5, borderSkipped:false },
          { label:'Reject %', data:[2.1,3.4,2.8], backgroundColor:'rgba(239,68,68,0.8)', borderRadius:5, borderSkipped:false }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:true, position:'top', labels:{ font:{size:11}, boxWidth:10, usePointStyle:true } } },
        scales:{ y:{ beginAtZero:true, ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ color:'rgba(0,0,0,0.04)' } }, x:{ ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ display:false } } }
      }
    });
  }

  function renderWeeklyChart() {
    const ctx = document.getElementById('chart-weekly');
    if(!ctx) return;
    charts.weekly = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Today'],
        datasets: [
          { label:'FTPR %', data:[93.8,94.2,95.1,93.5,94.8,96.0,94.2], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.06)', tension:0.4, fill:true, pointRadius:5, pointBackgroundColor:'#10b981', borderWidth:2 },
          { label:'Rejection %', data:[3.1,2.8,2.2,3.5,2.5,1.8,2.8], borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.04)', tension:0.4, fill:true, pointRadius:4, borderWidth:2 },
          { label:'Rework %', data:[3.1,3.0,2.7,3.0,2.7,2.2,3.0], borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.04)', tension:0.4, fill:true, pointRadius:4, borderWidth:1.5 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:true, position:'top', labels:{ font:{size:11}, boxWidth:10, usePointStyle:true } } },
        scales:{ y:{ beginAtZero:true, ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ color:'rgba(0,0,0,0.04)' } }, x:{ ticks:{ font:{size:10}, color:'#94a3b8' }, grid:{ display:false } } }
      }
    });
  }

  function renderTopDefects(def) {
    const tb = document.getElementById('top-defects-tbody');
    if(!tb) return;
    const total = def.reduce((a,b) => a+b[1], 0);
    tb.innerHTML = def.map((d,i) => {
      const pct = total > 0 ? ((d[1]/total)*100).toFixed(1) : 0;
      const type = pct > 25 ? 'danger' : pct > 15 ? 'warning' : 'info';
      return `<tr><td>${i+1}</td><td><strong>${Utils.esc(d[0])}</strong></td><td>${d[1]}</td><td>${Utils.badge(pct+'%', type)}</td></tr>`;
    }).join('') || `<tr><td colspan="4" class="table-empty">No defect data</td></tr>`;
  }

  return { render };
})();
