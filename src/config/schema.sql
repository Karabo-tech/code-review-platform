CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Reviewer', 'Submitter'))
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Reviewer', 'Submitter')),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_review', 'approved', 'changes_requested')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  line_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_history (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);