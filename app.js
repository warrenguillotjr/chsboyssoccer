/* ============================================================
   CHS BOYS SOCCER PROGRAM MANAGEMENT PLATFORM
   app.js — Core Application Logic
   ============================================================ */

// ============================================================
// CONFIGURATION — UPDATE THESE VALUES AS NEEDED
// ============================================================
const CONFIG = {
  // Passwords
  COACH_PASSWORD:  'CHSLionsCoach2026',
  PLAYER_PASSWORD: 'Lions2026',

  // Google Sheets — your database
  // The Sheet ID is the long string in your Google Sheets URL
  SHEET_ID: '19SQp3dGXEkBfPCpPUBjwCSqsSI_AsfJITJFcBllmuq0',

  // Google Calendar ID
  CALENDAR_ID: 'bfef8d3332e21e4920a3058aae7c9850a686fe2a06090f3ccbeb372922f20c67@group.calendar.google.com',

  // Program Info
  PROGRAM_NAME:   'CHS Boys Soccer Program',
  SCHOOL_NAME:    'Covington High School',
  HEAD_COACH:     'Warren Guillot, Jr.',
  DISTRICT:       'District 6-I',
  SEASON:         '2025-2026',

  // Session key used in sessionStorage
  SESSION_KEY: 'chsSoccerRole',
  PLAYER_KEY:  'chsSoccerPlayer',

  // Google Sheets API base URL
  // Using the published CSV export approach — no API key needed
  SHEETS_BASE: 'https://docs.google.com/spreadsheets/d/',
};

// ============================================================
// GOOGLE SHEETS DATA LAYER
// Each function fetches one tab from your Google Sheet as CSV
// and converts it into an array of JavaScript objects
// ============================================================

/**
 * Fetches a tab from Google Sheets and returns array of row objects
 * @param {string} tabName - Exact name of the sheet tab
 * @returns {Promise<Array>} Array of objects keyed by column headers
 */
async function fetchSheetData(tabName) {
  const url = `${CONFIG.SHEETS_BASE}${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${tabName}`);
    const csv = await response.text();
    return parseCSV(csv);
  } catch (err) {
    console.error(`Error fetching sheet tab "${tabName}":`, err);
    return [];
  }
}

/**
 * Writes a row of data to Google Sheets via Google Apps Script Web App
 * NOTE: This requires the Apps Script deployment (we will set that up separately)
 * For now this is a placeholder that logs to console
 */
async function writeSheetData(tabName, rowData) {
  // This will be connected to your Google Apps Script endpoint
  // when we set up the write-back functionality
  console.log(`[WRITE] Tab: ${tabName}`, rowData);
  // Placeholder — returns success for now
  return { success: true };
}

/**
 * Parses a CSV string into an array of objects
 * Handles quoted fields with commas inside them
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
    // Skip completely empty rows
    if (Object.values(row).some(v => v !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parses a single CSV line respecting quoted fields
 */
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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ============================================================
// SESSION MANAGEMENT — LOGIN / LOGOUT
// ============================================================

/**
 * Returns the current user role from session storage
 * Returns null if not logged in
 */
function getRole() {
  return sessionStorage.getItem(CONFIG.SESSION_KEY);
}

/**
 * Returns the currently selected player name (player/parent portal)
 */
function getSelectedPlayer() {
  return sessionStorage.getItem(CONFIG.PLAYER_KEY);
}

/**
 * Sets the user role in session storage
 */
function setRole(role) {
  sessionStorage.setItem(CONFIG.SESSION_KEY, role);
}

/**
 * Sets the selected player in session storage
 */
function setSelectedPlayer(name) {
  sessionStorage.setItem(CONFIG.PLAYER_KEY, name);
}

/**
 * Clears the session and redirects to login
 */
function logout() {
  sessionStorage.removeItem(CONFIG.SESSION_KEY);
  sessionStorage.removeItem(CONFIG.PLAYER_KEY);
  window.location.href = 'index.html';
}

/**
 * Checks if current page requires authentication
 * Redirects to login if not authenticated
 */
function requireAuth(allowedRoles = ['coach', 'player']) {
  const role = getRole();
  if (!role || !allowedRoles.includes(role)) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/**
 * Handles login form submission
 */
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

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'warning' | 'danger' | ''
 * @param {number} duration - Duration in ms (default 3500)
 */
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

/**
 * Shows a loading state inside a container element
 */
function showLoading(containerId, message = 'Loading...') {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `<div class="loading-state"><div class="spinner"></div><span>${message}</span></div>`;
  }
}

/**
 * Shows an empty state inside a container element
 */
function showEmpty(containerId, icon = '📋', title = 'No data yet', message = '') {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        ${message ? `<p>${message}</p>` : ''}
      </div>`;
  }
}

/**
 * Sets up tab switching for a group of tabs
 * @param {string} tabGroupId - ID of the container holding .tab-btn elements
 */
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

  // Activate first tab by default
  if (buttons.length > 0) buttons[0].click();
}

/**
 * Opens a modal by ID
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Closes a modal by ID
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Close modal when clicking the backdrop
 */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ============================================================
// DATE & TIME UTILITIES
// ============================================================

/**
 * Formats a date string into a readable format
 * @param {string} dateStr - Date string (YYYY-MM-DD or similar)
 * @param {string} format - 'short' | 'long' | 'month-day'
 */
function formatDate(dateStr, format = 'long') {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;

  const opts = {
    short:      { month: 'short', day: 'numeric' },
    long:       { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
    'month-day':{ month: 'short', day: 'numeric' },
    full:       { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return date.toLocaleDateString('en-US', opts[format] || opts.long);
}

/**
 * Returns the month abbreviation from a date string
 */
function getMonthAbbr(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short' });
}

/**
 * Returns the day number from a date string
 */
function getDayNumber(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDate();
}

/**
 * Returns true if a date string is in the past
 */
function isPastDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  return date < today;
}

/**
 * Returns true if a date string is today
 */
function isToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Returns how many days until a future date (negative if past)
 */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

// ============================================================
// SCHEDULE MODULE
// ============================================================

/**
 * Renders a list of schedule events into a container
 * @param {string} containerId - ID of the container element
 * @param {Array} events - Array of event objects from Schedule tab
 * @param {object} options - { showPast: bool, limit: number, teamFilter: string }
 */
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

  const html = filtered.map(event => {
    const isChanged   = event.Status === 'Changed';
    const isCancelled = event.Status === 'Cancelled';
    const typeClass   = event.EventType === 'Game' ? 'badge-blue' :
                        event.EventType === 'Practice' ? 'badge-green' :
                        event.EventType === 'Tournament' ? 'badge-gold' : 'badge-gray';

    return `
      <div class="schedule-item ${isChanged ? 'changed' : ''} ${isCancelled ? 'cancelled' : ''}">
        <div class="schedule-date-block">
          <div class="schedule-month">${getMonthAbbr(event.Date)}</div>
          <div class="schedule-day">${getDayNumber(event.Date)}</div>
        </div>
        <div class="schedule-info">
          <div class="schedule-title">${event.EventTitle || ''}
            ${isCancelled ? '<span class="badge badge-red" style="margin-left:6px;font-size:0.65rem;">CANCELLED</span>' : ''}
            ${isChanged   ? '<span class="badge badge-warning" style="margin-left:6px;font-size:0.65rem;">CHANGED</span>' : ''}
          </div>
          <div class="schedule-meta">
            ${event.Time ? `⏰ ${event.Time}` : ''}
            ${event.Location ? ` · 📍 ${event.Location}` : ''}
            ${event.Opponent ? ` · vs. ${event.Opponent}` : ''}
          </div>
          ${event.ChangeNote ? `<div class="schedule-meta" style="color:var(--warning);margin-top:2px;">⚠ ${event.ChangeNote}</div>` : ''}
        </div>
        <div class="schedule-tag">
          <span class="badge ${typeClass}">${event.EventType || 'Event'}</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

// ============================================================
// AVAILABILITY MODULE
// ============================================================

/**
 * Renders availability response cards for a player
 * @param {string} containerId - Container element ID
 * @param {Array} events - Upcoming events
 * @param {Array} responses - Existing availability responses
 * @param {string} playerName - The selected player's name
 */
function renderAvailabilityCards(containerId, events, responses, playerName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upcoming = events.filter(e =>
    e.Date && !isPastDate(e.Date) &&
    (e.EventType === 'Game' || e.EventType === 'Practice' || e.EventType === 'Tournament')
  ).sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice(0, 10);

  if (upcoming.length === 0) {
    showEmpty(containerId, '📅', 'No upcoming events', 'Availability cards will appear here for upcoming events.');
    return;
  }

  const responseMap = {};
  responses.forEach(r => {
    if (r.PlayerName === playerName) {
      responseMap[r.EventID] = r.Response;
    }
  });

  const html = upcoming.map(event => {
    const currentResponse = responseMap[event.EventID] || '';

    return `
      <div class="avail-event-card">
        <div class="avail-event-date">${formatDate(event.Date, 'long')}</div>
        <div class="avail-event-name">${event.EventTitle}</div>
        <div class="avail-event-loc">${event.Time ? event.Time + ' · ' : ''}${event.Location || ''}</div>
        <div class="avail-btns">
          <button class="avail-btn avail-btn-yes ${currentResponse === 'Available' ? 'selected-yes' : ''}"
            onclick="submitAvailability('${event.EventID}', '${event.EventTitle}', 'Available', this)">
            ✓ Available
          </button>
          <button class="avail-btn avail-btn-no ${currentResponse === 'Unavailable' ? 'selected-no' : ''}"
            onclick="submitAvailability('${event.EventID}', '${event.EventTitle}', 'Unavailable', this)">
            ✕ Unavailable
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

/**
 * Handles availability button click — saves response
 */
async function submitAvailability(eventId, eventTitle, response, buttonEl) {
  const playerName = getSelectedPlayer();
  if (!playerName) { showToast('No player selected. Please log in again.', 'danger'); return; }

  // Clear other selections in this card
  const card = buttonEl.closest('.avail-event-card');
  card.querySelectorAll('.avail-btn').forEach(btn => {
    btn.classList.remove('selected-yes', 'selected-no', 'selected-maybe');
  });

  // Apply selected class
  const classMap = { Available: 'selected-yes', Unavailable: 'selected-no', Unsure: 'selected-maybe' };
  buttonEl.classList.add(classMap[response] || '');

  // Save to sheet
  const rowData = {
    PlayerName: playerName,
    EventID: eventId,
    EventTitle: eventTitle,
    Response: response,
    Timestamp: new Date().toISOString(),
    Reason: '',
  };

  await writeSheetData('Availability', rowData);
  showToast(`Marked as ${response} for ${eventTitle}`, 'success');
}

// ============================================================
// ANNOUNCEMENTS MODULE
// ============================================================

/**
 * Renders announcement cards into a container
 */
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
        <span class="announcement-date">${formatDate(a.Date, 'short')}</span>
        ${a.AlertType ? `<span class="badge badge-gray" style="font-size:0.65rem;">${a.AlertType}</span>` : ''}
      </div>
      <div class="announcement-body">${a.Message}</div>
      ${a.PostedBy ? `<div style="font-size:0.75rem;color:var(--gray-400);margin-top:0.4rem;">— ${a.PostedBy}</div>` : ''}
    </div>`).join('');

  container.innerHTML = html;
}

// ============================================================
// STATS MODULE
// ============================================================

/**
 * Calculates season totals for a player from their stat rows
 */
function calcPlayerSeasonStats(playerStats, playerName) {
  const rows = playerStats.filter(s => s.PlayerName === playerName);
  return rows.reduce((totals, row) => {
    totals.goals        += parseInt(row.Goals        || 0);
    totals.assists      += parseInt(row.Assists       || 0);
    totals.shots        += parseInt(row.Shots         || 0);
    totals.saves        += parseInt(row.Saves         || 0);
    totals.minutesPlayed+= parseInt(row.MinutesPlayed || 0);
    totals.yellowCards  += parseInt(row.YellowCards   || 0);
    totals.redCards     += parseInt(row.RedCards      || 0);
    totals.gamesPlayed  += 1;
    return totals;
  }, { goals:0, assists:0, shots:0, saves:0, minutesPlayed:0, yellowCards:0, redCards:0, gamesPlayed:0 });
}

/**
 * Calculates team season record from match logs
 */
function calcTeamRecord(matchLogs, team = 'Varsity') {
  const teamMatches = matchLogs.filter(m => m.Team === team && m.Result);
  return teamMatches.reduce((rec, m) => {
    if (m.Result === 'W') rec.wins++;
    else if (m.Result === 'L') rec.losses++;
    else if (m.Result === 'T') rec.ties++;
    return rec;
  }, { wins: 0, losses: 0, ties: 0 });
}

// ============================================================
// ROSTER MODULE
// ============================================================

/**
 * Renders a player roster table
 */
function renderRosterTable(containerId, players, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { teamFilter = '', showInactive = false } = options;

  let filtered = players
    .filter(p => p.LastName)
    .filter(p => showInactive || p.ActiveStatus === 'Active')
    .filter(p => !teamFilter || p.Team === teamFilter);

  filtered.sort((a, b) => a.LastName.localeCompare(b.LastName));

  if (filtered.length === 0) {
    showEmpty(containerId, '👤', 'No players found', 'Add players to the Roster to see them here.');
    return;
  }

  const isCoach = getRole() === 'coach';

  const rows = filtered.map(p => `
    <tr>
      <td><strong>${p.JerseyNumber || '—'}</strong></td>
      <td>${p.LastName}, ${p.PreferredName || p.FirstName}</td>
      <td>${p.PrimaryPosition || '—'}</td>
      <td><span class="badge ${p.Team === 'Varsity' ? 'badge-blue' : 'badge-gold'}">${p.Team || '—'}</span></td>
      <td>${p.GradeLevel || '—'}</td>
      ${isCoach ? `<td><span class="badge ${p.ActiveStatus === 'Active' ? 'badge-green' : 'badge-gray'}">${p.ActiveStatus}</span></td>` : ''}
      ${isCoach ? `<td>
        <button class="btn btn-ghost btn-sm" onclick="viewPlayerProfile('${p.PlayerID}')">View</button>
      </td>` : ''}
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Position</th>
            <th>Team</th>
            <th>Grade</th>
            ${isCoach ? '<th>Status</th>' : ''}
            ${isCoach ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ============================================================
// COMPLIANCE MODULE (Coach only)
// ============================================================

/**
 * Returns compliance status color/badge for a player
 */
function complianceStatus(complianceRow) {
  if (!complianceRow) return { label: 'Missing', cls: 'badge-red' };
  const { PhysicalDate, WaiverSigned, ClearanceStatus } = complianceRow;

  if (ClearanceStatus === 'Cleared') return { label: 'Cleared', cls: 'badge-green' };
  if (ClearanceStatus === 'Pending') return { label: 'Pending', cls: 'badge-warning' };
  if (!PhysicalDate || !WaiverSigned) return { label: 'Incomplete', cls: 'badge-red' };
  return { label: 'Review', cls: 'badge-warning' };
}

// ============================================================
// NAVIGATION — SIDEBAR ACTIVE STATE
// ============================================================

/**
 * Sets the active state on the correct sidebar link
 * based on the current page section being viewed
 */
function setActiveSidebarLink(sectionId) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });
}

// ============================================================
// MOBILE MENU TOGGLE
// ============================================================

function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('mobile-open');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  if (sidebar && !sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
  }
});

// ============================================================
// TOPBAR BUILDER — reused across coach.html and player.html
// ============================================================

/**
 * Injects the topbar HTML into an element with id="topbar"
 */
function buildTopbar() {
  const role = getRole();
  const playerName = getSelectedPlayer();
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const userLabel = role === 'coach'
    ? `Coach ${CONFIG.HEAD_COACH.split(' ').pop()}`
    : (playerName || 'Player/Parent');

  topbar.innerHTML = `
    <div class="topbar-inner">
      <a class="topbar-brand" href="${role === 'coach' ? 'coach.html' : 'player.html'}">
        <img src="assets/logo.gif" alt="CHS Lions Logo" class="topbar-logo" onerror="this.style.display='none'">
        <div class="topbar-name">
          CHS Boys Soccer
          <span>${CONFIG.SCHOOL_NAME} · ${CONFIG.DISTRICT}</span>
        </div>
      </a>
      <div class="topbar-right">
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Menu">☰</button>
        <span class="topbar-user">${userLabel}</span>
        <button class="topbar-logout" onclick="logout()">Sign Out</button>
      </div>
    </div>`;
}

// ============================================================
// STARTUP — runs when the page loads
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Build topbar on any page that has one
  buildTopbar();

  // Handle login form if present
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password-input').value;
      const success = handleLogin(password);
      if (!success) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = 'Incorrect password. Please try again.';
        }
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
      }
    });

    // Hide error when user starts typing again
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const errorEl = document.getElementById('login-error');
        if (errorEl) errorEl.style.display = 'none';
      });
    }
  }
});
