const request = require('supertest');
const app = require('../src/server');

describe('Task Board API', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  it('should get tasks', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new task', async () => {
    const newTask = { title: 'Test Task', status: 'todo' };
    
    const response = await request(app)
      .post('/api/tasks')
      .send(newTask)
      .expect(201);
    
    expect(response.body.title).toBe('Test Task');
    expect(response.body.id).toBeDefined();
  });
});
