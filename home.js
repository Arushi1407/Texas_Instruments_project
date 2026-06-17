const slides = [
  { title: 'Lock away distraction', body: 'Start each session with a clear goal and stay present on the task at hand.' },
  { title: 'Grow your pet', body: 'Every session helps your pet evolve and unlock new rewards.' },
  { title: 'Keep your streak', body: 'Track progress, earn coins, and build a daily focus habit.' },
];

const suggestedTasks = ['Homework', 'Reading', 'Study session', 'Project work'];

let state = loadState();
const slideList = document.getElementById('slideList');
const currentTaskInput = document.getElementById('currentTask');
const taskChips = document.getElementById('taskChips');
const signupFields = document.getElementById('signupFields');
const submitButton = document.getElementById('submitButton');
const signupToggle = document.getElementById('signupToggle');
const loginToggle = document.getElementById('loginToggle');

function renderSlides() {
  slideList.innerHTML = slides.map(item => `
    <article class="slide-card">
      <h3 class="slide-title">${item.title}</h3>
      <p class="slide-text">${item.body}</p>
    </article>
  `).join('');
}

function renderTaskChips() {
  taskChips.innerHTML = suggestedTasks.map(task => `
    <button type="button" class="chip ${state.currentTask === task ? 'active' : ''}" onclick="setTask('${task}')">${task}</button>
  `).join('');
}

function setMode(mode) {
  state.mode = mode;
  signupToggle.classList.toggle('active', mode === 'signup');
  loginToggle.classList.toggle('active', mode === 'login');
  signupFields.style.display = mode === 'signup' ? 'grid' : 'none';
  submitButton.textContent = mode === 'signup' ? 'Start focusing' : 'Log in';
  saveState(state);
}

function submitForm(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value.trim();

  if (!email || !password || (state.mode === 'signup' && !name)) {
    alert('Complete the form before continuing.');
    return;
  }

  state.user = { email, name: name || 'Focus Star', age: age || '18' };
  state.profile.name = name || 'Focus Star';
  state.profile.avatar = state.profile.name.charAt(0).toUpperCase();
  saveState(state);
  window.location.href = 'dashboard.html';
}

function resetOnboarding() {
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('name').value = '';
  document.getElementById('age').value = '';
  setMode('signup');
}

function setTask(task) {
  state.currentTask = task;
  currentTaskInput.value = task;
  saveState(state);
  renderTaskChips();
}

function setCurrentTask(value) {
  state.currentTask = value;
  saveState(state);
  renderTaskChips();
}

window.setMode = setMode;
window.submitForm = submitForm;
window.resetOnboarding = resetOnboarding;
window.setTask = setTask;

currentTaskInput.addEventListener('input', (event) => setCurrentTask(event.target.value));
renderSlides();
renderTaskChips();
setMode(state.mode);
