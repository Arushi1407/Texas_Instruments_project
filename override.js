const overrideState = loadState();
const overrideText = document.getElementById('overrideText');
const overrideBtn = document.getElementById('overrideBtn');
const totpCode = document.getElementById('totp-code');
const timeLeftLabel = document.getElementById('time-left-label');
const ringFill = document.getElementById('ring-fill');
const digitBoxes = [
  document.getElementById('d0'),
  document.getElementById('d1'),
  document.getElementById('d2'),
  document.getElementById('d3'),
  document.getElementById('d4'),
  document.getElementById('d5')
];

const totpSecret = 'JBSWY3DPEHPK3PXP';
const totpPeriod = 30;
let currentTotp = '000000';

function showEmergencyOverride() {
  overrideText.textContent = overrideState.user
    ? `Use code ${currentTotp} on the lockbox keypad now.`
    : 'Sign in on the home page to activate override mode.';
}

function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output = [];
  base32 = base32.replace(/=+$/, '');
  for (const char of base32) {
    const index = alphabet.indexOf(char.toUpperCase());
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

function toHex(value) {
  return value.toString(16).padStart(2, '0');
}

async function hmacSha1(keyBytes, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

function makeCounterBuffer(counter) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter);
  return new Uint8Array(buffer);
}

async function generateTotp(secret, timestamp) {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / totpPeriod);
  const counterBytes = makeCounterBuffer(counter);
  const hmac = await hmacSha1(key, counterBytes);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt = ((hmac[offset] & 0x7f) << 24) |
                  ((hmac[offset + 1] & 0xff) << 16) |
                  ((hmac[offset + 2] & 0xff) << 8) |
                  (hmac[offset + 3] & 0xff);
  return String(codeInt % 1000000).padStart(6, '0');
}

async function updateTotp() {
  try {
    const now = Math.floor(Date.now() / 1000);
    currentTotp = await generateTotp(totpSecret, now);
    totpCode.textContent = currentTotp;
    currentTotp.split('').forEach((digit, index) => {
      if (digitBoxes[index]) digitBoxes[index].textContent = digit;
    });
    const remaining = totpPeriod - (now % totpPeriod);
    timeLeftLabel.textContent = `${remaining}s`;    
    const circumference = 2 * Math.PI * 88;
    const progress = remaining / totpPeriod;
    ringFill.style.strokeDashoffset = `${circumference * (1 - progress)}`;
    ringFill.style.stroke = remaining < 8 ? '#ff9f7f' : '#5ec8ff';
  } catch (error) {
    totpCode.textContent = 'ERROR';
    timeLeftLabel.textContent = 'offline';
    console.error('TOTP update error', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  overrideText.textContent = overrideState.user
    ? `Signed in as ${overrideState.profile.name}`
    : 'No signed-in profile found. Sign in first on the home page.';
  overrideBtn.addEventListener('click', showEmergencyOverride);
  updateTotp();
  setInterval(updateTotp, 1000);
});
