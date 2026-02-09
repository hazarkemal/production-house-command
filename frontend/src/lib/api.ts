const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Agent {
  id: string;
  name: string;
  level: string;
  model: string;
  emoji: string;
  role: string;
  status: string;
  hasSoul: boolean;
  hasMemory: boolean;
  config?: Record<string, any>;
}

export interface AgentDetail {
  id: string;
  soul: string | null;
  memory: string | null;
  config?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'in_progress' | 'review' | 'done';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  logs: { timestamp: string; message: string }[];
}

export interface Activity {
  id: string;
  agent: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  lead: string;
  status: 'active' | 'planning' | 'completed' | 'paused';
  progress: number;
  createdAt: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// ============ AGENTS ============

export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/api/agents`);
  return res.json();
}

export async function getAgent(id: string): Promise<AgentDetail> {
  const res = await fetch(`${API_BASE}/api/agents/${id}`);
  return res.json();
}

export async function updateAgentSoul(id: string, content: string) {
  const res = await fetch(`${API_BASE}/api/agents/${id}/soul`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function updateAgentMemory(id: string, content: string) {
  const res = await fetch(`${API_BASE}/api/agents/${id}/memory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function updateAgentStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/api/agents/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function getAgentLogs(id: string, limit = 100): Promise<LogEntry[]> {
  const res = await fetch(`${API_BASE}/api/agents/${id}/logs?limit=${limit}`);
  return res.json();
}

// ============ TASKS ============

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`);
  return res.json();
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function addTaskLog(id: string, message: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}

// ============ ACTIVITY ============

export async function getActivity(limit = 50, agent?: string): Promise<Activity[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (agent) params.append('agent', agent);
  const res = await fetch(`${API_BASE}/api/activity?${params}`);
  return res.json();
}

export async function logActivity(agent: string, action: string, details: string) {
  const res = await fetch(`${API_BASE}/api/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent, action, details })
  });
  return res.json();
}

// ============ DISPATCH ============

export async function dispatchTask(agent: string, task: string, message?: string) {
  const res = await fetch(`${API_BASE}/api/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent, task, message })
  });
  return res.json();
}

// ============ PROJECTS ============

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`);
  return res.json();
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

// ============ SYSTEM ============

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}
