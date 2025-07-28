-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tasks (title, status) VALUES
('Setup DevOps Pipeline', 'in-progress'),
('Deploy to Kubernetes', 'todo'),
('Setup Monitoring', 'todo'),
('Configure ArgoCD', 'todo');

-- Create index for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
