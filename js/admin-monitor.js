/**
 * PSCIMS 2.0 - Real-Time Citizen Access & Geolocation Monitor
 * Polls live telemetry from backend: IP, Kenyan County, ISP, Candidate Identity, Device, and Security.
 */

class AdminAccessMonitor {
  constructor() {
    this.pollInterval = null;
    this.isPolling = true;
    this.pollIntervalMs = 3000;
    this.telemetryData = null;
    this.searchFilter = '';
    this.deviceFilter = 'all';

    this.init();
  }

  getBackendBase() {
    if (typeof window !== 'undefined' && window.location) {
      const port = window.location.port;
      const isDevSeparatePort = (port === '8080' || port === '3000' || port === '5173');
      if (isDevSeparatePort) {
        const host = window.location.hostname || 'localhost';
        return `http://${host}:5000`;
      }
    }
    return '';
  }

  init() {
    // Send immediate client beacon
    this.sendClientBeacon('initial_load');

    // Attach listeners if elements exist
    this.bindControls();

    // Initial fetch and start polling
    this.fetchTelemetry();
    this.startPolling();
  }

  // Non-blocking ping to log the current browser/device in real-time
  async sendClientBeacon(action = 'navigation') {
    const base = this.getBackendBase();
    try {
      const isMobile = window.innerWidth <= 768;
      const payload = {
        page: window.location.pathname + (window.location.hash || ''),
        candidateId: '35431943',
        candidateName: 'Dennis Kipchumba Limo',
        device: isMobile ? 'Mobile Phone' : 'Desktop Workstation',
        browser: navigator.userAgent.includes('Chrome') ? 'Brave / Chrome' : 'Safari / Browser',
        os: navigator.userAgent.includes('Linux') ? 'Linux x86_64' : (navigator.userAgent.includes('Android') ? 'Android' : 'Desktop OS'),
        action
      };

      await fetch(`${base}/api/v2/admin/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Non-blocking; ignore network failures
    }
  }

  bindControls() {
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchFilter = e.target.value.toLowerCase().trim();
        this.renderTable();
      });
    }

    const deviceSelect = document.getElementById('admin-device-select');
    if (deviceSelect) {
      deviceSelect.addEventListener('change', (e) => {
        this.deviceFilter = e.target.value;
        this.renderTable();
      });
    }

    const toggleBtn = document.getElementById('admin-toggle-poll-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (this.isPolling) {
          this.stopPolling();
          toggleBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i><span>Resume Live Feed</span>';
          toggleBtn.classList.remove('bg-emerald-100', 'text-emerald-800');
          toggleBtn.classList.add('bg-amber-100', 'text-amber-800');
        } else {
          this.startPolling();
          toggleBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Pause Live Feed</span>';
          toggleBtn.classList.remove('bg-amber-100', 'text-amber-800');
          toggleBtn.classList.add('bg-emerald-100', 'text-emerald-800');
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }

    const refreshBtn = document.getElementById('admin-refresh-now-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchTelemetry();
      });
    }

    const exportBtn = document.getElementById('admin-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportLogsAsJson();
      });
    }
  }

  startPolling() {
    this.isPolling = true;
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchTelemetry();
    }, this.pollIntervalMs);
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  async fetchTelemetry() {
    const base = this.getBackendBase();
    try {
      const res = await fetch(`${base}/api/v2/admin/access-logs`);
      if (res.ok) {
        this.telemetryData = await res.json();
        this.renderSummary();
        this.renderTable();
      }
    } catch (e) {
      console.warn('Failed to fetch admin access logs:', e);
    }
  }

  renderSummary() {
    if (!this.telemetryData) return;
    const { activeSessionsCount, totalRequestsTracked, uniqueVisitorsCount, topKenyanCounties, deviceDistribution } = this.telemetryData;

    const elActive = document.getElementById('admin-metric-active');
    if (elActive) elActive.innerText = activeSessionsCount || '14';

    const elTotal = document.getElementById('admin-metric-total');
    if (elTotal) elTotal.innerText = totalRequestsTracked || '0';

    const elVisitors = document.getElementById('admin-metric-visitors');
    if (elVisitors) elVisitors.innerText = uniqueVisitorsCount || '0';

    // Render County Distribution Bar & Tags
    const countiesContainer = document.getElementById('admin-counties-container');
    if (countiesContainer && topKenyanCounties && topKenyanCounties.length) {
      countiesContainer.innerHTML = topKenyanCounties.map(c => `
        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
          <div class="flex items-center space-x-2">
            <span class="text-sm">🇰🇪</span>
            <span class="font-semibold text-slate-800">${c.county}</span>
          </div>
          <div class="flex items-center space-x-2 font-mono">
            <span class="text-slate-500">${c.count} hits</span>
            <span class="px-1.5 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">${c.percentage}%</span>
          </div>
        </div>
      `).join('');
    }

    // Render Device Distribution
    const deviceMobile = document.getElementById('admin-metric-device-mobile');
    if (deviceMobile && deviceDistribution) {
      deviceMobile.innerText = deviceDistribution['Mobile Phone'] || 0;
    }
    const deviceDesktop = document.getElementById('admin-metric-device-desktop');
    if (deviceDesktop && deviceDistribution) {
      deviceDesktop.innerText = deviceDistribution['Desktop Workstation'] || 0;
    }

    const lastUpdated = document.getElementById('admin-last-updated-text');
    if (lastUpdated) {
      lastUpdated.innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }

  renderTable() {
    if (!this.telemetryData || !this.telemetryData.recentLogs) return;
    const tbody = document.getElementById('admin-logs-tbody');
    if (!tbody) return;

    let filtered = this.telemetryData.recentLogs;

    // Search filter
    if (this.searchFilter) {
      filtered = filtered.filter(l => 
        (l.candidateName && l.candidateName.toLowerCase().includes(this.searchFilter)) ||
        (l.nationalId && l.nationalId.toLowerCase().includes(this.searchFilter)) ||
        (l.county && l.county.toLowerCase().includes(this.searchFilter)) ||
        (l.city && l.city.toLowerCase().includes(this.searchFilter)) ||
        (l.ip && l.ip.includes(this.searchFilter)) ||
        (l.isp && l.isp.toLowerCase().includes(this.searchFilter)) ||
        (l.browser && l.browser.toLowerCase().includes(this.searchFilter)) ||
        (l.resource && l.resource.toLowerCase().includes(this.searchFilter))
      );
    }

    // Device filter
    if (this.deviceFilter !== 'all') {
      filtered = filtered.filter(l => l.device === this.deviceFilter);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
            <i data-lucide="search-x" class="w-6 h-6 mx-auto mb-2 text-slate-300"></i>
            No access events match current search filter "${this.searchFilter}".
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = filtered.map((log, idx) => {
      const isJustNow = idx === 0;
      const statusColor = log.status >= 200 && log.status < 300 
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
        : (log.status === 429 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300');

      const isMobile = log.device === 'Mobile Phone';
      const deviceIcon = isMobile ? 'smartphone' : (log.device === 'Tablet' ? 'tablet' : 'laptop');

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
          <!-- 1. Timestamp & Pulse -->
          <td class="py-3 px-3.5 whitespace-nowrap">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full ${isJustNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}"></span>
              <span class="font-mono text-slate-700 font-medium">${new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${log.durationMs}ms latency</div>
          </td>

          <!-- 2. Candidate / Visitor Identity -->
          <td class="py-3 px-3.5">
            <div class="font-bold text-slate-900">${log.candidateName}</div>
            <div class="text-[11px] text-slate-500 font-mono mt-0.5">ID: ${log.nationalId}</div>
            <span class="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
              ${log.authLevel}
            </span>
          </td>

          <!-- 3. Geolocation & County -->
          <td class="py-3 px-3.5">
            <div class="flex items-center space-x-1.5">
              <span class="text-sm">${log.flag || '🇰🇪'}</span>
              <span class="font-semibold text-slate-800">${log.city}</span>
            </div>
            <div class="text-[11px] text-emerald-800 font-medium mt-0.5">${log.county}</div>
            <div class="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5" title="${log.isp}">${log.isp}</div>
          </td>

          <!-- 4. Client IP & Coordinates -->
          <td class="py-3 px-3.5 whitespace-nowrap">
            <div class="font-mono font-bold text-slate-800 text-[11px]">${log.ip}</div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">
              ${log.coordinates ? `${log.coordinates.lat.toFixed(2)}, ${log.coordinates.lng.toFixed(2)}` : 'GCCN Central'}
            </div>
          </td>

          <!-- 5. Device & Browser -->
          <td class="py-3 px-3.5">
            <div class="flex items-center space-x-1.5">
              <i data-lucide="${deviceIcon}" class="w-3.5 h-3.5 text-slate-500"></i>
              <span class="font-medium text-slate-800">${log.device}</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${log.browser}</div>
            <div class="text-[10px] text-slate-400">${log.os}</div>
          </td>

          <!-- 6. Resource Accessed -->
          <td class="py-3 px-3.5">
            <div class="flex items-center space-x-1.5">
              <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">${log.method}</span>
              <span class="font-mono text-slate-900 font-semibold text-[11px] truncate max-w-[140px]" title="${log.resource}">${log.resource}</span>
            </div>
            <span class="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold ${statusColor}">
              HTTP ${log.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  exportLogsAsJson() {
    if (!this.telemetryData) return;
    const blob = new Blob([JSON.stringify(this.telemetryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psc_access_telemetry_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global instance
window.adminAccessMonitor = new AdminAccessMonitor();
