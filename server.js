const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files (index.html, coder.html, live.html)

let esp32Socket = null;

wss.on('connection', (ws) => {
  console.log('Client connected');
  esp32Socket = ws;

  ws.on('message', (message) => {
    // Relay live typing data to ESP32
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
      esp32Socket.send(message);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws === esp32Socket) esp32Socket = null;
  });
});

// API endpoints to match ESP32 routes
app.post('/submit', (req, res) => {
  if (esp32Socket) esp32Socket.send(JSON.stringify({ endpoint: '/submit', data: req.body }));
  res.json({ status: 'received' });
});

app.get('/start', (req, res) => {
  if (esp32Socket) esp32Socket.send(JSON.stringify({ endpoint: '/start' }));
  res.json({ status: 'started' });
});

app.get('/pause', (req, res) => {
  if (esp32Socket) esp32Socket.send(JSON.stringify({ endpoint: '/pause' }));
  res.json({ status: 'paused' });
});

app.get('/submit-shortcut', (req, res) => {
  if (esp32Socket) esp32Socket.send(JSON.stringify({ endpoint: '/submit-shortcut' }));
  res.json({ status: 'shortcut_sent' });
});

app.get('/speed-history', (req, res) => {
  if (esp32Socket) esp32Socket.send(JSON.stringify({ endpoint: '/speed-history' }));
  // Note: Speed history requires ESP32 to send data back; implement as needed
  res.json([0]); // Placeholder
});

server.listen(3000, () => console.log('Server running on port 3000'));
