const overrideState = loadState();
const overrideText = document.getElementById('overrideText');
const overrideBtn = document.getElementById('overrideBtn');

function showEmergencyOverride() {
  const code = '4829';
  overrideText.textContent = `Emergency override code: ${code}. Enter this code on the lockbox keypad to complete the override.`;
}

window.addEventListener('DOMContentLoaded', () => {
  overrideText.textContent = overrideState.user
    ? `Signed in as ${overrideState.profile.name}`
    : 'No signed-in profile found. Sign in first on the home page.';
  overrideBtn.addEventListener('click', showEmergencyOverride);
});
