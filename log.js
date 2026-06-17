const logState = loadState();
const sessionLogTable = document.getElementById('sessionLogTable');
const summaryStreak = document.getElementById('summaryStreak');
const summaryBestStreak = document.getElementById('summaryBestStreak');
const summaryPoints = document.getElementById('summaryPoints');
const summaryDays = document.getElementById('summaryDays');

function formatDuration(minutes) {
  if (minutes === 0) return 'Skipped';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim();
}

function renderSessionLog(sessions) {
  const rows = sessions.map(item => `
    <tr class="${item.emergency_unlock ? 'emergency' : ''}">
      <td>${item.day || '—'}</td>
      <td>${item.start_time}</td>
      <td>${item.end_time}</td>
      <td>${formatDuration(item.duration_mins)}</td>
      <td>${item.emergency_unlock ? 'Yes' : 'No'}</td>
      <td>${item.force_attempts || 0}</td>
    </tr>
  `).join('');

  sessionLogTable.querySelector('tbody').innerHTML = rows;
}

async function refreshLogData() {
  try {
    const response = await fetch('/api/session-log');
    if (!response.ok) throw new Error('Unable to load session data');
    const sessions = await response.json();
    renderSessionLog(sessions);
    let currentStreak = 0;
    let bestStreak = 0;
    sessions.forEach(item => {
      if (item.duration_mins > 0) {
        currentStreak += 1;
      } else {
        currentStreak = 0;
      }
      bestStreak = Math.max(bestStreak, currentStreak);
    });
    summaryStreak.textContent = currentStreak;
    summaryBestStreak.textContent = bestStreak;
    summaryPoints.textContent = sessions.reduce((total, item) => {
      let daily = Math.floor(item.duration_mins / 10);
      if (item.emergency_unlock) daily -= 50;
      daily -= item.force_attempts * 10;
      return total + daily;
    }, 0);
    summaryDays.textContent = sessions.length;
  } catch (error) {
    sessionLogTable.querySelector('tbody').innerHTML = '<tr><td colspan="6">Unable to load session log.</td></tr>';
    summaryStreak.textContent = '—';
    summaryBestStreak.textContent = '—';
    summaryPoints.textContent = '—';
    summaryDays.textContent = '—';
    console.warn(error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  refreshLogData();
});
