// simulator.js

// Global State
let currentDayIndex = 0;
let streak = 0;
let totalPoints = 0;
let simulationData = [];

// DOM Elements
const uiStreak = document.getElementById('ui-streak');
const uiPoints = document.getElementById('ui-points');
const logTbody = document.getElementById('log-tbody');

// The simulation interval: 90 seconds (90000 ms)
const SIMULATION_INTERVAL_MS = 90000;

async function initSimulator() {
  try {
    // 1. Fetch the mock data
    const response = await fetch('mock_data.json');
    if (!response.ok) throw new Error('Failed to load mock_data.json');
    
    simulationData = await response.json();
    console.log(`Loaded ${simulationData.length} days of simulation data.`);
    
    // 2. Process the first day immediately
    if (simulationData.length > 0) {
      processNextDay();
    }

    // 3. Start the timer to simulate the passage of days
    const simInterval = setInterval(() => {
      if (currentDayIndex < simulationData.length) {
        processNextDay();
      } else {
        console.log("Simulation complete: All days processed.");
        clearInterval(simInterval);
      }
    }, SIMULATION_INTERVAL_MS);

  } catch (error) {
    console.error("Simulation Initialization Error:", error);
  }
}

function processNextDay() {
  const dayData = simulationData[currentDayIndex];
  
  // -- Math: Streaks --
  // Add 1 if duration > 0. Reset to 0 if duration is 0.
  if (dayData.duration_mins > 0) {
    streak += 1;
  } else {
    streak = 0;
  }

  // -- Math: Points --
  // +1 for every 10 mins
  let pointsChange = Math.floor(dayData.duration_mins / 10);
  
  // -50 if emergency_unlock
  if (dayData.emergency_unlock) {
    pointsChange -= 50;
  }

  // -10 for every force_attempt
  if (dayData.force_attempts > 0) {
    pointsChange -= (dayData.force_attempts * 10);
  }

  // Apply change and ensure we don't drop below 0
  totalPoints += pointsChange;
  if (totalPoints < 0) {
    totalPoints = 0;
  }

  // -- Update the UI Dashboards --
  uiStreak.innerText = streak;
  uiPoints.innerText = totalPoints;

  // -- Update the Session Log Table --
  appendLogEntry(dayData);

  // Move to the next day for the next tick
  currentDayIndex++;
}

function appendLogEntry(dayData) {
  const tr = document.createElement('tr');
  
  // If the user did an emergency unlock or forced the box, highlight the row red
  if (dayData.emergency_unlock || dayData.force_attempts > 0) {
    tr.classList.add('alert');
  }

  const tdDay = document.createElement('td');
  tdDay.innerText = `Day ${currentDayIndex + 1}`;
  
  const tdDuration = document.createElement('td');
  tdDuration.innerText = dayData.duration_mins;

  const tdEmergency = document.createElement('td');
  tdEmergency.innerText = dayData.emergency_unlock ? 'YES' : 'NO';

  const tdForce = document.createElement('td');
  tdForce.innerText = dayData.force_attempts;

  tr.appendChild(tdDay);
  tr.appendChild(tdDuration);
  tr.appendChild(tdEmergency);
  tr.appendChild(tdForce);

  // Prepend so the newest day is always at the top of the list
  logTbody.prepend(tr);
}

// Start simulation once the window is loaded
window.addEventListener('DOMContentLoaded', initSimulator);