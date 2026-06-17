const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname);
const DATA_FILE = path.join(__dirname, 'mock_data.json');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Digital Lockbox',
    message: 'Backend API is running.',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/session-log', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(500).json({ error: 'mock_data.json not found' });
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('Failed to load session log data:', error);
    res.status(500).json({ error: 'Failed to read session log data' });
  }
});

app.get('/api/points-summary', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(500).json({ error: 'mock_data.json not found' });
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const sessions = JSON.parse(raw);

    let streak = 0;
    let bestStreak = 0;
    let points = 0;
    let currentStreak = 0;

    sessions.forEach(day => {
      if (day.duration_mins > 0) {
        currentStreak += 1;
      } else {
        currentStreak = 0;
      }
      bestStreak = Math.max(bestStreak, currentStreak);

      let daily = Math.floor(day.duration_mins / 10);
      if (day.emergency_unlock) daily -= 50;
      daily -= day.force_attempts * 10;
      points += daily;
    });

    if (points < 0) points = 0;

    res.json({
      streak: currentStreak,
      bestStreak,
      totalPoints: points,
      daysProcessed: sessions.length
    });
  } catch (error) {
    console.error('Failed to compute points summary:', error);
    res.status(500).json({ error: 'Failed to compute points summary' });
  }
});

app.post('/api/log-session', (req, res) => {
  const newSession = req.body;
  if (!newSession || typeof newSession.duration_mins !== 'number') {
    return res.status(400).json({ error: 'Invalid session payload' });
  }

  try {
    const sessions = fs.existsSync(DATA_FILE)
      ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
      : [];

    newSession.day = newSession.day || sessions.length + 1;
    sessions.push(newSession);
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2), 'utf-8');

    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    console.error('Failed to log session:', error);
    res.status(500).json({ error: 'Failed to persist session data' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
