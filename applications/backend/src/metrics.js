const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'taskboard_',
});

// Custom metrics for your Task Board
const httpDuration = new promClient.Histogram({
  name: 'taskboard_http_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const taskCounter = new promClient.Counter({
  name: 'taskboard_tasks_total',
  help: 'Total number of tasks created',
  labelNames: ['status']
});

const activeUsers = new promClient.Gauge({
  name: 'taskboard_active_users',
  help: 'Number of active users'
});

const tasksByStatus = new promClient.Gauge({
  name: 'taskboard_tasks_by_status',
  help: 'Number of tasks by status',
  labelNames: ['status']
});

// Register metrics
register.registerMetric(httpDuration);
register.registerMetric(taskCounter);
register.registerMetric(activeUsers);
register.registerMetric(tasksByStatus);

module.exports = {
  register,
  httpDuration,
  taskCounter,
  activeUsers,
  tasksByStatus
};
