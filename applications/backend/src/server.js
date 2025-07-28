const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage for demo (replace with PostgreSQL later)
let tasks = [
  { id: 1, title: 'Setup DevOps Pipeline', status: 'in-progress', created_at: new Date() },
  { id: 2, title: 'Deploy to Kubernetes', status: 'todo', created_at: new Date() },
  { id: 3, title: 'Setup Monitoring', status: 'todo', created_at: new Date() }
];
let nextId = 4;

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
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
  
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const metrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${Math.floor(Math.random() * 1000)}

# HELP tasks_total Total number of tasks
# TYPE tasks_total gauge
tasks_total ${tasks.length}

# HELP app_info Application information
# TYPE app_info gauge
app_info{version="${process.env.APP_VERSION || '1.0.0'}"} 1
`;
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
});

module.exports = app;
