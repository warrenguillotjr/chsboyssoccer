/* ============================================================
   CHS BOYS SOCCER PROGRAM MANAGEMENT PLATFORM
   app.js — Core Application Logic v2
   Updated to match verified Google Sheets database structure
   16 tabs — exact column headers confirmed by Coach Guillot
   ============================================================ */

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  COACH_PASSWORD:  'CHSLionsCoach2026',
  PLAYER_PASSWORD: 'Lions2026',

  SHEET_ID: '19SQp3dGXEkBfPCpPUBjwCSqsSI_AsfJITJFcBllmuq0',
  CALENDAR_ID: 'bfef8d3332e21e4920a3058aae7c9850a686fe2a06090f3ccbeb372922f20c67@group.calendar.google.com',

  PROGRAM_NAME: 'CHS Boys Soccer Program',
  SCHOOL_NAME:  'Covington High School',
  HEAD_COACH:   'Warren Guillot, Jr.',
  DISTRICT:     'District 6-I',
  SEASON:       '2025-2026',

  SESSION_KEY: 'chsSoccerRole',
  PLAYER_KEY:  'chsSoccerPlayer',
  SHEETS_BASE: 'https://docs.google.com/spreadsheets/d/',

  // Logo — absolute path for reliability across all pages
  LOGO_URL: 'https://warrenguillotjr.github.io/chsboyssoccer/assets/logo.gif',
};

// ============================================================
// TAB NAMES — exact names as they appear in Google Sheets
// Change here if tab names ever change — one place to update
// ============================================================
const TABS = {
  PLAYERS:                  'Players',
  CONTACTS:                 'Contacts',
  COMPLIANCE:               'Compliance',
  SCHEDULE:                 'Schedule',
  AVAILABILITY:             'Availability',
  ANNOUNCEMENTS:            'Announcements',
  MATCH_LOGS:               'Match_Logs',
  PLAYER_STATS:             'Player_Stats',
  EQUIPMENT:                'Equipment',
  TOURNAMENT:               'Tournament',
  BOOSTER_CLUB:             'Booster_Club',
  HISTORY_SEASONS:          'Program_History_Seasons',
  HISTORY_ALL_GAMES:        'Program_History_All_Games',
  HISTORY_COACHES:          'Program_History_Coaches',
  HISTORY_AWARDS:           'Program_History_Awards',
  STAFF:                    'Staff',
};

// ============================================================
// GOOGLE SHEETS DATA LAYER
// ============================================================

/**
 * Fetches a tab from Google Sheets and returns array of row objects
 * Uses the gviz/tq CSV export — no API key required
 */
async function fetchSheetData(tabName) {
  const url = `${CONFIG.SHEETS_BASE}${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${tabName}`);
    const csv = await response.text();
    return parseCSV(csv);
  } catch (err) {
    console.error(`Error fetching sheet tab "${tabName}":`, err);
    return [];
  }
}

/**
 * Placeholder write function — will be connected to
 * Google Apps Script in the next build session
 */
async function writeSheetData(tabName, rowData) {
  console.log(`[WRITE] Tab: ${tabName}`, rowData);
  return { success: true };
}

/**
 * Parses a CSV string into an array of objects keyed by header row
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    if (Object.values(row).some(v => v !== '')) rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = '';
    } else { current += char; }
  }
  result.push(current);
  return result;
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

function getRole()           { return sessionStorage.getItem(CONFIG.SESSION_KEY); }
function getSelectedPlayer() { return sessionStorage.getItem(CONFIG.PLAYER_KEY); }
function setRole(role)       { sessionStorage.setItem(CONFIG.SESSION_KEY, role); }
function setSelectedPlayer(name) { sessionStorage.setItem(CONFIG.PLAYER_KEY, name); }

function logout() {
  sessionStorage.removeItem(CONFIG.SESSION_KEY);
  sessionStorage.removeItem(CONFIG.PLAYER_KEY);
  window.location.href = 'index.html';
}

function requireAuth(allowedRoles = ['coach', 'player']) {
  const role = getRole();
  if (!role || !allowedRoles.includes(role)) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function handleLogin(password) {
  if (password === CONFIG.COACH_PASSWORD) {
    setRole('coach');
    window.location.href = 'coach.html';
    return true;
  } else if (password === CONFIG.PLAYER_PASSWORD) {
    setRole('player');
    window.location.href = 'player-select.html';
    return true;
  }
  return false;
}

// ============================================================
// UI UTILITIES
// ============================================================

function showToast(message, type = '', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' toast-' + type : ''}`;
  const icon = type === 'success' ? '✓' : type === 'danger' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showLoading(containerId, message = 'Loading...') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>${message}</span></div>`;
}

function showEmpty(containerId, icon = '📋', title = 'No data yet', message = '') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ''}
    </div>`;
}

function initTabs(tabGroupId) {
  const group = document.getElementById(tabGroupId);
  if (!group) return;
  const buttons = group.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });
  if (buttons.length > 0) buttons[0].click();
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ============================================================
// DATE & TIME UTILITIES
// ============================================================

function formatDate(dateStr, format = 'long') {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;
  const opts = {
    short:       { month: 'short', day: 'numeric' },
    long:        { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
    'month-day': { month: 'short', day: 'numeric' },
    full:        { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    year:        { month: 'short', day: 'numeric', year: 'numeric' },
  };
  return date.toLocaleDateString('en-US', opts[format] || opts.long);
}

function getMonthAbbr(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
}

function getDayNumber(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').getDate();
}

function isPastDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  return date < today;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00').toDateString() === new Date().toDateString();
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

// ============================================================
// SCHEDULE MODULE
// ============================================================

function renderSchedule(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!events || events.length === 0) {
    showEmpty(containerId, '📅', 'No events scheduled', 'Events will appear here once added to the schedule.');
    return;
  }

  const { showPast = false, limit = 999, teamFilter = '' } = options;

  let filtered = events
    .filter(e => e.Date && e.EventTitle)
    .filter(e => showPast || !isPastDate(e.Date))
    .filter(e => !teamFilter || e.Team === teamFilter || e.Team === 'All');

  filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  if (limit < 999) filtered = filtered.slice(0, limit);

  if (filtered.length === 0) {
    showEmpty(containerId, '✅', 'No upcoming events', 'Check back soon for schedule updates.');
    return;
  }

  const typeClass = t =>
    t === 'Game'       ? 'badge-blue'  :
    t === 'Practice'   ? 'badge-green' :
    t === 'Tournament' ? 'badge-gold'  :
    t === 'Scrimmage'  ? 'badge-warning' : 'badge-gray';

  const html = filtered.map(event => {
    const isChanged   = event.Status === 'Changed';
    const isCancelled = event.Status === 'Cancelled';
    const isPostponed = event.Status === 'Postponed';
    const days = daysUntil(event.Date);
    const daysLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days > 1 ? `In ${days} days` : '';

    return `
      <div class="schedule-item ${isChanged ? 'changed' : ''} ${isCancelled ? 'cancelled' : ''}">
        <div class="schedule-date-block">
          <div class="schedule-month">${getMonthAbbr(event.Date)}</div>
          <div class="schedule-day">${getDayNumber(event.Date)}</div>
        </div>
        <div class="schedule-info">
          <div class="schedule-title">${event.EventTitle || ''}
            ${isCancelled ? '<span class="badge badge-red" style="margin-left:6px;font-size:0.65rem;">CANCELLED</span>' : ''}
            ${isChanged   ? '<span class="badge badge-warning" style="margin-left:6px;font-size:0.65rem;">CHANGED</span>'   : ''}
            ${isPostponed ? '<span class="badge badge-gray" style="margin-left:6px;font-size:0.65rem;">POSTPONED</span>'    : ''}
          </div>
          <div class="schedule-meta">
            ${event.Time     ? `⏰ ${event.Time}`         : ''}
            ${event.Location ? ` · 📍 ${event.Location}`  : ''}
            ${event.Opponent ? ` · vs. ${event.Opponent}` : ''}
            ${daysLabel      ? ` · <strong>${daysLabel}</strong>` : ''}
          </div>
          ${event.ChangeNote ? `<div class="schedule-meta" style="color:var(--warning);margin-top:2px;">⚠ ${event.ChangeNote}</div>` : ''}
        </div>
        <div class="schedule-tag">
          <span class="badge ${typeClass(event.EventType)}">${event.EventType || 'Event'}</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

// ============================================================
// AVAILABILITY MODULE
// ============================================================

function renderAvailabilityCards(containerId, events, responses, playerName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upcoming = events.filter(e =>
    e.Date && !isPastDate(e.Date) &&
    (e.EventType === 'Game' || e.EventType === 'Practice' ||
     e.EventType === 'Tournament' || e.EventType === 'Scrimmage')
  ).sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice(0, 12);

  if (upcoming.length === 0) {
    showEmpty(containerId, '📅', 'No upcoming events', 'Availability cards will appear here for upcoming events.');
    return;
  }

  const responseMap = {};
  responses.forEach(r => {
    if (r.PlayerName === playerName) responseMap[r.EventID] = r.Response;
  });

  const html = upcoming.map(event => {
    const currentResponse = responseMap[event.EventID] || '';
    const days = daysUntil(event.Date);
    const urgency = days <= 2 ? 'border: 2px solid var(--warning);' : '';

    return `
      <div class="avail-event-card" style="${urgency}">
        <div class="avail-event-date">${formatDate(event.Date, 'long')}</div>
        <div class="avail-event-name">${event.EventTitle}</div>
        <div class="avail-event-loc">
          ${event.Time ? event.Time + ' · ' : ''}${event.Location || ''}
          ${event.Opponent ? ' · vs. ' + event.Opponent : ''}
        </div>
        ${days <= 2 && days >= 0 ? `<div style="font-size:0.75rem;color:var(--warning);font-weight:600;margin-bottom:0.5rem;">⚠ Response needed soon</div>` : ''}
        <div class="avail-btns">
          <button class="avail-btn avail-btn-yes ${currentResponse === 'Available' ? 'selected-yes' : ''}"
            onclick="submitAvailability('${event.EventID}', '${event.EventTitle}', 'Available', this)">
            ✓ Available
          </button>
          <button class="avail-btn avail-btn-no ${currentResponse === 'Unavailable' ? 'selected-no' : ''}"
            onclick="submitAvailability('${event.EventID}', '${event.EventTitle}', 'Unavailable', this)">
            ✕ Can't Make It
          </button>
          <button class="avail-btn avail-btn-maybe ${currentResponse === 'Unsure' ? 'selected-maybe' : ''}"
            onclick="submitAvailability('${event.EventID}', '${event.EventTitle}', 'Unsure', this)">
            ? Unsure
          </button>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="avail-grid">${html}</div>`;
}

async function submitAvailability(eventId, eventTitle, response, buttonEl) {
  const playerName = getSelectedPlayer();
  if (!playerName) { showToast('No player selected. Please log in again.', 'danger'); return; }

  const card = buttonEl.closest('.avail-event-card');
  card.querySelectorAll('.avail-btn').forEach(btn => {
    btn.classList.remove('selected-yes', 'selected-no', 'selected-maybe');
  });

  const classMap = { Available: 'selected-yes', Unavailable: 'selected-no', Unsure: 'selected-maybe' };
  buttonEl.classList.add(classMap[response] || '');

  const rowData = {
    PlayerName: playerName,
    EventID: eventId,
    EventTitle: eventTitle,
    Response: response,
    Timestamp: new Date().toISOString(),
    Reason: '',
    Deadline: '',
  };

  await writeSheetData(TABS.AVAILABILITY, rowData);
  showToast(`Marked as ${response} for ${eventTitle}`, 'success');
}

// ============================================================
// ANNOUNCEMENTS MODULE
// ============================================================

function renderAnnouncements(containerId, announcements, limit = 999) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!announcements || announcements.length === 0) {
    showEmpty(containerId, '📣', 'No announcements yet', 'Program announcements will appear here.');
    return;
  }

  const sorted = [...announcements]
    .filter(a => a.Title && a.Message)
    .sort((a, b) => new Date(b.Date) - new Date(a.Date))
    .slice(0, limit);

  const priorityClass = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };

  const html = sorted.map(a => `
    <div class="announcement-card ${priorityClass[a.Priority] || ''}">
      <div class="announcement-meta">
        <span class="announcement-title">${a.Title}</span>
        ${a.Priority === 'High' ? '<span class="badge badge-red" style="font-size:0.65rem;">IMPORTANT</span>' : ''}
        ${a.AlertType && a.AlertType !== 'General' ? `<span class="badge badge-warning" style="font-size:0.65rem;">${a.AlertType.toUpperCase()}</span>` : ''}
        <span class="announcement-date">${formatDate(a.Date, 'short')}</span>
      </div>
      <div class="announcement-body">${a.Message}</div>
      ${a.PostedBy ? `<div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.4rem;">— ${a.PostedBy}</div>` : ''}
    </div>`).join('');

  container.innerHTML = html;
}

// ============================================================
// STATISTICS MODULE
// Updated to match Player_Stats tab exact column headers
// Appearances = per-half appearances (max 2 per game)
// ============================================================

/**
 * Calculates season totals for a player from Player_Stats tab
 * Columns: StatID, PlayerName, MatchID, Date, Appearances,
 *          ShotsOnTarget, ShotsOffTarget, TotalShots, Goals, Assists,
 *          YellowCards, RedCards, Clearances, Interceptions, Tackles,
 *          PassComplete, PassIncomplete, PassesTotal, Saves, CleanSheets
 */
function calcPlayerSeasonStats(playerStats, playerName) {
  const rows = playerStats.filter(s => s.PlayerName === playerName);
  const totals = rows.reduce((t, row) => {
    t.appearances     += parseInt(row.Appearances     || 0);
    t.shotsOnTarget   += parseInt(row.ShotsOnTarget   || 0);
    t.shotsOffTarget  += parseInt(row.ShotsOffTarget  || 0);
    t.totalShots      += parseInt(row.TotalShots      || 0);
    t.goals           += parseInt(row.Goals           || 0);
    t.assists         += parseInt(row.Assists         || 0);
    t.yellowCards     += parseInt(row.YellowCards     || 0);
    t.redCards        += parseInt(row.RedCards        || 0);
    t.clearances      += parseInt(row.Clearances      || 0);
    t.interceptions   += parseInt(row.Interceptions   || 0);
    t.tackles         += parseInt(row.Tackles         || 0);
    t.passComplete    += parseInt(row.PassComplete    || 0);
    t.passIncomplete  += parseInt(row.PassIncomplete  || 0);
    t.passesTotal     += parseInt(row.PassesTotal     || 0);
    t.saves           += parseInt(row.Saves           || 0);
    t.cleanSheets     += parseInt(row.CleanSheets     || 0);
    t.gamesPlayed     += 1;
    return t;
  }, {
    appearances:0, shotsOnTarget:0, shotsOffTarget:0, totalShots:0,
    goals:0, assists:0, yellowCards:0, redCards:0,
    clearances:0, interceptions:0, tackles:0,
    passComplete:0, passIncomplete:0, passesTotal:0,
    saves:0, cleanSheets:0, gamesPlayed:0
  });

  // Derived stats
  totals.goalContributions = totals.goals + totals.assists;
  totals.shotAccuracy = totals.totalShots > 0
    ? Math.round((totals.shotsOnTarget / totals.totalShots) * 100) : 0;
  totals.passAccuracy = totals.passesTotal > 0
    ? Math.round((totals.passComplete / totals.passesTotal) * 100) : 0;
  // Appearance rate: appearances out of possible (gamesPlayed × 2 halves)
  totals.appearanceRate = totals.gamesPlayed > 0
    ? Math.round((totals.appearances / (totals.gamesPlayed * 2)) * 100) : 0;
  // Equivalent full games (2 appearances = 1 full game)
  totals.equivalentGames = (totals.appearances / 2).toFixed(1);

  return totals;
}

/**
 * Calculates team season record from Match_Logs tab
 * Columns: MatchID, Team, Opponent, Date, Location,
 *          OpponentScore, CHSScore, Result, Notes
 */
function calcTeamRecord(matchLogs, team = 'Varsity') {
  const teamMatches = matchLogs.filter(m => m.Team === team && m.Result);
  return teamMatches.reduce((rec, m) => {
    if      (m.Result === 'W') rec.wins++;
    else if (m.Result === 'L') rec.losses++;
    else if (m.Result === 'D' || m.Result === 'T') rec.draws++;
    rec.goalsFor     += parseInt(m.CHSScore      || 0);
    rec.goalsAgainst += parseInt(m.OpponentScore || 0);
    return rec;
  }, { wins:0, losses:0, draws:0, goalsFor:0, goalsAgainst:0 });
}

/**
 * Formats a team record object into display string
 */
function formatRecord(rec) {
  return `${rec.wins}-${rec.losses}-${rec.draws}`;
}

// ============================================================
// ROSTER MODULE
// ============================================================

/**
 * Renders a player roster table
 * Coach view includes status column and action buttons
 * Player view shows name, position, team, grade only
 */
function renderRosterTable(containerId, players, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { teamFilter = '', showInactive = false } = options;

  let filtered = players
    .filter(p => p.LastName)
    .filter(p => showInactive || p.ActiveStatus === 'Active')
    .filter(p => !teamFilter || p.Team === teamFilter);

  filtered.sort((a, b) => {
    const numA = parseInt(a.JerseyNumber || 99);
    const numB = parseInt(b.JerseyNumber || 99);
    return numA - numB;
  });

  if (filtered.length === 0) {
    showEmpty(containerId, '👤', 'No players found', 'Add players to the Roster to see them here.');
    return;
  }

  const isCoach = getRole() === 'coach';

  const rows = filtered.map(p => {
    const displayName = `${p.LastName}, ${p.PreferredName || p.FirstName}`;
    const teamBadge = p.Team === 'Varsity' ? 'badge-blue' :
                      p.Team === 'JV Blue'  ? 'badge-blue'  : 'badge-gold';
    return `
      <tr>
        <td><strong>${p.JerseyNumber || '—'}</strong></td>
        <td>${displayName}</td>
        <td>${p.PrimaryPosition || '—'}</td>
        ${p.SecondaryPosition && p.SecondaryPosition !== 'None' ? `<td>${p.SecondaryPosition}</td>` : isCoach ? '<td>—</td>' : ''}
        <td><span class="badge ${teamBadge}">${p.Team || '—'}</span></td>
        <td>${p.GradeLevel || '—'}</td>
        ${isCoach ? `<td><span class="badge ${p.ActiveStatus === 'Active' ? 'badge-green' : 'badge-gray'}">${p.ActiveStatus || '—'}</span></td>` : ''}
        ${isCoach ? `<td><button class="btn btn-ghost btn-sm" onclick="viewPlayerProfile('${p.PlayerID}')">View</button></td>` : ''}
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Primary Position</th>
            ${isCoach ? '<th>Secondary</th>' : ''}
            <th>Team</th>
            <th>Grade</th>
            ${isCoach ? '<th>Status</th>' : ''}
            ${isCoach ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="font-size:0.78rem;color:var(--gray-400);margin-top:0.5rem;text-align:right;">
      ${filtered.length} player${filtered.length !== 1 ? 's' : ''}
    </div>`;
}

// ============================================================
// COMPLIANCE MODULE
// Columns: PlayerID, PlayerName, PhysicalDate, WaiverSigned,
//          ExpirationDate, ClearanceStatus, Notes
// ============================================================

function complianceStatus(complianceRow) {
  if (!complianceRow) return { label: 'Missing', cls: 'badge-red' };
  const { ClearanceStatus } = complianceRow;
  if (ClearanceStatus === 'Cleared')    return { label: 'Cleared',    cls: 'badge-green' };
  if (ClearanceStatus === 'Pending')    return { label: 'Pending',    cls: 'badge-warning' };
  if (ClearanceStatus === 'Incomplete') return { label: 'Incomplete', cls: 'badge-red' };
  if (ClearanceStatus === 'Expired')    return { label: 'Expired',    cls: 'badge-red' };
  return { label: 'Review', cls: 'badge-warning' };
}

function renderComplianceTable(containerId, players, complianceData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const active = players.filter(p => p.ActiveStatus === 'Active' && p.LastName);
  if (active.length === 0) {
    showEmpty(containerId, '🔒', 'No players found', 'Add players to the roster first.');
    return;
  }

  // Build lookup by PlayerID and by PlayerName (fallback)
  const compByID   = {};
  const compByName = {};
  complianceData.forEach(c => {
    if (c.PlayerID)   compByID[c.PlayerID]     = c;
    if (c.PlayerName) compByName[c.PlayerName] = c;
  });

  let cleared = 0, pending = 0, incomplete = 0;

  const rows = active.map(p => {
    const displayName = `${p.LastName}, ${p.PreferredName || p.FirstName}`;
    const comp   = compByID[p.PlayerID] || compByName[displayName] || {};
    const status = complianceStatus(comp);
    if (status.label === 'Cleared')    cleared++;
    else if (status.label === 'Pending')   pending++;
    else incomplete++;

    const expiresInDays = comp.ExpirationDate ? daysUntil(comp.ExpirationDate) : null;
    const expiringSoon  = expiresInDays !== null && expiresInDays <= 30 && expiresInDays >= 0;

    return `
      <tr>
        <td>${p.PlayerID || '—'}</td>
        <td>${displayName}</td>
        <td><span class="badge badge-${p.Team === 'Varsity' ? 'blue' : 'gold'}">${p.Team}</span></td>
        <td>${comp.PhysicalDate
          ? formatDate(comp.PhysicalDate, 'short')
          : '<span class="badge badge-red">Missing</span>'}</td>
        <td>${comp.WaiverSigned === 'Yes'
          ? '<span class="badge badge-green">Signed</span>'
          : comp.WaiverSigned === 'Pending'
          ? '<span class="badge badge-warning">Pending</span>'
          : '<span class="badge badge-red">Unsigned</span>'}</td>
        <td>${comp.ExpirationDate
          ? `${formatDate(comp.ExpirationDate, 'short')}${expiringSoon ? ' <span class="badge badge-warning">Expiring Soon</span>' : ''}`
          : '—'}</td>
        <td><span class="badge ${status.cls}">${status.label}</span></td>
        <td style="font-size:0.78rem;color:var(--gray-600);">${comp.Notes || ''}</td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div style="display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
      <span class="badge badge-green">✓ ${cleared} Cleared</span>
      <span class="badge badge-warning">⋯ ${pending} Pending</span>
      <span class="badge badge-red">✕ ${incomplete} Incomplete / Missing</span>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Player</th><th>Team</th>
            <th>Physical Date</th><th>Waiver</th>
            <th>Expiration</th><th>Status</th><th>Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ============================================================
// MATCH LOGS MODULE
// Columns: MatchID, Team, Opponent, Date, Location,
//          OpponentScore, CHSScore, Result, Notes
// ============================================================

function renderMatchLogsTable(containerId, matchLogs, teamFilter = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let logs = [...matchLogs].filter(m => m.Opponent || m.Date);
  if (teamFilter) logs = logs.filter(m => m.Team === teamFilter);
  logs.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  if (logs.length === 0) {
    showEmpty(containerId, '⚽', 'No matches logged yet', 'Use the Log Match button to record your first match.');
    return;
  }

  const rows = logs.map(m => {
    const chsScore  = m.CHSScore      || '0';
    const oppScore  = m.OpponentScore || '0';
    const resultBadge =
      m.Result === 'W' ? '<span class="badge badge-green">Win</span>'  :
      m.Result === 'L' ? '<span class="badge badge-red">Loss</span>'   :
      m.Result === 'D' || m.Result === 'T' ? '<span class="badge badge-gray">Draw</span>' : '—';

    return `
      <tr>
        <td>${formatDate(m.Date, 'short')}</td>
        <td>${m.Opponent || '—'}</td>
        <td style="text-align:center;font-weight:700;font-size:1.05rem;">
          ${chsScore} – ${oppScore}
        </td>
        <td>${resultBadge}</td>
        <td><span class="badge badge-${m.Team === 'Varsity' ? 'blue' : 'gold'}">${m.Team || '—'}</span></td>
        <td>${m.Location || '—'}</td>
        <td style="font-size:0.78rem;color:var(--gray-600);">${m.Notes || ''}</td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Opponent</th><th style="text-align:center;">Score</th>
            <th>Result</th><th>Team</th><th>Location</th><th>Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ============================================================
// PLAYER STATS TABLE — SEASON LEADERS
// ============================================================

function renderPlayerStatsTable(containerId, players, playerStats, statColumns = ['goals','assists','appearances']) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const active = players.filter(p => p.ActiveStatus === 'Active' && p.LastName);
  const statRows = active.map(p => {
    const name = `${p.LastName}, ${p.PreferredName || p.FirstName}`;
    return { name, jersey: p.JerseyNumber, team: p.Team, ...calcPlayerSeasonStats(playerStats, name) };
  }).filter(p => p.gamesPlayed > 0);

  if (statRows.length === 0) {
    showEmpty(containerId, '📊', 'No stats recorded yet', 'Stats will appear here once matches are logged.');
    return;
  }

  // Sort by goals desc, then assists, then appearances
  statRows.sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.appearances - a.appearances);

  const rows = statRows.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>#${s.jersey || '—'}</strong></td>
      <td>${s.name}</td>
      <td><span class="badge badge-${s.team === 'Varsity' ? 'blue' : 'gold'}">${s.team}</span></td>
      <td style="text-align:center;">${s.gamesPlayed}</td>
      <td style="text-align:center;">${s.appearances}
        <span style="font-size:0.7rem;color:var(--gray-400);">(${s.appearanceRate}%)</span>
      </td>
      <td style="text-align:center;font-weight:700;">${s.goals}</td>
      <td style="text-align:center;">${s.assists}</td>
      <td style="text-align:center;">${s.goalContributions}</td>
      <td style="text-align:center;">${s.totalShots}</td>
      <td style="text-align:center;">${s.shotsOnTarget}
        ${s.totalShots > 0 ? `<span style="font-size:0.7rem;color:var(--gray-400);">(${s.shotAccuracy}%)</span>` : ''}
      </td>
      ${s.saves > 0 || s.cleanSheets > 0 ? `<td style="text-align:center;">${s.saves} / ${s.cleanSheets}</td>` : '<td style="text-align:center;color:var(--gray-400);">—</td>'}
      <td style="text-align:center;">${s.yellowCards > 0 ? `<span class="badge badge-warning">${s.yellowCards}</span>` : '0'}</td>
      <td style="text-align:center;">${s.redCards > 0 ? `<span class="badge badge-red">${s.redCards}</span>` : '0'}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>#</th><th>Player</th><th>Team</th>
            <th style="text-align:center;">GP</th>
            <th style="text-align:center;">APP</th>
            <th style="text-align:center;">G</th>
            <th style="text-align:center;">A</th>
            <th style="text-align:center;">GC</th>
            <th style="text-align:center;">SH</th>
            <th style="text-align:center;">SOT</th>
            <th style="text-align:center;">SV/CS</th>
            <th style="text-align:center;">YC</th>
            <th style="text-align:center;">RC</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.5rem;">
      GP=Games Played · APP=Appearances (per half) · G=Goals · A=Assists · GC=Goal Contributions ·
      SH=Shots · SOT=Shots on Target · SV=Saves · CS=Clean Sheets · YC=Yellow Cards · RC=Red Cards
    </div>`;
}

// ============================================================
// PROGRAM HISTORY MODULE
// ============================================================

function renderSeasonHistory(containerId, seasons) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!seasons || seasons.length === 0) {
    showEmpty(containerId, '🏅', 'No season history yet', 'Add season records to Program_History_Seasons in your Google Sheet.');
    return;
  }

  const sorted = [...seasons].filter(s => s.Season).sort((a, b) => b.Season - a.Season);

  const rows = sorted.map(s => `
    <tr>
      <td><strong>${s.Season || '—'}</strong></td>
      <td>${s.GamesPlayed || '—'}</td>
      <td style="text-align:center;">
        <strong>${s.Wins || 0}</strong>-${s.Losses || 0}-${s.Draws || 0}
      </td>
      <td style="text-align:center;">${s['Win%'] || '—'}</td>
      <td style="text-align:center;">${s.GF || '—'}</td>
      <td style="text-align:center;">${s.GA || '—'}</td>
      <td style="text-align:center;">${s.GD || '—'}</td>
      <td style="text-align:center;">
        ${s.DistrictWins || 0}-${s.DistrictLosses || 0}-${s.DistrictDraws || 0}
      </td>
      <td>${s.DistrictFinish || '—'}</td>
      <td>${s.PlayoffAppearance || '—'}</td>
      <td>${s.HeadCoach || '—'}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Season</th><th>GP</th><th style="text-align:center;">W-L-D</th>
            <th style="text-align:center;">Win%</th>
            <th style="text-align:center;">GF</th>
            <th style="text-align:center;">GA</th>
            <th style="text-align:center;">GD</th>
            <th style="text-align:center;">District W-L-D</th>
            <th>District Finish</th>
            <th>Playoff</th>
            <th>Head Coach</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.5rem;">
      GP=Games Played · GF=Goals For · GA=Goals Against · GD=Goal Difference
    </div>`;
}

function renderAllGamesHistory(containerId, games) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!games || games.length === 0) {
    showEmpty(containerId, '⚽', 'No game history yet', 'Add historical game results to Program_History_All_Games.');
    return;
  }

  const sorted = [...games].filter(g => g.Date || g.Season).sort((a, b) => {
    if (a.Season !== b.Season) return b.Season - a.Season;
    return new Date(b.Date) - new Date(a.Date);
  });

  const rows = sorted.map(g => `
    <tr>
      <td>${g.Season || '—'}</td>
      <td>${g.Date ? formatDate(g.Date, 'short') : '—'}</td>
      <td>${g.Opponent || '—'}</td>
      <td>${g.District === 'Yes' || g.District === 'Y'
        ? '<span class="badge badge-blue" style="font-size:0.65rem;">District</span>'
        : '<span class="badge badge-gray" style="font-size:0.65rem;">Non-District</span>'}</td>
      <td style="text-align:center;font-weight:700;">${g.CHSScore || '—'} – ${g.OppScore || '—'}</td>
      <td>${g.Result === 'W' ? '<span class="badge badge-green">Win</span>' :
           g.Result === 'L' ? '<span class="badge badge-red">Loss</span>' :
           '<span class="badge badge-gray">Draw</span>'}</td>
      <td><span class="badge badge-gray" style="font-size:0.65rem;">${g.GameType || '—'}</span></td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Season</th><th>Date</th><th>Opponent</th>
            <th>Type</th><th style="text-align:center;">Score</th>
            <th>Result</th><th>Game Type</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderCoachHistory(containerId, coaches) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!coaches || coaches.length === 0) {
    showEmpty(containerId, '🏅', 'No coaching history yet', 'Add coach records to Program_History_Coaches.');
    return;
  }

  const rows = coaches.map(c => `
    <tr>
      <td><strong>${c.HeadCoachName || '—'}</strong></td>
      <td>${c.FirstSeason || '—'}</td>
      <td>${c.LastSeason  || '—'}</td>
      <td style="text-align:center;">${c.TotalNumSeasons || '—'}</td>
      <td style="text-align:center;font-weight:700;">
        ${c.Wins || 0}-${c.Losses || 0}-${c.Draws || 0}
      </td>
      <td style="text-align:center;">${c['Win%'] || '—'}</td>
      <td style="text-align:center;">${c.GF || '—'}</td>
      <td style="text-align:center;">${c.GA || '—'}</td>
      <td style="text-align:center;">${c.GD || '—'}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Coach</th><th>First Season</th><th>Last Season</th>
            <th style="text-align:center;">Seasons</th>
            <th style="text-align:center;">W-L-D</th>
            <th style="text-align:center;">Win%</th>
            <th style="text-align:center;">GF</th>
            <th style="text-align:center;">GA</th>
            <th style="text-align:center;">GD</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderAwardsHistory(containerId, awards) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!awards || awards.length === 0) {
    showEmpty(containerId, '🏆', 'No awards recorded yet', 'Add award records to Program_History_Awards.');
    return;
  }

  const sorted = [...awards].filter(a => a.AwardName).sort((a, b) => b.Season - a.Season);

  const rows = sorted.map(a => `
    <tr>
      <td>${a.Season || '—'}</td>
      <td><strong>${a.AwardName || '—'}</strong></td>
      <td>${a.AwardType || '—'}</td>
      <td>${a.PlayerName || '—'}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Season</th><th>Award</th><th>Type</th><th>Recipient</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ============================================================
// TOURNAMENT MODULE
// Columns: TournamentID, TournamentName, TournamentSeason,
//          Type, Location, Date, Time, GameNumber,
//          HomeTeam, AwayTeam, Field, HomeScore, AwayScore, Result
// ============================================================

function renderTournamentSchedule(containerId, games, tournamentName = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = games.filter(g => g.HomeTeam || g.AwayTeam);
  if (tournamentName) filtered = filtered.filter(g => g.TournamentName === tournamentName);
  filtered.sort((a, b) => {
    const gameA = parseInt(a.GameNumber || 999);
    const gameB = parseInt(b.GameNumber || 999);
    return gameA - gameB || new Date(a.Date) - new Date(b.Date);
  });

  if (filtered.length === 0) {
    showEmpty(containerId, '🏆', 'No games scheduled yet', 'Add tournament games to the Tournament tab.');
    return;
  }

  const rows = filtered.map(g => {
    const hasScore = g.HomeScore !== '' && g.AwayScore !== '';
    return `
      <tr>
        <td style="text-align:center;"><strong>${g.GameNumber || '—'}</strong></td>
        <td>${g.Date ? formatDate(g.Date, 'short') : '—'}</td>
        <td>${g.Time || '—'}</td>
        <td>${g.Field || '—'}</td>
        <td style="text-align:right;">${g.HomeTeam || '—'}</td>
        <td style="text-align:center;font-weight:700;">
          ${hasScore ? `${g.HomeScore} – ${g.AwayScore}` : 'vs.'}
        </td>
        <td>${g.AwayTeam || '—'}</td>
        <td>${g.Result
          ? `<span class="badge badge-${g.Result === 'HomeWin' ? 'blue' : g.Result === 'AwayWin' ? 'gold' : 'gray'}">${g.Result}</span>`
          : hasScore ? '' : '<span class="badge badge-gray">Scheduled</span>'}</td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="text-align:center;">Game</th><th>Date</th><th>Time</th>
            <th>Field</th><th style="text-align:right;">Home</th>
            <th style="text-align:center;">Score</th>
            <th>Away</th><th>Result</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderTournamentStandings(containerId, games, teams = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const completedGames = games.filter(g => g.HomeScore !== '' && g.AwayScore !== '');
  if (completedGames.length === 0) {
    showEmpty(containerId, '📊', 'No completed games yet', 'Standings will update automatically as games are completed.');
    return;
  }

  const standings = {};

  // Get all unique team names from games
  const allTeams = [...new Set([
    ...games.map(g => g.HomeTeam),
    ...games.map(g => g.AwayTeam),
  ].filter(Boolean))];

  allTeams.forEach(team => {
    standings[team] = { team, played:0, wins:0, losses:0, draws:0, gf:0, ga:0, points:0 };
  });

  completedGames.forEach(g => {
    const home = standings[g.HomeTeam];
    const away = standings[g.AwayTeam];
    if (!home || !away) return;

    const hs = parseInt(g.HomeScore || 0);
    const as = parseInt(g.AwayScore || 0);

    home.played++; away.played++;
    home.gf += hs; home.ga += as;
    away.gf += as; away.ga += hs;

    if (hs > as) {
      home.wins++; home.points += 3;
      away.losses++;
    } else if (as > hs) {
      away.wins++; away.points += 3;
      home.losses++;
    } else {
      home.draws++; home.points += 1;
      away.draws++; away.points += 1;
    }
  });

  const sorted = Object.values(standings).sort((a, b) =>
    b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );

  const rows = sorted.map((t, idx) => `
    <tr ${t.team === 'CHS' || t.team.includes('Covington') ? 'style="background:var(--blue-light);"' : ''}>
      <td style="text-align:center;font-weight:700;">${idx + 1}</td>
      <td><strong>${t.team}</strong></td>
      <td style="text-align:center;">${t.played}</td>
      <td style="text-align:center;">${t.wins}</td>
      <td style="text-align:center;">${t.draws}</td>
      <td style="text-align:center;">${t.losses}</td>
      <td style="text-align:center;">${t.gf}</td>
      <td style="text-align:center;">${t.ga}</td>
      <td style="text-align:center;">${t.gf - t.ga}</td>
      <td style="text-align:center;font-weight:700;font-size:1.05rem;">${t.points}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="text-align:center;">#</th><th>Team</th>
            <th style="text-align:center;">P</th>
            <th style="text-align:center;">W</th>
            <th style="text-align:center;">D</th>
            <th style="text-align:center;">L</th>
            <th style="text-align:center;">GF</th>
            <th style="text-align:center;">GA</th>
            <th style="text-align:center;">GD</th>
            <th style="text-align:center;">PTS</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.5rem;">
      P=Played · W=Win · D=Draw · L=Loss · GF=Goals For · GA=Goals Against · GD=Goal Difference · PTS=Points
    </div>`;
}

// ============================================================
// NAVIGATION
// ============================================================

function setActiveSidebarLink(sectionId) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });
}

function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('mobile-open');
}

document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  if (sidebar && !sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
  }
});

// ============================================================
// TOPBAR BUILDER
// ============================================================

function buildTopbar() {
  const role       = getRole();
  const playerName = getSelectedPlayer();
  const topbar     = document.getElementById('topbar');
  if (!topbar) return;

  const userLabel = role === 'coach'
    ? `Coach ${CONFIG.HEAD_COACH.split(' ').pop()}`
    : (playerName ? playerName.split(',')[0] : 'Player / Parent');

  topbar.innerHTML = `
    <div class="topbar-inner">
      <a class="topbar-brand" href="${role === 'coach' ? 'coach.html' : 'player.html'}">
        <img src="${CONFIG.LOGO_URL}"
             alt="Covington Lions Logo"
             class="topbar-logo"
             onerror="this.style.display='none'">
        <div class="topbar-name">
          CHS Boys Soccer
          <span>${CONFIG.SCHOOL_NAME} · ${CONFIG.DISTRICT}</span>
        </div>
      </a>
      <div class="topbar-right">
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Open menu">☰</button>
        <span class="topbar-user">${userLabel}</span>
        <button class="topbar-logout" onclick="logout()">Sign Out</button>
      </div>
    </div>`;
}

// ============================================================
// STARTUP
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildTopbar();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password-input').value;
      const success  = handleLogin(password);
      if (!success) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Incorrect password. Please try again.'; }
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
      }
    });

    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const errorEl = document.getElementById('login-error');
        if (errorEl) errorEl.style.display = 'none';
      });
    }
  }
});
