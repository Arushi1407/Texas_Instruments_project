const state = loadState();
const displayName = document.getElementById('displayName');
const displayAvatar = document.getElementById('displayAvatar');
const roleLabel = document.getElementById('roleLabel');
const petNameEl = document.getElementById('petName');
const petImage = document.getElementById('petImage');
const petStageLabel = document.getElementById('petStageLabel');
const petProgress = document.getElementById('petProgress');
const petProgressText = document.getElementById('petProgressText');
const focusStreak = document.getElementById('focusStreak');
const dailyStreak = document.getElementById('dailyStreak');
const coins = document.getElementById('coins');
const hoursFocused = document.getElementById('hoursFocused');
const timerDisplay = document.getElementById('timerDisplay');
const overlay = document.getElementById('overlay');
let timerId = null;
let timerSeconds = 1500;

function renderDashboard() {
  displayName.textContent = state.profile.name || 'Focus Star';
  displayAvatar.textContent = (state.profile.name || 'F').charAt(0).toUpperCase();
  roleLabel.textContent = state.profile.role;
  petNameEl.textContent = state.pet.name;
  petImage.src = getPetImage(state.pet.stage);
  petStageLabel.textContent = `${state.pet.stage < 4 ? ['Egg', 'Sprout', 'Bloom', 'Guardian'][state.pet.stage] : 'Guardian'} · Stage ${state.pet.stage + 1}`;
  petProgress.style.width = `${Math.round(state.pet.progress * 100)}%`;
  petProgressText.textContent = `Finish a session to help ${state.pet.name} grow.`;
  focusStreak.textContent = state.focusStreak;
  dailyStreak.textContent = state.dailyStreak;
  coins.textContent = state.coins;
  hoursFocused.textContent = state.hoursFocused;
  document.getElementById('overlayTask').textContent = state.currentTask;
  document.getElementById('overlayCoins').textContent = `+${Math.max(10, Math.round(state.pet.progress * 12))}`;
}

function openOverlay() {
  overlay.classList.remove('hidden');
  timerSeconds = 1500;
  updateTimerDisplay();
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      completeSession();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function closeOverlay() {
  overlay.classList.add('hidden');
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const seconds = String(timerSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function completeSession() {
  if (timerId) clearInterval(timerId);
  closeOverlay();
  state.focusStreak += 1;
  state.dailyStreak = Math.min(state.dailyStreak + 1, 7);
  state.coins += 10;
  state.hoursFocused = Math.round((state.hoursFocused + 0.5) * 10) / 10;
  state.pet.progress += 0.3;
  if (state.pet.progress >= 1 && state.pet.stage < 3) {
    state.pet.stage += 1;
    state.pet.progress = 0.2;
  }
  saveState(state);
  renderDashboard();
  alert('Session complete! Your pet is growing and your streak is stronger.');
}

function renamePet() {
  const nextName = prompt('Rename your pet', state.pet.name);
  if (nextName) {
    state.pet.name = nextName.trim().slice(0, 14) || state.pet.name;
    saveState(state);
    renderDashboard();
  }
}

window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;
window.completeSession = completeSession;
window.renamePet = renamePet;

renderDashboard();
