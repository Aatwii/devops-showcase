const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { register, httpDuration, taskCounter, tasksByStatus } = require('./metrics');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    httpDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode)
      .observe(duration);
  });
  next();
});

// In-memory storage for demo
let tasks = [
  { id: 1, title: 'Setup DevOps Pipeline', status: 'in-progress', created_at: new Date() },
  { id: 2, title: 'Deploy to Kubernetes', status: 'done', created_at: new Date() },
  { id: 3, title: 'Setup Monitoring', status: 'in-progress', created_at: new Date() },
  { id: 4, title: 'Configure Grafana', status: 'todo', created_at: new Date() }
];
let nextId = 5;

// Function to update task metrics
function updateTaskMetrics() {
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  Object.keys(statusCounts).forEach(status => {
    tasksByStatus.labels(status).set(statusCounts[status]);
  });
}

// Initialize metrics
updateTaskMetrics();

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime()
  });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, status = 'todo' } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: nextId++,
    title,
    status,
    created_at: new Date()
  };
  
  tasks.push(newTask);
  taskCounter.labels(status).inc();
  updateTaskMetrics();
  
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, status } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (title) tasks[taskIndex].title = title;
  if (status) tasks[taskIndex].status = status;
  tasks[taskIndex].updated_at = new Date();
  
  updateTaskMetrics();
  
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  updateTaskMetrics();
  
  res.status(204).send();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
