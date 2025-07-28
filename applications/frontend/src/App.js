import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await axios.post('/api/tasks', {
        title: newTask,
        status: 'todo'
      });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, {
        status: newStatus
      });
      setTasks(tasks.map(task => 
        task.id === id ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 DevOps Task Board</h1>
        <p>Showcase of Modern CI/CD Pipeline</p>
      </header>

      <form onSubmit={addTask} className="add-task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="task-input"
        />
        <button type="submit" className="add-button">Add Task</button>
      </form>

      <div className="kanban-board">
        {['todo', 'in-progress', 'done'].map(status => (
          <div key={status} className="kanban-column">
            <h3 className={`column-header ${status}`}>
              {status.replace('-', ' ').toUpperCase()} ({getTasksByStatus(status).length})
            </h3>
            <div className="task-list">
              {getTasksByStatus(status).map(task => (
                <div key={task.id} className="task-card">
                  <h4>{task.title}</h4>
                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="delete-button"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="App-footer">
        <p>Built with React + Node.js | Deployed with Kubernetes + ArgoCD</p>
      </footer>
    </div>
  );
}

export default App;
