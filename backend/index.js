const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const WORKSPACE = process.env.WORKSPACE || '/Users/hazar/.openclaw/workspace';
const AGENTS_DIR = path.join(WORKSPACE, 'agents');
const AGENTS_CONFIG_DIR = '/Users/hazar/.openclaw/agents';
const DATA_DIR = path.join(WORKSPACE, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const AGENT_STATUS_FILE = path.join(DATA_DIR, 'agent-status.json');

function loadJSON(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return defaultValue;
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize files
if (!fs.existsSync(TASKS_FILE)) saveJSON(TASKS_FILE, []);
if (!fs.existsSync(ACTIVITY_FILE)) saveJSON(ACTIVITY_FILE, []);
if (!fs.existsSync(AGENT_STATUS_FILE)) saveJSON(AGENT_STATUS_FILE, {});

// ============ AGENTS API ============

app.get('/api/agents', (req, res) => {
  const agents = [];
  const agentDirs = ['dev', 'infra', 'qa', 'research', 'social', 'writer', 'designer', 'finance', 'accounts'];
  
  for (const dir of agentDirs) {
    const soulPath = path.join(AGENTS_DIR, dir, 'SOUL.md');
    const memoryPath = path.join(AGENTS_DIR, dir, 'MEMORY.md');
    const configPath = path.join(AGENTS_CONFIG_DIR, `${dir}.json`);
    
    let soul = '', config = {};
    
    try { soul = fs.readFileSync(soulPath, 'utf8'); } catch (e) {}
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
    
    // Parse SOUL.md for metadata (strip markdown formatting)
    const clean = (s) => s ? s.trim().replace(/\*\*/g, '').replace(/\*/g, '') : '';
    const emojiMatch = soul.match(/Emoji:\s*(.+)/i);
    const roleMatch = soul.match(/Role:\s*(.+)/i);
    const modelMatch = soul.match(/Model:\s*(.+)/i);
    const levelMatch = soul.match(/Level:\s*(.+)/i);
    
    // Get status
    const statuses = loadJSON(AGENT_STATUS_FILE, {});
    const status = statuses[dir] || 'offline';
    
    agents.push({
      id: dir,
      name: dir.charAt(0).toUpperCase() + dir.slice(1),
      level: levelMatch ? clean(levelMatch[1]) : config.level || 'L1',
      model: modelMatch ? clean(modelMatch[1]) : config.model || 'claude-sonnet-4',
      emoji: emojiMatch ? clean(emojiMatch[1]) : '🤖',
      role: roleMatch ? clean(roleMatch[1]) : config.capabilities?.join(', ') || 'Agent',
      status: status,
      hasSoul: fs.existsSync(soulPath),
      hasMemory: fs.existsSync(memoryPath),
      config: config
    });
  }
  
  res.json(agents);
});

app.get('/api/agents/:id', (req, res) => {
  const { id } = req.params;
  const soulPath = path.join(AGENTS_DIR, id, 'SOUL.md');
  const memoryPath = path.join(AGENTS_DIR, id, 'MEMORY.md');
  const configPath = path.join(AGENTS_CONFIG_DIR, `${id}.json`);
  
  let soul = '', memory = '', config = {};
  
  try { soul = fs.readFileSync(soulPath, 'utf8'); } catch (e) {}
  try { memory = fs.readFileSync(memoryPath, 'utf8'); } catch (e) {}
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
  
  res.json({ id, soul, memory, config });
});

app.put('/api/agents/:id/soul', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const soulPath = path.join(AGENTS_DIR, id, 'SOUL.md');
  
  fs.writeFileSync(soulPath, content);
  logActivity(id, 'config_updated', 'SOUL.md updated');
  res.json({ success: true });
});

app.put('/api/agents/:id/memory', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const memoryPath = path.join(AGENTS_DIR, id, 'MEMORY.md');
  
  fs.writeFileSync(memoryPath, content);
  logActivity(id, 'memory_updated', 'MEMORY.md updated');
  res.json({ success: true });
});

app.put('/api/agents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const statuses = loadJSON(AGENT_STATUS_FILE, {});
  statuses[id] = status;
  saveJSON(AGENT_STATUS_FILE, statuses);
  
  logActivity(id, 'status_changed', `Status changed to ${status}`);
  res.json({ success: true });
});

// ============ TASKS API ============

app.get('/api/tasks', (req, res) => {
  const tasks = loadJSON(TASKS_FILE, []);
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, assignee, priority, dueDate } = req.body;
  
  const tasks = loadJSON(TASKS_FILE, []);
  const task = {
    id: Date.now().toString(),
    title,
    description: description || '',
    assignee,
    priority: priority || 'medium',
    status: 'queued',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logs: []
  };
  
  tasks.unshift(task);
  saveJSON(TASKS_FILE, tasks);
  
  logActivity(assignee, 'task_assigned', `Task: ${title}`);
  logActivity('john', 'task_created', `Assigned "${title}" to ${assignee}`);
  
  res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const tasks = loadJSON(TASKS_FILE, []);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const oldStatus = tasks[taskIndex].status;
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
  saveJSON(TASKS_FILE, tasks);
  
  if (updates.status && updates.status !== oldStatus) {
    logActivity(tasks[taskIndex].assignee, 'task_status', `Task "${tasks[taskIndex].title}" → ${updates.status}`);
  }
  
  res.json(tasks[taskIndex]);
});

app.post('/api/tasks/:id/log', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  const tasks = loadJSON(TASKS_FILE, []);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  task.logs.push({
    timestamp: new Date().toISOString(),
    message
  });
  task.updatedAt = new Date().toISOString();
  saveJSON(TASKS_FILE, tasks);
  
  res.json(task);
});

// ============ ACTIVITY API ============

function logActivity(agent, action, details) {
  const activities = loadJSON(ACTIVITY_FILE, []);
  activities.unshift({
    id: Date.now().toString(),
    agent,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 500 activities
  if (activities.length > 500) {
    activities.length = 500;
  }
  
  saveJSON(ACTIVITY_FILE, activities);
}

app.get('/api/activity', (req, res) => {
  const { limit = 50, agent } = req.query;
  let activities = loadJSON(ACTIVITY_FILE, []);
  
  if (agent) {
    activities = activities.filter(a => a.agent === agent);
  }
  
  res.json(activities.slice(0, parseInt(limit)));
});

app.post('/api/activity', (req, res) => {
  const { agent, action, details } = req.body;
  logActivity(agent, action, details);
  res.json({ success: true });
});

// ============ AGENT LOGS API ============

app.get('/api/agents/:id/logs', (req, res) => {
  const { id } = req.params;
  const { limit = 100 } = req.query;
  
  const logDir = path.join(AGENTS_DIR, id, 'memory');
  const logs = [];
  
  // Get today's log
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logDir, `${today}.md`);
  
  try {
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        const match = line.match(/\[(\d{2}:\d{2}:\d{2})\]\s*(\w+):\s*(.*)/);
        if (match) {
          logs.push({
            timestamp: match[1],
            level: match[2].toLowerCase(),
            message: match[3]
          });
        }
      });
    }
  } catch (e) {}
  
  // Also get from activity feed
  const activities = loadJSON(ACTIVITY_FILE, []).filter(a => a.agent === id);
  activities.slice(0, 20).forEach(a => {
    logs.push({
      timestamp: new Date(a.timestamp).toLocaleTimeString('en-GB'),
      level: 'info',
      message: `${a.action}: ${a.details}`
    });
  });
  
  res.json(logs.slice(0, parseInt(limit)));
});

// ============ DISPATCH API ============

app.post('/api/dispatch', (req, res) => {
  const { agent, task, message } = req.body;
  
  // Update agent status
  const statuses = loadJSON(AGENT_STATUS_FILE, {});
  statuses[agent] = 'busy';
  saveJSON(AGENT_STATUS_FILE, statuses);
  
  logActivity(agent, 'task_started', `Working on: ${task || message}`);
  logActivity('john', 'dispatched', `Dispatched task to ${agent}`);
  
  // In a real implementation, this would use sessions_spawn
  // For now, we log the intent
  res.json({ 
    success: true, 
    message: `Task dispatched to ${agent}`,
    note: 'Agent will execute via sessions_spawn'
  });
});

// ============ PROJECTS API ============

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
if (!fs.existsSync(PROJECTS_FILE)) {
  saveJSON(PROJECTS_FILE, [
    {
      id: '1',
      name: 'Command Center',
      description: 'Central dashboard for managing all agents',
      status: 'active',
      lead: 'dev',
      progress: 85,
      createdAt: new Date().toISOString()
    }
  ]);
}

app.get('/api/projects', (req, res) => {
  res.json(loadJSON(PROJECTS_FILE, []));
});

app.post('/api/projects', (req, res) => {
  const { name, description, lead, status } = req.body;
  const projects = loadJSON(PROJECTS_FILE, []);
  
  const project = {
    id: Date.now().toString(),
    name,
    description: description || '',
    lead: lead || 'dev',
    status: status || 'planning',
    progress: 0,
    createdAt: new Date().toISOString()
  };
  
  projects.unshift(project);
  saveJSON(PROJECTS_FILE, projects);
  
  logActivity(lead, 'project_created', `New project: ${name}`);
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const projects = loadJSON(PROJECTS_FILE, []);
  const idx = projects.findIndex(p => p.id === id);
  
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  
  projects[idx] = { ...projects[idx], ...updates };
  saveJSON(PROJECTS_FILE, projects);
  
  res.json(projects[idx]);
});

// ============ HEALTH ============

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: 9,
    version: '2.0.0'
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Command Center API running on port ${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
  console.log(`Agents: ${AGENTS_DIR}`);
});
