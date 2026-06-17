const storageKey = 'focus-buddy-lockbox-state';

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try { return JSON.parse(raw); } catch (error) { console.warn('Failed to parse saved state.', error); }
  }
  return {
    mode: 'signup',
    user: null,
    profile: { name: 'Focus Star', role: 'Student', avatar: 'F' },
    currentTask: 'Homework',
    focusStreak: 3,
    dailyStreak: 1,
    coins: 18,
    hoursFocused: 7,
    pet: { name: 'Aura', stage: 0, progress: 0.25 },
  };
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getPetImage(stage) {
  const stages = ['pet-common', 'pet-rare', 'pet-epic', 'pet-legendary'];
  const index = Math.min(Math.max(stage, 0), stages.length - 1);
  return `assets/${stages[index]}.png`;
}

function highlightActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === page || (href === 'index.html' && page === ''));
  });
}

window.addEventListener('DOMContentLoaded', highlightActiveNav);
