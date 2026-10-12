const API = 'http://localhost:8080'
const INTERVAL = 5000
const HISTORY_MAX = 12

const cpuHistory = { labels: [], values: [] }

const ctx = document.getElementById('cpu-chart').getContext('2d')
const cpuChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: cpuHistory.labels,
    datasets: [{ data: cpuHistory.values, borderColor: '#3fb950', borderWidth: 1.5, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(63,185,80,0.08)' }]
  },
  options: {
    responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100, grid: { color: '#21262d' }, ticks: { color: '#7d8590', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + '%' }, border: { display: false } }
    }
  }
})

function colorClass(pct) { return pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : 'ok' }
function barClass(pct)   { return pct >= 90 ? 'bar-danger' : pct >= 70 ? 'bar-warn' : 'bar-ok' }

function setMetric(valueId, barId, pct, text) {
  const el = document.getElementById(valueId)
  const bar = document.getElementById(barId)
  el.textContent = text
  el.className = 'card-value ' + colorClass(pct)
  bar.style.width = Math.min(pct, 100) + '%'
  bar.className = 'bar-fill ' + barClass(pct)
}

async function fetchAll() {
  try {
    const [cpu, mem, disk, procs] = await Promise.all([
      fetch(`${API}/cpu`).then(r => r.json()),
      fetch(`${API}/memory`).then(r => r.json()),
      fetch(`${API}/disk`).then(r => r.json()),
      fetch(`${API}/processes`).then(r => r.json())
    ])

    const cpuPct = parseFloat(cpu.cpu_percent)
    setMetric('cpu-value', 'cpu-bar', cpuPct, cpuPct.toFixed(1) + '%')

    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    cpuHistory.labels.push(now)
    cpuHistory.values.push(cpuPct)
    if (cpuHistory.labels.length > HISTORY_MAX) { cpuHistory.labels.shift(); cpuHistory.values.shift() }
    cpuChart.update()

    const memPct = parseFloat(mem.percent)
    setMetric('mem-value', 'mem-bar', memPct, memPct.toFixed(1) + '%')
    document.getElementById('mem-sub').textContent = `${mem.used_mb.toLocaleString()} / ${mem.total_mb.toLocaleString()} MB`

    const diskPct = parseFloat(disk.percent)
    setMetric('disk-value', 'disk-bar', diskPct, diskPct.toFixed(1) + '%')
    document.getElementById('disk-sub').textContent = `${disk.used_gb} / ${disk.total_gb} GB`

    document.getElementById('proc-list').innerHTML = procs.map(p => {
      const c = parseFloat(p.cpu)
      return `<div class="proc-row">
        <span class="proc-name">${p.name}</span>
        <span class="proc-num ${colorClass(c)}">${c.toFixed(1)}%</span>
        <div class="proc-cpu-bar"><div class="mini-bar"><div class="mini-fill" style="width:${Math.min(c,100)}%"></div></div></div>
      </div>`
    }).join('')

    document.getElementById('last-updated').textContent = 'updated ' + now
  } catch (err) {
    document.getElementById('last-updated').textContent = 'connection lost'
    console.error(err)
  }
}

fetchAll()
setInterval(fetchAll, INTERVAL)